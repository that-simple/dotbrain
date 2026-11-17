---
status: accepted
decided: 2026-11-01
description: "The number of a step stays unique in the brain; when two branches take the same number, the branch merged second changes the number of its step and the links to it before merging."
---
# Step numbers on parallel branches

## Context

A step with a number is a `steps/NN-slug.md` file with a number unique in the brain (`V-STEP` in the [specification](../../../spec/validity.md)). The number requires coordination: two people on two branches add a step `05-...`, and after merging the brain is invalid. Decisions have this problem solved by an ID with a date and a slug ([decision](../model/2026-10-28-decisions-as-adr.md)), steps do not. The number is, however, important for people: it tells the order of the plan ("step 3"), and the order of the plan need not be the order in which the files were created.

## Decision

The number of a step is unique in the brain. When two branches add a step with the same number, the number is kept by the step that reached the main branch first. The branch merged second changes the number of its step to the first free one before merging and fixes the links to it. It does not change the numbers of steps already on the main branch.

## Consequences

The rule is in the agent contract (rule 13) and in `spec/documents.md` at the numbering of steps. Steps named by the key of a ticket require no renumbering ([decision](../model/2026-11-05-step-ids-from-tracker.md)).

## Who decides and when

The owner of the brain (dkowcun).
