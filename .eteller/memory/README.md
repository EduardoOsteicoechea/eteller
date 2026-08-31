# eteller memory

eteller is a project-agnostic orchestration framework. The folder on disk is irrelevant branding; the workflow name is **eteller**.

Framework wiring lives under workspace `.eteller/`. Product clones are generated at workspace root (`base/`, `waves/`).

## What lives where

| Location | Role | Git |
|----------|------|-----|
| `.eteller/` (framework tree) | Rules, board, scripts, templates, config | eteller remote |
| `base/<repo>/` at root | Integration checkout + coding law + campaign `.eteller/` | Product `INTEGRATION_BRANCH` |
| `base/<repo>/.eteller/history/` + `worksession.txt` | Work-session prompt history + automated reporting | Product `INTEGRATION_BRANCH` |
| `waves/wave-N/<task-id>/<repo>/` at root | Task clone + `.eteller/{task,state,progress}.md` | Wave-task branch |

`<repo>` comes from `REPO_URL` basename.

Also read [`history.md`](history.md) for work-session recording rules.

## Coding law

`base/<repo>/CurrentTask/*AGENT_SPEC*.md` — single source of truth for how to code. Read-only for workers.
