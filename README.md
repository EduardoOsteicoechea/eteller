# eteller

Project-agnostic orchestration framework for multi-wave, multi-branch product work.

eteller is the workflow name. The folder you clone into can be anything.

Framework wiring lives under **`.eteller/`**. Product clones are generated at the **workspace root** (`base/`, `integration/`, `waves/`).

## What eteller does

- Binds to a product repo via `.eteller/workspace.config.md`
- Keeps **`integration/`** as the live `INTEGRATION_BRANCH` checkout (merges, builds, IT, campaign docs)
- Keeps **`base/`** as the last **closed / promoted** snapshot (updated only after wave close)
- **Stops after base + integration** until you give the campaign story
- **Asks before each wave** — does not start wave work until you say so
- Then materializes wave-task clones under `waves/` from **your** plan
- Tracks campaign/wave/task state in product-owned `.eteller/` docs inside those clones
- Serves a live progress board from `.eteller/board/`
- Enforces a single coding law from `integration/` AGENT_SPEC (fallback `base/`)
- **Code-review gate before merge:** implementer writes `for_review.md`; reviewer agents set `approved.md`

The clone directory name is always the **repository basename** from `REPO_URL` (no separate config field).

## Quick start

1. Copy `.eteller/workspace.config.example.md` → `.eteller/workspace.config.md` and fill:
   - `REPO_URL`
   - `INTEGRATION_BRANCH`
   - branch naming criteria
2. Bootstrap **base + integration**:

```powershell
.\.eteller\scripts\bootstrap-clones.ps1
```

3. **Stop.** Tell the agent your **story** (goal, scope, waves, task ids / branch names). Agents must not invent tasks from `CurrentTask/` on their own.
4. After you steer: write `integration/<repo>/.eteller/orchestration.md` and wave plans (commit on the integration branch from **`integration/`**).
5. Re-run bootstrap after open tasks are listed (creates `waves/` slots). **This does not start work.**
6. When ready, tell the agent which wave to start (e.g. “start wave-1”). Agents must ask before every wave and must not auto-advance.
7. After merges + validation in **`integration/`**, promote base:

```powershell
.\.eteller\scripts\promote-base-from-integration.ps1
```

8. Run the board (optional):

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
base/<repo>/                 # last closed / promoted checkpoint
integration/<repo>/          # live INTEGRATION_BRANCH
  CurrentTask/*AGENT_SPEC*
  .eteller/orchestration.md
  .eteller/waves/wave-N/wave_plan.md
  .eteller/history/
  .eteller/worksession.txt
waves/wave-N/<task-id>/<repo>/
  .eteller/task.md|state.md|progress.md
  .eteller/for_review.md
  .eteller/approved.md
  Reports/<task-id>.txt
```

## Rules of thumb

- After base+integration clone: **ask for the user story** before any wave/task orchestration
- Before each wave: **ask** and wait for an explicit “start wave-N”
- Merges / builds / IT / seed-HTML → **`integration/`** only
- Promote **`base/`** only after wave close (user ask + script)
- Coding criteria: `integration/` AGENT_SPEC (fallback base)
- Each material work-session prompt/steer → `integration/.../.eteller/history/` + `worksession.txt`
- Task complete: Reports → `for_review.md` → open PR → review → **merge only on ask + approved** → pull integration
- Framework changes under `.eteller/`: commit and push to the eteller remote
- Never commit `base/`, `integration/`, or `waves/` into eteller
