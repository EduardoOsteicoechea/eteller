# eteller workflow (steered)

Wait for the user to steer each phase. Do not auto-run the full pipeline.

## Phases

1. **Config** — fill `.eteller/workspace.config.md` (`REPO_URL`, `INTEGRATION_BRANCH`, branch naming). Clone folder = basename of `REPO_URL`. Refuse empty invention.
2. **Base** — `.\.eteller\scripts\bootstrap-clones.ps1` or clone `INTEGRATION_BRANCH` into `base/<repo>/` at workspace root.
3. **Plan** — write on base (commit on integration branch):
   - `base/<repo>/.eteller/orchestration.md`
   - `base/<repo>/.eteller/waves/wave-N/wave_plan.md`
4. **Branches** — exact names the user dictates (match naming criteria).
5. **Materialize** — `waves/wave-N/<task-id>/<repo>/` at root; seed clone `.eteller/` from `.eteller/templates/` if missing.
6. **Work** — code in that clone; follow **base** AGENT_SPEC; update clone `.eteller/progress.md` on milestones; commit on wave-task branch.
7. **Close** — Reports → open PR → `state.md` closed. **Do not merge** unless user asks.
8. **Refresh base** — after merge, pull base.

## Models

Task subagents: always `model: "cursor-grok-4.5-high"`.

## Commits

- Framework (`.eteller/` wiring, root README/thin AGENTS/rules) → **eteller** remote
- Clone `.eteller/progress|task|state` → **wave-task branch**
- Base `orchestration.md` / `wave_plan.md` → **integration branch**
