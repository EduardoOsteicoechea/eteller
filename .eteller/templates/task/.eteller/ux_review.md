# UX review — <task-id>

```
ux_ready: false
author:
reviewed_at:
pr_url:
wave: wave-N
```

## Gate

`ux_ready: false` **blocks** merge (together with `approved.md`).  
Only after **code review** (`approved: true`) may a **ux-reviewer** (or orchestrator acting as UXReview) fill this file and set `ux_ready: true`.

Implementers must **not** invent a stub checklist just to unblock merge. The list must be exhaustive for the UX surface this PR changed.

## Scope (what UX this PR touched)

- Screens / panels / dialogs:
- Flows / wizards:
- Empty / error / loading states:
- What was **not** touched (out of scope for this checklist):

## Exhaustive UX test steps

Write concrete, ordered steps a junior can execute without reading the diff. Prefer checkboxes. Cover happy path, edge cases, and regressions for every UX surface above.

- [ ] …
- [ ] …
- [ ] …

## Subtareas / milestones covered (from this slot’s `progress.md`)

Copy the Implement (+ relevant gate) milestones so integration can roll them up later:

- [ ] …
- [ ] …

## Evidence / notes

- How to reach the feature (menu path / command):
- Expected logs / JSON / messages if relevant:
- Blockers or known gaps:

## Decision

Blocked until the checklist is complete and `ux_ready: true`.
