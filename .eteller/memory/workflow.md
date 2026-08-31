# eteller workflow (steered)

Wait for the user to steer each phase. Do not auto-run the full pipeline.

## Hard gate (non-negotiable)

After **Base** succeeds, the agent must **STOP** and ask the user for their **story** (campaign goal, scope, constraints, preferred waves/tasks/branch names if they have them).

Until the user has given that story in this session (or an explicit follow-up steer):

- Do **not** invent waves, task ids, or branch names
- Do **not** infer a campaign from `CurrentTask/` PROMPTs, AGENT_SPEC ticket maps, branches docs, or “obvious next numbers”
- Do **not** create/push product branches for tasks
- Do **not** fill `orchestration.md` / `wave_plan.md` with guessed work
- Do **not** materialize `waves/` slots
- Do **not** start product coding

Reading base `CurrentTask/*AGENT_SPEC*` for later coding law is fine; treating it as a task backlog to execute is not.

## Phases

1. **Config** — fill `.eteller/workspace.config.md` (`REPO_URL`, `INTEGRATION_BRANCH`, branch naming). Clone folder = basename of `REPO_URL`. Refuse empty invention.
2. **Base** — `.\.eteller\scripts\bootstrap-clones.ps1` (or clone `INTEGRATION_BRANCH` into `base/<repo>/` at workspace root). Seeds empty campaign stubs under `base/<repo>/.eteller/` if missing.
3. **STOP — user story** — ask the user for the story. End the turn after base unless they already steered the campaign in the same message. Do not continue into Plan/Branches/Materialize on autopilot.
4. **Plan** — only after the user story: write on base (commit on integration branch when appropriate):
   - `base/<repo>/.eteller/orchestration.md`
   - `base/<repo>/.eteller/waves/wave-N/wave_plan.md`
   - After each material prompt/steer: `base/<repo>/.eteller/history/YYYYMMDDTHHMMSSZ.md` + update `worksession.txt` (see `memory/history.md`)
   Waves/tasks/branches must come from the user’s story (and naming criteria they set). Confirm ambiguous ids/names with the user rather than inventing.
5. **Branches** — exact names the user dictates (match naming criteria). Create/push only after Plan is agreed.
6. **Materialize** — `waves/wave-N/<task-id>/<repo>/` at root; seed clone `.eteller/` from `.eteller/templates/` if missing. Re-run bootstrap only after open tasks exist in orchestration.
7. **Work** — code in that clone; follow **base** AGENT_SPEC; update clone `.eteller/progress.md` on milestones; commit on wave-task branch.
8. **Close** — Reports → open PR → `state.md` closed. **Do not merge** unless user asks. Record the steer in base history + `worksession.txt`.
9. **Refresh base** — after merge, pull base; refresh `worksession.txt`.

## Models

Task subagents: always `model: "cursor-grok-4.5-high"`.

## Commits

- Framework (`.eteller/` wiring, root README/thin AGENTS/rules) → **eteller** remote
- Clone `.eteller/progress|task|state` → **wave-task branch**
- Base `orchestration.md` / `wave_plan.md` / `history/` / `worksession.txt` → **integration branch**
