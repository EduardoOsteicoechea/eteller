# Work session history (base)

Path (on integration branch):

```
base/<repo>/.eteller/history/     # append-only prompt/steer records
base/<repo>/.eteller/worksession.txt  # rolling summary for automated reporting
```

## When to write

On **every material change to work-session prompting** (user steer that changes plan, waves, tasks, scope, or completion status), the orchestrator must:

1. Add a new file under `history/` named `YYYYMMDDTHHMMSSZ.md` (UTC)
2. Rewrite `worksession.txt` to reflect current campaign status for automated reporting
3. Commit both on the **integration branch** (`base`)

Do not store this history on the eteller framework remote.

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
