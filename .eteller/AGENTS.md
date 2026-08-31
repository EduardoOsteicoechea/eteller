# eteller — agent entry

Workflow name: **eteller** (not the containing directory name).

Framework home: this `.eteller/` directory. Product clones (`base/`, `waves/`) are generated at the **workspace root**.

Read, in this order:

1. [`memory/README.md`](memory/README.md)
2. [`memory/workflow.md`](memory/workflow.md) — **hard stop after base** and **ask before each wave**
3. [`workspace.config.md`](workspace.config.md) — refuse to invent repo/branch values if empty
4. Campaign docs on product clones (when they exist **and** the user has steered a story):
   - `../base/<repo>/.eteller/orchestration.md`
   - `../base/<repo>/.eteller/waves/wave-N/wave_plan.md`
   - `../base/<repo>/.eteller/history/` + `../base/<repo>/.eteller/worksession.txt`
   - `../waves/wave-N/<task-id>/<repo>/.eteller/{task,state,progress}.md`

`<repo>` = basename of `REPO_URL` (e.g. `…/model-checker-buenos-aires.git` → `model-checker-buenos-aires`).

## Authority

| Concern | Source of truth |
|---------|-----------------|
| How to orchestrate | `.eteller/` rules + memory |
| Campaign goal / waves / tasks / branch names | **User story only** (after base; never invent from PROMPTs or AGENT_SPEC maps) |
| When a wave may start | **Explicit user request** for that wave id (never auto-start) |
| Product coding criteria | `base/<repo>/CurrentTask/*AGENT_SPEC*.md` (read-only) |
| Campaign / wave / task progress | Product branches under clone `.eteller/` |
| Work-session prompt history / reporting | `base/<repo>/.eteller/history/` + `worksession.txt` (integration branch) |

## Hard stops

1. **After base** — stop and ask for the user’s **story**. Do not invent tasks, create branches, fill orchestration with guesses, or materialize `waves/` until that story is given.
2. **Before each wave** — stop and ask whether to start that wave. Do not code in wave slots, launch wave agents, or advance to the next wave until the user explicitly asks (e.g. “start wave-1”). Materialize ≠ permission to start work. Closing wave N does not start wave N+1.

On every material work-session prompt/steer change: append `history/YYYYMMDDTHHMMSSZ.md` and update `worksession.txt` (see [`memory/history.md`](memory/history.md)). Commit on the integration branch.

Never invent a second coding law. Never auto-merge wave-task PRs.
