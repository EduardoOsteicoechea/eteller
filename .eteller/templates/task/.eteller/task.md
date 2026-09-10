# Task — <task-id>

**Wave:** wave-N  
**Branch:** <branch>  
**Clone cwd:** `waves/wave-N/<task-id>/<repo>/`  
**Coding law (absolute path — read-only):** `<workspace>/integration/<repo>/CurrentTask/*AGENT_SPEC*.md` (fallback: `base/<repo>/…`)
**Do not** treat this clone’s `CurrentTask/*AGENT_SPEC*` as law.

**Reports:** `Reports/<task-id>.txt`  
**Review packet:** `.eteller/for_review.md` (implementer) → `.eteller/approved.md` (code reviewer) → `.eteller/ux_review.md` (UXReview)  
**Progress:** sibling `progress.md` — coding **and** PR / code review / UX / merge milestones; board polls it  
**Done means:** PR **merged** (not merely reviewed)

## Progress reporting (mandatory)

On start: `progress.md` `status: in_progress`, `current_task`, `updated`.  
After **each** milestone (including review + UX + merge): check it off, bump `percent` / `current_task` / `status` / `updated`, write the file.  
Live board = disk files; silent work = empty / stale board.

Never set `percent: 100` or `finished: true` until **Merge** is done.

## Implementer steps (not done yet)

1. Coding milestones
2. **Triple Release build** (2027/2026/2025) — 0 Error(s); note in Reports
3. `Reports/<task-id>.txt` (include `Build: OK` / `IT: deferred_to_wave`)
4. Write `.eteller/for_review.md` (include build evidence; do **not** require IT or seed/HTML in this PR)
5. Ensure `.eteller/approved.md` with `approved: false` and `.eteller/ux_review.md` with `ux_ready: false`
6. Open PR → `INTEGRATION_BRANCH` (do **not** merge)
7. `state.md` + `progress.md` → `awaiting_review`; commit + push

**Do not** edit `CurrentTask/reporte_qa_seed.json` / HTML on the task branch. Seed/HTML sync is **base-only after wave merge + installer/test**.

## Code reviewer steps (still this task)

1. Follow `.eteller/memory/roles/reviewer.md`
2. Write `approved.md`; if `approved: true`, check **Code review** milestone in `progress.md`, set `status: awaiting_ux_review`, bump percent, update `state.md`
3. Commit + push wave-task branch

## UXReview steps (after code review — still this task)

1. Follow `.eteller/memory/roles/ux-reviewer.md`
2. Write `ux_review.md` with an **exhaustive** UX test checklist + subtareas from `progress.md`
3. If `ux_ready: true`, check **UX review** milestone, set `status: ux_ready`, bump percent, update `state.md`
4. Commit + push wave-task branch

## Merge (orchestrator — user must ask)

1. Only if `approved: true` **and** `ux_ready: true` and user asks
2. Merge PR → check **Merge** milestone → `status: merged`, `percent: 100`, `finished: true`
3. Append this slot’s UX checklist + subtareas into `integration/<repo>/.eteller/ux_review/wave-N.md` (create from template if missing); commit on integration branch from **`integration/`**
4. Then the task is complete on the board
