---
status: accepted
decided: 2026-11-06
description: "The review subagent in this repository runs on Sonnet, reads only the documents changed, linked from the change or containing concepts the change removes or renames, and does not run the checks the hook enforces."
---
# A lighter subagent of the review against the brain

## Context

The [review subagent](2026-11-03-brain-review-procedure.md) inherited the model of the main session (Opus) and read the documents the change "touches or should touch", without a limit. With large changes the review took 4–5 minutes and 50–78 turns, and every turn sends the whole context again: 5–7.5 million input tokens for one review, mostly from dozens of single `grep` and `git show` calls. The repository's checks (`npm run check`) are already enforced by the `Stop` hook, and the subagent ran them 2–3 more times. The specification allows a repository to adjust the subagent file ([agents adapter](../../../spec/adapters/agents.md#review-against-the-brain)), and checks in the review are optional ("when it runs them", [spec/review.md](../../../spec/review.md)).

## Decision

In `.claude/agents/brain-review.md` of this repository:

- the subagent runs on the `sonnet` model;
- it reads the diff, the index of the brain, the step of the change, the documents and decisions changed in the change or linked from the changed files, and the others only when their `description` points to the topic of the change;
- it looks for stale mentions only for concepts the change removes or renames, with one combined search;
- it does not run `npm run check`, because the hook does, and gathers reads into few larger calls.

The list of discrepancies the review reports does not change. The `templates/brain-review.md` template stays unchanged.

## Consequences

The change concerns only `.claude/agents/brain-review.md`. If the lighter review starts letting discrepancies through, we go back to the model of the main session or to broader reading. Reviewing only the fixes again instead of the whole change requires a change of the procedure in the specification and a separate decision.

## Who decides and when

The owner of the brain (dkowcun).
