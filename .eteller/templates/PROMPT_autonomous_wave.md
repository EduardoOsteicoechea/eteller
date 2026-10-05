# Autonomous wave — orchestrator launch notes

Use when the user opts into **autonomous wave** for the current wave. Fill paths/ids; paste a short copyable block in chat **and** pass the same contract into a background `Task` subagent.

## Code-review Task sketch

```
model: gpt-5.6-terra-medium
role: eteller CODE REVIEWER
clone: waves/wave-N/<task-id>/<repo>/
branch: <feat/…>
PR: <url>
base: <INTEGRATION_BRANCH>

Read: .eteller/for_review.md + diff vs origin/<INTEGRATION_BRANCH>
Write+push: approved.md, progress.md, state.md (awaiting_ux_review if pass)
Do NOT merge. Do NOT set ux_ready.
```

## UXReview Task sketch

```
model: gpt-5.6-terra-medium
role: eteller UXReviewer
clone: waves/wave-N/<task-id>/<repo>/
PR: <url>
Prerequisite: approved.md = true

Write+push: ux_review.md (exhaustive checklist), progress.md, state.md (ux_ready if pass)
Do NOT merge. Do NOT flip approved.md.
```

## Orchestrator after gates

If autonomous steer allowed merge-on-pass: merge → pull integration → rollup `ux_review/wave-N.md` → when wave complete, Release build in integration/ → ask before promote base / next wave.
