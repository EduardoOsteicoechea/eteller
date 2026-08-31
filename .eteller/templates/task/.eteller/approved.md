# Merge approval — <task-id>

```
approved: false
reviewer:
reviewed_at:
pr_url:
verdict: blocked
```

## Gate

`approved: false` **blocks** merge. Only a **reviewer**-role agent may set `approved: true` after reading `for_review.md` + the PR diff.

Orchestrator / implementer must **not** merge while this file says `approved: false` (or is missing / stale).

## Findings

- (pending review)

## Decision

Blocked until review completes.
