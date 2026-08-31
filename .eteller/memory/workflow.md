# eteller workflow (steered)

Wait for the user to steer each phase. Do not auto-run the full pipeline.

## Hard gate A — after base + integration (non-negotiable)

After **Base** and **Integration** clones succeed, the agent must **STOP** and ask the user for their **story** (campaign goal, scope, constraints, preferred waves/tasks/branch names if they have them).

Until the user has given that story in this session (or an explicit follow-up steer):

- Do **not** invent waves, task ids, or branch names
- Do **not** infer a campaign from `CurrentTask/` PROMPTs, AGENT_SPEC maps, branches docs, or “obvious next numbers”
- Do **not** create/push product branches for tasks
- Do **not** fill `orchestration.md` / `wave_plan.md` with guessed work
- Do **not** materialize `waves/` slots
- Do **not** start product coding

Reading `CurrentTask/*AGENT_SPEC*` for later coding law is fine; treating it as a task backlog to execute is not.

## Hard gate B — before each wave (non-negotiable)

Planning, materializing clones, or listing waves in orchestration does **not** authorize starting work on a wave.

Before starting **any** wave (launching task agents, coding in that wave’s slots, or treating that wave as `active`):

1. **STOP** and ask the user explicitly whether to start that wave (name it: e.g. “¿Empezamos wave-1?”).
2. Wait for an explicit user request such as “start wave-1”, “empezar oleada 2”, or equivalent for that wave id.
3. Only then set `active_wave`, assign agents, and code in that wave’s slots.

Until the user asks to start a given wave:

- Do **not** begin product coding for that wave’s tasks
- Do **not** auto-advance to the next wave when the previous one closes
- Do **not** start wave N+1 because wave N finished, because clones exist, or because the plan says “next”
- Do **ask again** before every wave, including wave-1 after materialize

Record each “start wave-N” steer in `integration/` `history/` + `worksession.txt`.

## Hard gate C — promote base only after close (non-negotiable)

`base/<repo>/` is **not** the live merge target.

- Merges, builds, IT/smoke, seed/HTML → **`integration/<repo>/`**
- Do **not** `git pull` / reset **`base/`** to pick up mid-wave merges
- After the user confirms the wave is closed/validated: run promote (`.\.eteller\scripts\promote-base-from-integration.ps1`) or equivalent ff-only sync, then record history

## Phases

1. **Config** — fill `.eteller/workspace.config.md` (`REPO_URL`, `INTEGRATION_BRANCH`, branch naming). Clone folder = basename of `REPO_URL`. Refuse empty invention.
2. **Base + Integration** — `.\.eteller\scripts\bootstrap-clones.ps1` creates:
   - `base/<repo>/` on `INTEGRATION_BRANCH` (checkpoint; later only updated on promote)
   - `integration/<repo>/` on `INTEGRATION_BRANCH` (live)
   Seeds empty campaign stubs under `integration/<repo>/.eteller/` if missing (also seed base stubs once if empty).
3. **STOP — user story** — ask the user for the story. End the turn after bootstrap unless they already steered the campaign in the same message. Do not continue into Plan/Branches/Materialize on autopilot.
4. **Plan** — only after the user story: write on **integration** (commit on integration branch when appropriate):
   - `integration/<repo>/.eteller/orchestration.md`
   - `integration/<repo>/.eteller/waves/wave-N/wave_plan.md`
   - After each material prompt/steer: `integration/<repo>/.eteller/history/YYYYMMDDTHHMMSSZ.md` + update `worksession.txt` (see `memory/history.md`)
   Waves/tasks/branches must come from the user’s story (and naming criteria they set). Confirm ambiguous ids/names with the user rather than inventing.
5. **Branches** — exact names the user dictates (match naming criteria). Create/push only after Plan is agreed.
6. **Materialize** — `waves/wave-N/<task-id>/<repo>/` at root; seed clone `.eteller/` from `.eteller/templates/` if missing. Re-run bootstrap only after open tasks exist in orchestration (read orchestration from **integration**). Materialize ≠ start work.
7. **STOP — ask before each wave** — after materialize (and after each wave completes), ask which wave to start; do not enter Work until the user names that wave.
8. **Work** — only for the user-started wave: code in that clone; follow coding law from **integration** AGENT_SPEC (fallback base). **After every milestone/segment**, update clone `.eteller/progress.md` (`[x]`, `percent`, `current_task`, `status`, `updated`) **before** the next segment so the live board can poll. Milestones include coding **and** later PR / review / merge. Commit on the wave-task branch.
9. **Close (PR + review packet)** — Reports → `for_review.md` → `approved.md` starts `false` → open PR → `progress.md` + `state.md` = `awaiting_review` (check PR milestone; **percent &lt; 100**). **Do not merge.** Record steer in integration history + `worksession.txt`.
10. **Code review (hard gate)** — user launches **reviewer** agents ([roles/reviewer.md](roles/reviewer.md)). Reviewer writes `approved.md` **and** updates `progress.md` (Code review milestone; `status: approved` if pass). Task still **not** complete on the board.
11. **Merge** — only if user asks + `approved: true`. Merge into `INTEGRATION_BRANCH`. Pull **`integration/`** only. After merge: check Merge milestone → `status: merged`, `percent: 100`, `finished: true`. **Only then** the task is done on the board. **Do not** update `base/` yet.
12. **Validate in integration** — builds, installer/IT smoke, analytics review, optional seed/HTML — all in **`integration/`**.
13. **STOP — ask before promote base** — when the user confirms wave close/validation: promote `base` ← `integration`, then ask before next wave.
14. **STOP — ask before next wave**

## Models

Task / reviewer subagents: always `model: "cursor-grok-4.5-high"`.

## Roles

| Role | When | Attitude source |
|------|------|-----------------|
| Orchestrator / implementer | Plan, code, Reports, `for_review.md` | `.eteller/AGENTS.md` + this workflow |
| **Reviewer** | User sends agent to review a PR | [`.eteller/memory/roles/reviewer.md`](roles/reviewer.md) (+ Cursor rule `eteller-reviewer` when `for_review.md` / `approved.md` are in scope) |

Reviewer agents must **not** code product features or merge. Implementers must **not** set `approved: true` on their own PR.  
A task is **not** “ready/done” until **merged** — review pass only moves status to `approved`.  
Wave product tree is **not** “closed into base” until promote after validation.

## Commits

- Framework (`.eteller/` wiring, root README/thin AGENTS/rules) → **eteller** remote
- Clone `.eteller/progress|task|state|for_review|approved` → **wave-task branch**
- Integration campaign docs / history / worksession / seed-HTML → **`integration/`** on **integration branch**
- Promote updates `base/` only after user close confirmation
