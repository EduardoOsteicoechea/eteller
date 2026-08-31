# eteller workflow (steered)

Wait for the user to steer each phase. Do not auto-run the full pipeline.

## Phases

1. **Config** — fill local `workspace.config.md` (`REPO_URL`, `INTEGRATION_BRANCH`, `REPO_DIR_NAME`, branch naming). Refuse empty invention.
2. **Base** — `.\scripts\bootstrap-clones.ps1` or clone `INTEGRATION_BRANCH` into `base/<REPO_DIR_NAME>/`. Locate `CurrentTask/*AGENT_SPEC*` and QA artifacts.
3. **Plan** — from base AGENT_SPEC + pending work, write:
   - `base/<REPO_DIR_NAME>/.eteller/orchestration.md`
   - `base/<REPO_DIR_NAME>/.eteller/waves/wave-N/wave_plan.md`
   Commit these on the **integration branch**.
4. **Branches** — create remote/local branches with the **exact** names the user dictates (match naming criteria).
5. **Materialize** — under `waves/wave-N/<task-id>/`, clone the task branch; seed `.eteller/` from `templates/` if missing (milestones in `progress.md`).
6. **Work** — implement only in that clone; coding follows **base** AGENT_SPEC; update `.eteller/progress.md` on each milestone; commit on the **wave-task branch**.
7. **Close** — update `Reports/<task-id>.txt` → open PR to `INTEGRATION_BRANCH` → set `state.md` closed with PR URL. **Do not merge** unless the user merges or explicitly prompts merge.
8. **Refresh base** — after merge, pull base and refresh QA/docs.

## Models

Task subagents: always `model: "cursor-grok-4.5-high"`.

## eteller vs product commits

- Framework change → commit + push **eteller**
- `.eteller/progress|task|state` on a worker → commit + push **wave-task branch**
- `orchestration.md` / `wave_plan.md` → commit + push **integration branch**
