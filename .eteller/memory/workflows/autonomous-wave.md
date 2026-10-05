# Autonomous wave workflow (opt-in)

Named mode: **autonomous wave**. Activated only by an **explicit user steer** for a given wave (or for the whole session until revoked). It does **not** bypass hard gates A/B/C in [`workflow.md`](../workflow.md).

## Activation

Enable when the user says any of:

- “autonomous wave” / “modo autónomo” / “workflow autónomo”
- A start-wave ask that also authorizes the full pipeline, e.g. implement + review prompts in chat + launch review subagents + **merge when reviews pass** + **compile/Setup for IT**

Record the steer in `integration/<repo>/.eteller/history/` + `worksession.txt`.

Until activated, the **default** steered workflow applies (deliver review prompts; do **not** auto-start review or auto-merge).

## Roles & models

| Role | Who | Default model (unless user overrides with a listed slug) |
|------|-----|----------------------------------------------------------|
| Orchestrator | Parent agent in the user chat | Stays in-chat (typically Grok 4.5 high) |
| Implementer | Slot agents / parent in slot cwd | `cursor-grok-4.5-high` |
| Code reviewer | Background `Task` subagent | `gpt-5.6-terra-medium` |
| UX reviewer | Background `Task` subagent | `gpt-5.6-terra-medium` |

Orchestrator **must not** set `approved: true` or `ux_ready: true` on its own PRs. Reviewer/UXReviewer contracts still apply ([`roles/reviewer.md`](../roles/reviewer.md), [`roles/ux-reviewer.md`](../roles/ux-reviewer.md)).

## Pipeline (per started wave)

```
code → for_review + PR → chat textbox + Terra code-review Task
     → (pass) chat textbox + Terra UXReview Task
     → (ux_ready) merge → pull integration → UX rollup
     → (all wave slots merged) Release build / installer in integration/
     → STOP — ask before promote base / next wave
```

### 1. Work

Same as default: one agent = one slot; product edits only in that clone; `progress.md` after every segment; open PRs with `for_review.md`, `approved.md` false, `ux_ready` false.

### 2. Review prompts in chat (mandatory)

When a slot (or the wave batch) reaches `awaiting_review`:

1. Write `integration/<repo>/.eteller/prompts/PROMPT_reviewer_…md` (and later `PROMPT_ux_reviewer_…md`).
2. Paste a **copyable fenced textbox** in the orchestrator chat (same style as campaign delivery).
3. **Also** launch a background reviewer `Task` with the review model — do **not** wait for the user to paste into another chat.

Same pattern for UXReview after `approved: true`.

### 3. Parallelism

- Keep the orchestrator free: launch review/UX Tasks with `run_in_background: true`.
- On Task completion notifications: verify gates on disk (`approved.md` / `ux_review.md`), then continue the pipeline.
- Stale notifications for already-merged slots: no-op.

### 4. Merge authorization

If the autonomous steer included “merge when reviews pass” / “si las reviews pasan, mergeas”:

- Merge each PR when **both** `approved: true` and `ux_ready: true` (no second merge ask).
- Still resolve conflicts carefully: keep **slot** `.eteller/*` ours; combine product files intentionally (do not drop sibling wave features).
- After merge: pull **`integration/`** only; append slot UX into `ux_review/wave-N.md`; set slot `status: merged`.

If autonomous was **not** granted merge authority, stop at `ux_ready` and ask.

### 5. Wave close compile / IT artifact

When **all** tasks of the started wave are `merged`:

1. In **`integration/<repo>/`**, run the product’s Release solution / installer build (e.g. desktop `Setup.exe`).
2. Report the artifact path + timestamp in chat and in `history/` + `worksession.txt`.
3. **Do not** promote `base/` — ask first.
4. **Do not** start the next wave — ask first.

## Still prohibited

- Starting a wave without an explicit start-wave (or autonomous start-wave) ask
- Auto-advancing to wave N+1
- Promoting `base/` without ask
- Implementer self-approval of code or UX
- Cross-slot product edits
- Skipping review/UX gates

## Templates

- Code review skeleton: [`../../templates/PROMPT_reviewer_batch_wave-N.md`](../../templates/PROMPT_reviewer_batch_wave-N.md)
- UX review skeleton: [`../../templates/review/PROMPT_ux_reviewer_batch.md`](../../templates/review/PROMPT_ux_reviewer_batch.md)
- Autonomous launch notes: [`../../templates/PROMPT_autonomous_wave.md`](../../templates/PROMPT_autonomous_wave.md)
