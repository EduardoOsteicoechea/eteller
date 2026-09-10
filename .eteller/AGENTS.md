# eteller — agent entry

Workflow name: **eteller** (not the containing directory name).

Framework home: this `.eteller/` directory. Product clones (`base/`, `integration/`, `waves/`) are generated at the **workspace root**.

Read, in this order:

1. [`memory/README.md`](memory/README.md)
2. [`memory/workflow.md`](memory/workflow.md) — hard stop after base+integration; ask before each wave; **promote base only after close**
3. [`workspace.config.md`](workspace.config.md) — refuse to invent repo/branch values if empty
4. Campaign docs on product clones (when they exist **and** the user has steered a story):
   - `../integration/<repo>/.eteller/orchestration.md` (fallback: `../base/...` if integration not yet seeded)
   - `../integration/<repo>/.eteller/waves/wave-N/wave_plan.md`
   - `../integration/<repo>/.eteller/history/` + `../integration/<repo>/.eteller/worksession.txt`
   - `../waves/wave-N/<task-id>/<repo>/.eteller/{task,state,progress}.md`

`<repo>` = basename of `REPO_URL` (e.g. `…/model-checker-buenos-aires.git` → `model-checker-buenos-aires`).

## Authority

| Concern | Source of truth |
|---------|-----------------|
| How to orchestrate | `.eteller/` rules + memory |
| Campaign goal / waves / tasks / branch names | **User story only** (after base+integration; never invent from PROMPTs or AGENT_SPEC maps) |
| When a wave may start | **Explicit user request** for that wave id (never auto-start) |
| Product coding criteria | `integration/<repo>/CurrentTask/*AGENT_SPEC*.md` (fallback `base/...`; read-only for workers) |
| Live merges / builds / IT / seed-HTML | **`integration/<repo>/`** only |
| Last closed product snapshot | **`base/<repo>/`** — refresh **only after wave close** (user ask + promote) |
| Campaign / wave / task progress | Product branches under clone `.eteller/` (`progress.md` after **each** milestone) |
| Work-session prompt history / reporting | `integration/<repo>/.eteller/history/` + `worksession.txt` |
| Live board | `.eteller/board` → polls clone `progress.md` / `state.md` |

## Hard stops

1. **After base + integration** — stop and ask for the user’s **story**. Do not invent tasks, create branches, fill orchestration with guesses, or materialize `waves/` until that story is given.
2. **Before each wave** — stop and ask whether to start that wave. Do not code in wave slots, launch wave agents, or advance to the next wave until the user explicitly asks (e.g. “start wave-1”). Materialize ≠ permission to start work. Closing wave N does not start wave N+1.
3. **Before promote base** — after merges + validation in `integration/`, stop and ask before updating `base/`.

On every material work-session prompt/steer change: append `history/YYYYMMDDTHHMMSSZ.md` and update `worksession.txt` under **`integration/`** (see [`memory/history.md`](memory/history.md)). Commit on the integration branch from that clone.

Never invent a second coding law. Never auto-merge wave-task PRs. Never treat mid-wave `base/` as the merge target.

## Merge gate (code review + UXReview)

Before any merge of a wave-task PR:

1. Implementer wrote `.eteller/for_review.md` on the task branch
2. A **reviewer**-role agent wrote `.eteller/approved.md` with `approved: true` **and** updated `progress.md` (Code review milestone → `status: awaiting_ux_review`)
3. A **ux-reviewer**-role agent wrote `.eteller/ux_review.md` with `ux_ready: true` (exhaustive UX test steps + subtareas) **and** updated `progress.md` (UX review milestone → `status: ux_ready`)
4. User explicitly asked to merge
5. After merge: pull **`integration/`**; append that slot’s UX checklist + subtareas into `integration/<repo>/.eteller/ux_review/wave-N.md`; `progress.md` / `state.md` → `status: merged`, `percent: 100`, `finished: true`
6. **Do not** update `base/` until user asks to close/promote after validation

A task is **not** done on the live board until **merged**. A wave is **not** promoted into `base/` until close + promote. When the wave’s tasks have all merged, `integration/.../ux_review/wave-N.md` holds the **full** list of wave subtareas + UX steps for validation.

Role contracts: [`memory/roles/reviewer.md`](memory/roles/reviewer.md), [`memory/roles/ux-reviewer.md`](memory/roles/ux-reviewer.md). Implementers must not self-approve code or UX packets.
