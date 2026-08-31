# Progress — <task-id>

```
slot: <task-id>
ticket: <task-id>
wave: wave-N
branch: <branch>
status: pending
percent: 0
current_task: —
updated:
pr_status:
review: none
approved: false
```

## Status lifecycle (board)

| status | When |
|--------|------|
| `pending` | Not started |
| `in_progress` | Coding / Reports / writing `for_review.md` |
| `awaiting_review` | PR open; review packet ready; **not done** |
| `approved` | Reviewer set `approved.md` → true; waiting human merge; **not done** |
| `merged` | PR merged into integration — **only then the task is complete** |
| `blocked` / `blocked_client` | Skipped |

`percent` = checked milestones / total milestones. **Do not** set `percent: 100` or `status: closed/done` until the **Merge** milestone is `[x]`.

## Milestones

### Implement (coding)

- [ ] Milestone 1 — <describe>
- [ ] Milestone 2 — <describe>
- [ ] Milestone 3 — <describe>
- [ ] Update `Reports/<task-id>.txt`

### PR + review + merge (gate — still part of this task)

- [ ] Write `.eteller/for_review.md`
- [ ] Open PR to integration (`approved.md` starts `approved: false`)
- [ ] Code review complete (`.eteller/approved.md` → `approved: true`) — **reviewer updates this**
- [ ] Merge PR into integration branch — **orchestrator after user ask; only then task is done**

## Live board rule (mandatory)

After **each** milestone/segment completes — **before** starting the next one:

1. Mark that milestone `[x]` under `## Milestones`
2. Set `status` to the lifecycle value above (`merged` only after merge)
3. Set `percent` to match completed / total milestones
4. Set `current_task` to the next open milestone (or `merged` when done)
5. Set `updated` to ISO UTC now
6. Keep `pr_status` / `review` / `approved` in sync with `state.md` / `approved.md`
7. **Write this file to disk** so the eteller board at `:4321` can poll it

**Reviewers** must check off the Code review milestone and bump `percent` / `status` / `current_task` when they write `approved.md`.  
**Orchestrators** must check off Merge and set `status: merged` / `percent: 100` only after the PR is merged.

Do not batch all milestones into one late write. The board only updates when this file changes.
