---
status: accepted
decided: 2026-11-03
description: "The starter template by default puts changes to the brain in the same PR as the work, in any of its commits, also in the same commit as the work; apart from a step's `agreed` before the work on it and a separate commit per stage, the order of commits is neither a rule nor a subject of review."
---
# The brain with the work in any commit

## Context

What matters, that is a document updated in the same PR as the work, does not depend on the order of commits, and strictly checking in the commit history whether documents came first makes no sense.

## Decision

- The order of work is a decision in the brain of the project with `apply: always`. The agent contract requires such a decision; without it, the agent asks before assuming anything.
- The starter template contains a ready decision "brain with the work": changes to the brain (decisions, including `proposed`, steps, documents) go in the same PR as the work that follows from them, together with the generated views and managed blocks that follow from them, in any commits of the PR, also in the same commit as the work. A `proposed` decision or a new step that concerns the work of other people may reach the main branch earlier in a separate small PR. Instead, a team may choose a separate PR before the work for all changes to the brain.
- Regardless of the chosen order, the contract rule applies: a change of the work that departs from a document updates the document in the same PR.
- The order of commits is neither a rule nor a subject of review, with two exceptions: the commit that sets a step to `agreed` comes before the work on it, and every finished stage of a step is a separate commit.

## Consequences

The starter's decision is contained in the `templates/order-of-work.md` template. This repository has its own rule for the order of work ([decision](../repository/2026-11-03-brain-in-the-same-pr.md)).
