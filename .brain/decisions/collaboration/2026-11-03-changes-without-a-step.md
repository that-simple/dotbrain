---
status: accepted
decided: 2026-11-03
description: "A change that wholly carries out accepted decisions does not require a step; the review against the brain checks it against the Consequences of those decisions."
---
# Changes without a step

## Context

The [review against the brain](../agents/2026-11-03-brain-review-procedure.md) checks whether the work fits within the scope and acceptance criteria of its step and whether it has an entry in its log. Not every change has a step: some come out of a conversation as a decision and its execution, without a file in `steps/`.

## Decision

A change that wholly carries out accepted decisions does not require a step. The review against the brain then checks whether the change carries out the Consequences of those decisions and does not go beyond them. A change that neither belongs to a step nor wholly carries out an accepted decision is a discrepancy to report.

## Consequences

This is described by the review procedure in `spec/review.md` and the subagent in the starter template and in `.claude/agents/` of this repository.

An exception: [editorial changes](2026-11-03-editorial-changes.md) require neither a step nor a decision.
