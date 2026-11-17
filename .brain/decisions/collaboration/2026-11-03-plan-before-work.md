---
status: accepted
decided: 2026-11-03
description: "Work on a new step is first only the plan in `steps/` with `status: draft`, and the work only on a separate instruction, once a person sets the step to `agreed`; the step and the work may go in one PR."
---
# The plan of a step first, then the work

## Context

The [lifecycle of a step](../model/2026-10-28-lifecycles.md) has the statuses `draft` and `agreed` (`agreed` means that the scope and acceptance criteria are agreed and the work may start). Without this rule an agent could write a step and carry it out at once, and a person would see the plan only together with the work. [Changes without a step](2026-11-03-changes-without-a-step.md) and [editorial changes](2026-11-03-editorial-changes.md) have no step, so this decision does not concern them.

## Decision

Work on a new step is first the plan, then the work. The plan first: when a new step comes up, the agent writes only its document with `status: draft` and ends the task there, even if the plan seems obvious. The change `draft` → `agreed` is made only by a person, by themselves or with an explicit instruction to the agent. Then the work: work on a step (`in-progress`) starts only on an `agreed` step, on a separate instruction given after the step is agreed. In git, the step, its `agreed` and the work may go in one PR, as consecutive commits in this order. The rule is in the core of the agent contract.

## Consequences

- The rule is in `spec/documents.md`, in rule 6 of the agent contract and in its concise form.
- `status: in-progress` and `assignee` go in the first commit of the work ([who works on a step](2026-11-01-who-works-on-a-step.md)).
- The review against the brain reports work on a step that was not `agreed` before the work started.

## Who decides and when

The owner of the brain (dkowcun).
