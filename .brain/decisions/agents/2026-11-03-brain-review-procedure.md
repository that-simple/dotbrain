---
status: accepted
decided: 2026-11-03
description: "The review of changes against the brain is a core procedure done before closing a step and merging a branch, in Claude Code as a subagent from the starter template; the mechanical checks are enforced by a hook."
---
# Review of changes against the brain

## Context

The agent contract is instructions, not a mechanism: an agent may skip a rule and a discrepancy goes unnoticed ([risks.md](../../risks.md)). The `lint` and `index --check` checks do not see discrepancies in content: a change of the work that contradicts an `accepted` decision, a document not updated in the same PR, a `proposed` decision silently resolved, work outside the scope or criteria of the step. The procedure must be doable without plugins ([independence from the AI tool](2026-10-28-ai-tool-independence.md)).

## Decision

- **The procedure of the review against the brain** is part of the specification ([spec/review.md](../../../spec/review.md)), independent of the tool: what the review reads and what discrepancies it reports (work contradicting an `accepted` decision or a document, a document not updated in the same PR, a `proposed` decision silently resolved, work outside the scope or criteria of the step, a missing entry in the log of the step). The result is a list of discrepancies, not fixes; whether the work or the brain changes is decided by a person.
- **When:** before setting a step to `done`, before merging a branch into the main branch and before committing directly to the main branch ([decision](2026-11-03-review-before-committing-to-main.md)), as rule 21 of the agent contract.
- **Claude Code:** the adapter is the subagent `.claude/agents/brain-review.md`, copied by the starter template next to `CLAUDE.md`; other tools do the procedure in the same or a new session.
- **Hook:** the mechanical checks (`lint`, `index --check`, tests) are enforced by a hook of the AI tool where tools are available. In this repository it is the `Stop` hook in `.claude/settings.json`; the starter template provides it only when the CLI can be downloaded from the npm package ([distribution channels](../tooling/2026-10-28-distribution-channels.md)).

## Consequences

The procedure is described in `spec/review.md` and `spec/adapters/agents.md` (the subagent for Claude Code), and the starter template copies the subagent. In this repository: `.claude/agents/brain-review.md`, `.claude/settings.json` with the hook and the managed block of `CLAUDE.md`.

Extensions: [changes without a step](../collaboration/2026-11-03-changes-without-a-step.md), [editorial changes](../collaboration/2026-11-03-editorial-changes.md), [the scope of the change in the review](2026-11-03-brain-review-scope.md), [review before committing directly to the main branch](2026-11-03-review-before-committing-to-main.md) and [a lighter review subagent in this repository](2026-11-06-lighter-brain-review.md).

## Who decides and when

The owner of the brain (dkowcun).
