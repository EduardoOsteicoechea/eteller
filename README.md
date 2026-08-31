# eteller

Project-agnostic orchestration framework for multi-wave, multi-branch product work.

eteller is the workflow name. The folder you clone into can be anything.

Framework wiring lives under **`.eteller/`**. Product clones are generated at the **workspace root** (`base/`, `waves/`).

## What eteller does

- Binds to a product repo via `.eteller/workspace.config.md`
- Keeps an integration checkout in `base/`
- Materializes wave-task clones under `waves/`
- Tracks campaign/wave/task state in product-owned `.eteller/` docs inside those clones
- Serves a live progress board from `.eteller/board/`
- Enforces a single coding law from the base branch agent spec

The clone directory name is always the **repository basename** from `REPO_URL` (no separate config field).

## Quick start

1. Copy `.eteller/workspace.config.example.md` → `.eteller/workspace.config.md` and fill:
   - `REPO_URL`
   - `INTEGRATION_BRANCH`
   - branch naming criteria
2. Bootstrap:

```powershell
.\.eteller\scripts\bootstrap-clones.ps1
```

3. Steer planning: write `base/<repo>/.eteller/orchestration.md` and wave plans (commit on the integration branch).
4. Re-run bootstrap after open tasks are listed.
5. Run the board:

```powershell
cd .eteller\board
npm install
npm run dev
```

## Layout

```
AGENTS.md                    # thin pointer → .eteller/AGENTS.md
README.md
.eteller/
  workspace.config.md        # local product binding (gitignored)
  AGENTS.md, memory/, scripts/, templates/, board/
base/<repo>/                 # integration branch (at root)
  CurrentTask/*AGENT_SPEC*
  .eteller/orchestration.md
  .eteller/waves/wave-N/wave_plan.md
waves/wave-N/<task-id>/<repo>/
  .eteller/task.md|state.md|progress.md
  Reports/<task-id>.txt
```

## Rules of thumb

- Coding criteria: base `CurrentTask` agent spec only
- Milestones: update clone `.eteller/progress.md`, commit on the wave-task branch
- Task complete: Reports → open PR → mark closed — **never auto-merge**
- Framework changes under `.eteller/`: commit and push to the eteller remote
- Never commit `base/` or `waves/` into eteller
