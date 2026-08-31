# Task — <task-id>

**Wave:** wave-N  
**Branch:** <branch>  
**Clone cwd:** `waves/wave-N/<task-id>/<repo>/`  
**Coding law (absolute path — read-only):** `<workspace>/base/<repo>/CurrentTask/*AGENT_SPEC*.md`  
**Do not** treat this clone’s `CurrentTask/*AGENT_SPEC*` as law.

**Reports:** `Reports/<task-id>.txt` (update on completion)  
**Review packet:** `.eteller/for_review.md` (implementer) → `.eteller/approved.md` (reviewer)  
**Milestones:** sibling `progress.md` — **update after every segment**

## Progress reporting (mandatory)

On start: set `progress.md` `status: in_progress`, `current_task`, `updated`.  
After each milestone: check it off, bump `percent` / `current_task` / `updated`, write the file.  
The live board reads these files from disk; silent work = empty board.

## Completion (implementer)

1. Update `Reports/<task-id>.txt`
2. Write `.eteller/for_review.md` (in-depth PR explanation for reviewers)
3. Ensure `.eteller/approved.md` exists with `approved: false`
4. Open PR → `INTEGRATION_BRANCH` (do **not** merge)
5. Set `state.md` to `awaiting_review` with PR URL; progress notes review pending
6. Commit + push on this wave-task branch

## Merge (orchestrator — after review)

Only when the user explicitly asks **and** `.eteller/approved.md` has `approved: true`.  
Reviewer role: `.eteller/memory/roles/reviewer.md` (user launches review subagents).
