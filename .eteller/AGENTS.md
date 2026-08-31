# eteller — agent entry

Workflow name: **eteller** (not the containing directory name).

Framework home: this `.eteller/` directory. Product clones (`base/`, `waves/`) are generated at the **workspace root**.

Read, in this order:

1. [`memory/README.md`](memory/README.md)
2. [`memory/workflow.md`](memory/workflow.md)
3. [`workspace.config.md`](workspace.config.md) — refuse to invent repo/branch values if empty
4. Campaign docs on product clones (when they exist):
   - `../base/<repo>/.eteller/orchestration.md`
   - `../base/<repo>/.eteller/waves/wave-N/wave_plan.md`
   - `../waves/wave-N/<task-id>/<repo>/.eteller/{task,state,progress}.md`

`<repo>` = basename of `REPO_URL` (e.g. `…/model-checker-buenos-aires.git` → `model-checker-buenos-aires`).

## Authority

| Concern | Source of truth |
|---------|-----------------|
| How to orchestrate | `.eteller/` rules + memory |
| Product coding criteria | `base/<repo>/CurrentTask/*AGENT_SPEC*.md` (read-only) |
| Campaign / wave / task progress | Product branches under clone `.eteller/` |

Never invent a second coding law. Never auto-merge wave-task PRs.
