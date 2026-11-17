---
status: accepted
decided: 2026-11-03
description: "The review against the brain is required also before committing directly to the main branch, so changes without their own branch do not skip the review."
---
# Review before committing directly to the main branch

## Context

A change without its own branch, made directly on the main branch, has neither setting a step to `done` nor merging a branch, if it does not belong to a step. This is how [changes without a step](../collaboration/2026-11-03-changes-without-a-step.md) are made, so without this rule they would skip the [review against the brain](2026-11-03-brain-review-procedure.md).

## Decision

The review against the brain is done before setting a step to `done`, before merging a branch into the main branch and before committing directly to the main branch (rule 21 of the agent contract). Before a commit, the review reads the uncommitted changes; a range of commits given by hand stays for changes already committed directly on the main branch ([the scope of the change](2026-11-03-brain-review-scope.md)).

## Consequences

The rule is in the agent contract and its concise form, in `spec/review.md`, in the managed block of the starter template and of `CLAUDE.md` of this repository, and in the description of the subagent. In the brain: [agent-contract.md](../../architecture/agent-contract.md) and [risks.md](../../risks.md).

## Who decides and when

The owner of the brain (dkowcun).
