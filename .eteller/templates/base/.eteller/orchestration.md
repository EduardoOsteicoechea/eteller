# Orchestration — campaign index

Coding law (read-only): `base/<repo>/CurrentTask/*AGENT_SPEC*.md`

## Waves

| Wave | Rationale (shared functionality) | Status | Path |
|------|----------------------------------|--------|------|
| wave-1 | <why this wave first> | pending | `.eteller/waves/wave-1/wave_plan.md` |

## Tasks

| id | branch | wave | depends_on | status | slot path |
|----|--------|------|------------|--------|-----------|
| <task-id> | <branch> | wave-1 | — | pending | `waves/wave-1/<task-id>/<repo>/` |

## Rules

- Skip `closed` tasks
- Never auto-merge PRs
- Status rolls up from task `state.md` / `progress.md`
- Work-session prompt changes → `history/` + `worksession.txt` (beside this tree on base)
