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
| updated | |
| summary | |

## Status values

| status | Meaning | Board “done”? |
|--------|---------|----------------|
| `pending` | Not started | No |
| `in_progress` | Coding | No |
| `awaiting_review` | PR open; `for_review.md` ready | No |
| `approved` | Reviewer approved; wait human merge | No |
| `merged` | PR merged to integration | **Yes** |
| `blocked_client` / `blocked*` | Skip coding | No |
| `abandoned` | Explicitly dropped (rare) | No |

`finished: true` **only** when `status: merged` (or `abandoned`).

## Notes

- Merge requires user ask + `approved: true` in `.eteller/approved.md`
- Task is **not** complete at PR open or review pass — only after merge
-
