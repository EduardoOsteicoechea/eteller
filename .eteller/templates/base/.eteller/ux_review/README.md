# UX review rollup (integration)

After each wave-task PR merges into `INTEGRATION_BRANCH`, the orchestrator appends that slot’s UX checklist and subtareas into:

```
integration/<repo>/.eteller/ux_review/wave-N.md
```

When the whole wave has merged, that file is the **full** list of wave subtareas + exhaustive UX test steps for validation in `integration/`.

Do not invent checklists here — only copy from each task’s `.eteller/ux_review.md` (and milestone rollup from its `progress.md`) at merge time.
