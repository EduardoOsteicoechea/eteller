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
```

## Milestones

- [ ] Milestone 1 — <describe>
- [ ] Milestone 2 — <describe>
- [ ] Milestone 3 — <describe>
- [ ] Update Reports/<task-id>.txt
- [ ] Write `.eteller/for_review.md`
- [ ] Open PR to integration (`approved.md` = false; no auto-merge)
- [ ] Code review → `.eteller/approved.md` (`approved: true` before merge)

## Live board rule (mandatory)

After **each** milestone/segment completes — **before** starting the next one:

1. Mark that milestone `[x]` under `## Milestones`
2. Set `status` to `in_progress` (or `closed` when fully done)
3. Set `percent` to match completed / total milestones
4. Set `current_task` to the next open milestone (or `done`)
5. Set `updated` to ISO UTC now
6. **Write this file to disk** so the eteller board at `:4321` can poll it

Do not batch all milestones into one late write. The board only updates when this file changes.
