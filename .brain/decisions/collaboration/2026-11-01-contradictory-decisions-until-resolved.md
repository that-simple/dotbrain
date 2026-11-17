---
status: accepted
decided: 2026-11-02
description: "When a decision accepted on a branch contradicts an accepted decision that reached the main branch first, the branch merged second turns its decision back to `proposed` with both options before merging; until it is resolved, the decision from the main branch binds."
---
# Contradicting decisions until resolved

## Context

The agent reports a contradiction between branches as a `proposed` decision with both options and does not choose by itself ([decision on ADRs](../model/2026-10-28-decisions-as-adr.md), rule 10 of the contract). When two branches accept two different decisions on the same matter (e.g. both supersede the same decision in different directions), after merging both would have `status: accepted` and the brain would bind with two contradicting rules at once, while the `superseded-by` field or a link in a step can name only one of them.

## Decision

What reached the main branch first binds; the branch merged second adjusts its change before merging:

- When a decision accepted on a branch contradicts an accepted decision that reached the main branch first, the agent changes the status of its decision to `proposed` and removes `decided` before merging. This decision becomes the decision on the contradiction, without a separate file: the context describes the contradiction and links the decision from the main branch, the options are the decision from the main branch and this decision, and the "Who decides and when" section names the person who decides in this brain. The file keeps its ID.
- Fields and links that can name only one decision (`superseded-by`, links in steps and documents) stay from the main branch.
- Turning back to `proposed` is not a resolution, only reopening the matter, so the agent does it by itself (an exception to rule 4 of the contract). The acceptance of this decision on the branch stops being in force, and the person from that branch sees it in their PR.

## Consequences

The brain on the main branch never binds with two contradicting decisions, and the decision list shows the matter in the "Proposed" group. The rule is in the agent contract (rule 10), in the lifecycle of a decision in `spec/documents.md` and in the concise form of the contract. Work on that branch that follows from the decision turned back contradicts the brain after merging; the rule on discrepancies applies (rule 5 of the contract).

## Who decides and when

The owner of the brain (dkowcun).
