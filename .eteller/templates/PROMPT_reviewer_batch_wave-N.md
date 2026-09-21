# Template — campaign code-review prompt (fill after wave coding)

Copy to `integration/<repo>/.eteller/prompts/PROMPT_reviewer_batch_wave-N_<first>_<last>.md` when **all** wave task PRs are open (`awaiting_review`).  
Orchestrator **must** paste this (or the filled file path + copyable prompt) into chat for the user / another agent.

```markdown
# Campaign review prompt — wave-N (<task-ids>)

**role:** reviewer  
**model:** `cursor-grok-4.5-high`  
**Wave:** wave-N  
**Integration branch:** <INTEGRATION_BRANCH>  
**Repo:** <owner/repo>  
**Workspace root:** <absolute eteller root>

## Role contract (read first)

1. `.eteller/memory/roles/reviewer.md`
2. This prompt
3. Per slot: `.eteller/for_review.md`, `Reports/<id>.*`, PR diff vs integration branch
4. Coding law (read-only): `integration/<repo>/CurrentTask/*AGENT_SPEC*.md` (fallback `base/…`)

## Attitude

- Code review only. Do not implement unless user asks. Do not merge. Do not write `ux_review.md`.
- Prefer a **different** agent than the implementer; same agent only if user explicitly asks.
- Block on regressions / scope creep / invented criteria / missing triple Release when `.cs` changed.
- Do not block solely for missing Revit IT or seed/HTML on the task branch.

##Slots

| id | branch | PR | clone cwd |
|----|--------|-----|-----------|
| <id> | <branch> | <pr-url> | `waves/wave-N/<id>/<repo>/` |

Wave plan: `integration/<repo>/.eteller/waves/wave-N/wave_plan.md`

## Per-slot procedure

1. Review diff vs integration branch + `for_review.md` + Reports
2. Write `approved.md`; update `progress.md` / `state.md` (`awaiting_ux_review` if pass)
3. Commit + push on the wave-task branch

## Chat output

One fenced `md` block: verdict table + blocking findings.

## Out of scope

Merge, UXReview, promote base, next wave, cross-slot edits.
```
