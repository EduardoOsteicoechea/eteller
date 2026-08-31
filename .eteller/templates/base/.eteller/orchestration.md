# Orchestration — campaign index

Coding law (read-only): `integration/<repo>/CurrentTask/*AGENT_SPEC*.md` (fallback `base/...`)

**Status:** `awaiting_user_story`

Do **not** invent waves or tasks. After base bootstrap, stop and ask the user for their story; fill this file only from that steer.

## Waves

| Wave | Rationale (shared functionality) | Status | Path |
|------|----------------------------------|--------|------|
| *(none yet — awaiting user story)* | | | |

## Tasks

| id | branch | wave | depends_on | status | slot path |
|----|--------|------|------------|--------|-----------|
| *(none yet — awaiting user story)* | | | | | |

## Rules

- Skip `closed` tasks
- Never auto-merge PRs
- Status rolls up from task `state.md` / `progress.md`
- Work-session prompt changes → `history/` + `worksession.txt` (beside this tree on base)
- Task ids and branch names come from the user (and workspace naming criteria), never from agent invention
