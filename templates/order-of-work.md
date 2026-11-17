---
status: accepted
decided: <YYYY-MM-DD>
apply: always
description: "Changes to the brain go in the same pull request as the work that follows from them."
---
# Brain changes with the work

## Context

The order of work is a decision of the team (dotbrain agent contract, rule 20). This is the default of the dotbrain starter; change it if the team works otherwise, for example when every change to the brain goes to the main branch in a separate pull request before the work.

## Decision

Changes to the brain (decisions, including `proposed` ones, steps, documents) go in the same pull request as the work that follows from them, in any of its commits, including the same commit as the work. The exception is a step: the commit that sets it to `agreed` comes before the work on it, and every finished stage is a separate commit. That pull request also carries the generated views and the managed blocks of instruction files that follow from the changed documents. A `proposed` decision or a new step that affects the work of other people may go to the main branch earlier in a separate small pull request.
