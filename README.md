# eteller

Project-agnostic orchestration framework for multi-wave, multi-branch product work.

eteller is the workflow name. The folder you clone into can be anything.

Framework wiring lives under **`.eteller/`**. Product clones are generated at the **workspace root** (`base/`, `waves/`).

## What eteller does

- Binds to a product repo via `.eteller/workspace.config.md`
- Keeps an integration checkout in `base/`
- **Stops after base** until you give the campaign story
- Then materializes wave-task clones under `waves/` from **your** plan
- Tracks campaign/wave/task state in product-owned `.eteller/` docs inside those clones
- Serves a live progress board from `.eteller/board/`
- Enforces a single coding law from the base branch agent spec

The clone directory name is always the **repository basename** from `REPO_URL` (no separate config field).

## Quick start

1. Copy `.eteller/workspace.config.example.md` → `.eteller/workspace.config.md` and fill:
   - `REPO_URL`
   - `INTEGRATION_BRANCH`
   - branch naming criteria
2. Bootstrap **base only**:

```powershell
.\.eteller\scripts\bootstrap-clones.ps1
```

3. **Stop.** Tell the agent your **story** (goal, scope, waves, task ids / branch names). Agents must not invent tasks from `CurrentTask/` on their own.
4. After you steer: write `base/<repo>/.eteller/orchestration.md` and wave plans (commit on the integration branch).
5. Re-run bootstrap after open tasks are listed (creates `waves/` slots).
6. Run the board (optional):

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
  .eteller/history/            # work-session prompt records
  .eteller/worksession.txt     # rolling report for automation
waves/wave-N/<task-id>/<repo>/
  .eteller/task.md|state.md|progress.md
  Reports/<task-id>.txt
```

## Rules of thumb

- After base clone: **ask for the user story** before any wave/task orchestration
- Coding criteria: base `CurrentTask` agent spec only (how to code — not what to invent)
- Each material work-session prompt/steer → `base/.../.eteller/history/` + update `worksession.txt` (commit on integration)
- Milestones: update clone `.eteller/progress.md`, commit on the wave-task branch
- Task complete: Reports → open PR → mark closed — **never auto-merge**
- Framework changes under `.eteller/`: commit and push to the eteller remote
- Never commit `base/` or `waves/` into eteller
