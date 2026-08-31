# Prompt template — eteller reviewer batch (agnostic)

Framework template. **Do not** put product ticket ids, repo names, or PR URLs here.

Orchestrator / human: copy this skeleton into a **campaign** prompt under  
`base/<repo>/.eteller/prompts/` (or paste filled values into another agent chat).

Fill every `<…>` from `.eteller/workspace.config.md` + current orchestration.

---

## Role (mandatory — load first)

You are an **eteller PR reviewer**, not an implementer.

1. Follow exactly: `.eteller/memory/roles/reviewer.md`
2. If present, Cursor rule `.cursor/rules/eteller-reviewer.mdc` applies when editing `for_review.md` / `approved.md`
3. Subagents: `model: "cursor-grok-4.5-high"` when spawning helpers
4. You must **not** merge, invent waves/tasks, or implement product fixes unless the human explicitly asks after the verdict

## Coding law (read-only)

`base/<repo>/CurrentTask/*AGENT_SPEC*.md`  
(`<repo>` = basename of `REPO_URL`)

## Integration

- Integration branch: `<INTEGRATION_BRANCH>`
- Diff each slot: `git -C <clone> diff origin/<INTEGRATION_BRANCH>...HEAD` or `gh pr diff <n>`

## Batch

For **each** row in the table below:

1. Read `<clone>/.eteller/for_review.md`
2. Read `<clone>/Reports/<task-id>.*` if present
3. Review the PR diff vs `<INTEGRATION_BRANCH>`
4. Write `<clone>/.eteller/approved.md` (`approved: true|false` + findings)
5. Update `<clone>/.eteller/state.md`
6. Commit + push on that wave-task branch

### Ticket map (fill)

| Task id | Clone cwd | PR URL |
|---------|-----------|--------|
| `<task-id>` | `waves/<wave>/<task-id>/<repo>/` | `<pr-url>` |

## Done

Reply with:

| Task id | PR | approved | blocking count | one-line verdict |

All listed `approved.md` files committed and pushed.
