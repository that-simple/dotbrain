---
status: accepted
decided: 2026-11-03
description: "A step is one result to be agreed as a whole: a giant step is split into several steps, and a large one has a `stages` section and is carried out in stages, each of which leaves a working state, has an entry in the log and a separate commit in git; the plan and the work of a step are not called stages."
---
# Step size and stages

## Decision

A step is one result that can be reviewed and agreed as a whole. When the plan describes several results, each useful on its own, the agent writes several steps with `status: draft`, and leaves the rest of the plan in the roadmap. A large step has an optional `stages` section (the default label "Stages"; until [step 5](../../steps/05-brain-in-english.md) this brain had its own label in Polish) with stages in the order of execution, agreed together with the step at `agreed`. Every stage leaves the work in a working state, and a finished stage is one entry in the log of the step. In git, every finished stage is a separate commit, and the repository's checks pass before that commit. The boundary of a giant step is not set by a number: the split is proposed by the agent and decided by a person when agreeing the step.

The plan and the work of a step from [the plan before the work](2026-11-03-plan-before-work.md) and from [plan mode in Claude Code](../agents/2026-11-03-claude-code-plan-mode.md) are not called stages ("stages" in English); we call them "the plan and the work".

## Consequences

Stages are described by `spec/documents.md`, the step template, the review subagent, the default labels in the tools and the manifest of this brain (until step 5).
