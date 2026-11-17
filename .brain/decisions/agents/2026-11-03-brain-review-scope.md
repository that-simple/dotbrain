---
status: accepted
decided: 2026-11-03
description: "The review against the brain reads the change from the point where the branch left the main branch, with uncommitted changes; a change without its own branch is given as a range of commits by whoever asks for the review."
---
# The scope of the change in the review against the brain

## Context

Comparing a branch with the current state of the main branch (`git diff main`) after the main branch has moved also shows its new changes, reversed. A change without its own branch, made directly on the main branch (e.g. a [change without a step](../collaboration/2026-11-03-changes-without-a-step.md)), gives an empty `<main>...HEAD`: the review sees only uncommitted changes and could report no discrepancies without having reviewed anything.

## Decision

- The change to review is the difference from the point where the branch left the main branch (in git, from the merge base, `git diff <main>...HEAD`), together with uncommitted changes. Changes that reached the main branch in the meantime are not part of it; the brain is read in its current state.
- A change without its own branch, already committed directly on the main branch, is given as a range of commits by whoever asks for the review. A review that finds no change says so instead of reporting no discrepancies.

## Consequences

This is described in `spec/review.md` and step 1 of the subagent in the starter template and in `.claude/agents/` of this repository.
