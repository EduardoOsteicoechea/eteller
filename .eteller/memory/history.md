# Work session history (integration)

Path (on integration branch, **live checkout**):

```
integration/<repo>/.eteller/history/     # append-only prompt/steer records
integration/<repo>/.eteller/worksession.txt  # rolling summary for automated reporting
```

Legacy campaigns may still have history under `base/<repo>/.eteller/` until the next promote. **New writes go to `integration/`.**

## When to write

The first material history entry for a campaign is the **user story** (after base + integration bootstrap). Do not invent a story or task list just to populate history.

On **every material change to work-session prompting** (user steer that changes plan, waves, tasks, scope, or completion status), the orchestrator must:

1. Add a new file under `integration/<repo>/.eteller/history/` named `YYYYMMDDTHHMMSSZ.md` (UTC)
2. Rewrite `integration/<repo>/.eteller/worksession.txt` to reflect current campaign status for automated reporting
3. Commit both on the **integration branch** from the **`integration/`** clone

Do not store this history on the eteller framework remote. Do not mid-wave refresh `base/` just to write history.

## history entry template

```markdown
# Work session prompt — YYYY-MM-DDTHH:MM:SSZ

## Prompt / steer (verbatim or faithful summary)
...

## Effect
- orchestration / wave_plan / tasks touched: ...
- decisions: ...

## Snapshot
- active wave: ...
- open tasks: ...
- closed tasks: ...
```

## worksession.txt

Plain text, machine-friendly. Keep it short and current (overwrite, do not append endlessly):

```
updated: <ISO-8601>
integration_branch: <name>
active_wave: <wave-id or none>
open_tasks: <comma-separated ids>
closed_tasks: <comma-separated ids>
last_prompt_at: <ISO-8601>
last_prompt_summary: <one line>
history_entries: <count>
notes: <optional>
```
