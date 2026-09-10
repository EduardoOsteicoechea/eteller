# State — <task-id>

| Campo | Valor |
|-------|--------|
| status | `pending` |
| branch | `<branch>` |
| wave | `wave-N` |
| clone | `waves/wave-N/<task-id>/<repo>/` |
| finished | `false` |
| pr_url | |
| review | `none` |
| approved | `false` |
| ux_ready | `false` |
| updated | |
| summary | |

## Status values

| status | Meaning | Board “done”? |
|--------|---------|----------------|
| `pending` | Not started | No |
| `in_progress` | Coding | No |
| `awaiting_review` | PR open; `for_review.md` ready | No |
| `awaiting_ux_review` | Code approved; waiting UXReview checklist | No |
| `ux_ready` | UX checklist ready; wait human merge | No |
| `approved` | Legacy: code approved (treat as awaiting UX) | No |
| `merged` | PR merged to integration | **Yes** |
| `blocked_client` / `blocked*` | Skip coding | No |
| `abandoned` | Explicitly dropped (rare) | No |

`finished: true` **only** when `status: merged` (or `abandoned`).

## Notes

- Merge requires user ask + `approved: true` in `.eteller/approved.md` + `ux_ready: true` in `.eteller/ux_review.md`
- Task is **not** complete at PR open, code review, or UXReview — only after merge
- After merge, orchestrator rolls UX checklist + subtareas into `integration/<repo>/.eteller/ux_review/wave-N.md`
