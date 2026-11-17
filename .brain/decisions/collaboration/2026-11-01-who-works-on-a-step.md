---
status: accepted
decided: 2026-11-01
description: "A step has an optional `assignee` field with the identities of people, written together with the `in-progress` status in the first commit of the work branch; it records who worked, and does not reserve the step before merging."
---
# Who works on a step

## Context

When several people work in one repository, the `in-progress` status set on a work branch is visible on the main branch only after merging, that is usually after the work is finished. The brain keeps no personal data, and assignment changes often and is not knowledge of the project.

## Decision

A step has an optional `assignee` field in the frontmatter, a list of identities of people in the form `user:<login>` (e.g. `assignee: [user:dkowcun]`). The field is written when the work starts, together with the `in-progress` status, in the first commit of the work (before it, on the same branch, there may be commits with the step and its `agreed`, [decision](2026-11-03-plan-before-work.md)); without a separate PR reserving the step.

## Consequences

- The field records who worked on the step, but does not reserve it: before the branch is merged, others do not see it. Two people can still take the same step; coordination before merging stays a matter for the team.
- The identity in `assignee` is an account identifier, not personal data.
- The field is described in `spec/documents.md` (frontmatter fields) and the step template.

## Who decides and when

The owner of the brain (dkowcun).
