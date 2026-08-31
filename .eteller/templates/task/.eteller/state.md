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

| status | Meaning |
|--------|---------|
| `pending` | Not started |
| `in_progress` | Coding |
| `awaiting_review` | PR open; `for_review.md` ready; merge blocked |
| `approved` | Reviewer set `approved.md` → `approved: true` |
| `closed` | Merged or abandoned per user |
| `blocked_client` / `blocked*` | Skip coding |

## Notes

- Merge requires user ask + `approved: true` in `.eteller/approved.md`
-
