---
status: accepted
decided: <YYYY-MM-DD>
apply: always
description: "Changes to the brain go to the main branch in a separate pull request before the work that follows from them."
---
# Brain changes before the work

## Context

The order of work is a decision of the team (dotbrain agent contract, rule 20). This is the alternative of the dotbrain starter to the default, in which changes to the brain go in the same pull request as the work.

## Decision

Changes to the brain (decisions, including `proposed` ones, steps, documents) go to the main branch in a separate pull request before the work that follows from them, together with the generated views and the managed blocks of instruction files that follow from the changed documents. The work starts once that pull request is merged. A change of the work that departs from a document still updates the document in the pull request of the work. A step is set to `agreed` before the work on it, and every finished stage of a step is a separate commit.
