---
status: accepted
decided: 2026-11-03
apply: always
description: "In the dotbrain repository, changes to `.brain/` go in the same PR as the specification, templates and other files that follow from them, in any of its commits, also in the same commit as the work."
---
# The brain in the same PR as the work

## Decision

Changes to `.brain/` (decisions, including `proposed`, steps, documents) go in the same PR as the work that follows from them (changes in `spec/`, `templates/` and outside the brain), together with the generated views and the managed blocks of instruction files. The order of commits in the PR is free: a change to the brain may be in the same commit as the work. The exception is a step: the commit that sets it to `agreed` comes before the work on it, and every finished stage is a separate commit. A `proposed` decision or a new step that concerns the work of other people may reach the main branch earlier in a separate small PR.

## Consequences

The review against the brain does not check the order of commits apart from a step. Dogfooding ([decision](2026-10-28-dogfooding.md)) works in one PR. This is the same rule the starter template provides ([decision](../setup/2026-11-03-brain-with-the-work-in-any-commit.md)).
