# eteller — agent entry

Workflow name: **eteller** (not the containing directory name).

Read, in this order, before doing work:

1. [`.memory/README.md`](.memory/README.md)
2. [`.memory/workflow.md`](.memory/workflow.md)
3. [`workspace.config.md`](workspace.config.md) — refuse to invent repo/branch values if empty
4. Campaign docs on the product clones (when they exist):
   - `base/<REPO_DIR_NAME>/.eteller/orchestration.md`
   - `base/<REPO_DIR_NAME>/.eteller/waves/wave-N/wave_plan.md`
   - `waves/wave-N/<task-id>/<REPO_DIR_NAME>/.eteller/{task,state,progress}.md`

## Authority

| Concern | Source of truth |
|---------|-----------------|
| How to orchestrate | eteller rules + `.memory/` |
| Product coding criteria | `base/<REPO_DIR_NAME>/CurrentTask/*AGENT_SPEC*.md` (read-only) |
| Campaign / wave / task progress | Product branches under `.eteller/` — not the eteller remote |

Never invent a second coding law in eteller files. Never auto-merge wave-task PRs.
