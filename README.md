# eteller

Project-agnostic orchestration framework for multi-wave, multi-branch product work.

eteller is the workflow name. The folder you clone into can be anything.

## What eteller does

- Binds to a product repo via local `workspace.config.md`
- Keeps an integration checkout in `base/`
- Materializes wave-task clones under `waves/`
- Tracks campaign/wave/task state in product-owned `.eteller/` docs (on product branches)
- Serves a live progress board that reads those docs from disk
- Enforces a single coding law from the base branch agent spec

eteller itself does **not** store campaign progress on its remote — only the framework (rules, board, scripts, templates).

## Quick start

1. Copy `workspace.config.example.md` → `workspace.config.md` and fill:
   - `REPO_URL`
   - `INTEGRATION_BRANCH`
   - `REPO_DIR_NAME`
   - branch naming criteria
2. Bootstrap:

```powershell
.\scripts\bootstrap-clones.ps1
```

3. Steer planning: write `base/<REPO_DIR_NAME>/.eteller/orchestration.md` and wave plans (commit on the integration branch).
4. Materialize task clones (re-run bootstrap after the orchestration table lists open tasks).
5. Run the board:

```powershell
cd board
npm install
npm run dev
```

## Layout

```
workspace.config.md          # local product binding (gitignored)
base/<repo>/                 # integration branch clone
  CurrentTask/*AGENT_SPEC*   # coding law (read-only for workers)
  .eteller/orchestration.md
  .eteller/waves/wave-N/wave_plan.md
waves/wave-N/<task-id>/<repo>/
  .eteller/task.md
  .eteller/state.md
  .eteller/progress.md       # milestones (live board)
  Reports/<task-id>.txt
board/                       # Astro + React progress SPA
templates/                   # seed files for .eteller docs
```

## Rules of thumb

- Coding criteria: base `CurrentTask` agent spec only
- Milestones: update `.eteller/progress.md` on every milestone, commit on the wave-task branch
- Task complete: update Reports → open PR to integration → mark closed — **never auto-merge**
- Framework changes: commit and push to the eteller remote
- Product clones (`base/`, `waves/`): never commit into eteller

## License

Private / as configured on the remote.
