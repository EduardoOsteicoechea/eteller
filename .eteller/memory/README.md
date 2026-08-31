# eteller memory

eteller is a project-agnostic orchestration framework. The folder on disk is irrelevant branding; the workflow name is **eteller**.

Framework wiring lives under workspace `.eteller/`. Product clones are generated at workspace root (`base/`, `integration/`, `waves/`).

## What lives where

| Location | Role | Git |
|----------|------|-----|
| `.eteller/` (framework tree) | Rules, board, scripts, templates, config | eteller remote |
| `base/<repo>/` at root | **Last closed / promoted** product snapshot + coding-law checkpoint | Product `INTEGRATION_BRANCH` (updated **only after wave close**) |
| `integration/<repo>/` at root | **Live** `INTEGRATION_BRANCH` checkout: merges, builds, IT/smoke, seed/HTML, campaign `.eteller/` | Product `INTEGRATION_BRANCH` |
| `integration/<repo>/.eteller/history/` + `worksession.txt` | Work-session prompt history + automated reporting | Product `INTEGRATION_BRANCH` |
| `waves/wave-N/<task-id>/<repo>/` at root | Task clone + `.eteller/{task,state,progress}.md` | Wave-task branch |

`<repo>` comes from `REPO_URL` basename.

### base vs integration (non-negotiable)

| Action | Where |
|--------|--------|
| Merge wave-task PRs | Remote `INTEGRATION_BRANCH` → pull **`integration/`** only |
| Release builds / solution compile after merge | **`integration/`** |
| Revit IT / installer smoke / analytics review | **`integration/`** (built/installed from that tree) |
| Seed + QA HTML sync | **`integration/`** after IT/smoke |
| Campaign orchestration / history / worksession | **`integration/<repo>/.eteller/`** |
| Refresh **`base/`** | **Only after wave close** (user ask) via promote script — never mid-wave |

Coding law for workers: prefer `integration/<repo>/CurrentTask/*AGENT_SPEC*.md` when `integration/` exists; else `base/...`. Do **not** treat wave-clone `CurrentTask/*AGENT_SPEC*` as law.

Also read [`workflow.md`](workflow.md) (hard stops + **merge code-review gate**) and [`history.md`](history.md) (work-session recording).

Reviewer-only attitude: [`roles/reviewer.md`](roles/reviewer.md) — load only when assigned to review a PR.  
Agnostic batch prompt skeleton: [`../templates/review/PROMPT_reviewer_batch.md`](../templates/review/PROMPT_reviewer_batch.md).  
Filled campaign prompts live under `integration/<repo>/.eteller/prompts/` (product branch), not in the framework.

## Coding law

`integration/<repo>/CurrentTask/*AGENT_SPEC*.md` (fallback: `base/...`) — single source of truth for **how** to code. Read-only for workers.

It is **not** a license to invent the campaign. Waves and tasks come only from the **user story** after base (+ integration) bootstrap (see workflow hard gate A).

## Orchestration gates

1. Config → 2. Clone **base** + **integration** → **STOP — ask for user story** → 3. Plan (on **integration**) → 4. Branches → 5. Materialize → **STOP — ask before each wave** → 6. Work only that wave → merge into integration → validate in integration → **ask before promote base** → promote base → **ask before next wave**.
