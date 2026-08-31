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

Also read [`workflow.md`](workflow.md) (hard stops) and [`history.md`](history.md) (work-session recording).

## Coding law

`base/<repo>/CurrentTask/*AGENT_SPEC*.md` — single source of truth for **how** to code. Read-only for workers.

It is **not** a license to invent the campaign. Waves and tasks come only from the **user story** after base clone (see workflow hard gate A).

## Orchestration gates

1. Config → 2. Clone base → **STOP — ask for user story** → 3. Plan → 4. Branches → 5. Materialize → **STOP — ask before each wave** → 6. Work only that wave → close → **ask before next wave**.
