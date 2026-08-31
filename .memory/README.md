# eteller memory

eteller is a project-agnostic orchestration framework. The folder on disk is irrelevant branding; the workflow name is **eteller**.

## What lives where

| Location | Role | Git |
|----------|------|-----|
| eteller root (this tree) | Rules, board, scripts, templates | eteller remote |
| `base/<REPO_DIR_NAME>/` | Integration checkout + coding law + campaign `.eteller/` | Product `INTEGRATION_BRANCH` |
| `waves/wave-N/<task-id>/<REPO_DIR_NAME>/` | Task clone + `.eteller/{task,state,progress}.md` | Wave-task branch |

## Coding law

`base/<REPO_DIR_NAME>/CurrentTask/*AGENT_SPEC*.md` — single source of truth for how to code. Read-only for workers.
