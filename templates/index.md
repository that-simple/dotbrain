---
brain: <brain-name>
lang: <language-tag>
spec: 1.0.0
owner: <person-or-role>
description: "<One sentence: what this brain is the source of truth for.>"
# For a brain not written in English, map every section key to a heading in the brain's language.
# Remove this comment and the map for an English brain.
sections:
  goal: Goal
  scope: Scope
  out-of-scope: Out of scope
  decisions: Decisions
  acceptance: Acceptance criteria
  stages: Stages
  log: Log
  open-questions: Open questions
  context: Context
  options: Options
  recommendation: Recommendation
  decider: Who decides and when
  decision: Decision
  consequences: Consequences
  proposed: Proposed
  accepted: Accepted
  rejected: Rejected
  superseded: Superseded
  status: Status
  assignee: Assignee
---
# <Project name>

<Two or three sentences: what the project is and for whom. The brain is the source of truth for its product, architecture, infrastructure and code: a decision is made here first, then carried into the code, and a change that departs from a document updates it in the same pull request.>

<!-- BEGIN:dotbrain index -->
<!-- Generated from document frontmatter. Do not edit by hand; regenerate on conflict. -->

`decisions/`:

- [decisions/README.md](decisions/README.md): Decisions: Proposed, Accepted, Rejected, Superseded
<!-- END:dotbrain index -->

## Steps

<How phases of the roadmap are split into steps in `steps/NN-short-name.md`, or `steps/<ticket-key>-short-name.md` when steps are named by the keys of their tickets in lowercase (`rp-111` for `RP-111`). A step is the spec the work is done by; its status is in the frontmatter (`draft`, `agreed`, `in-progress`, `done`) and is shown in the generated status line under its title and in the index block.>

## Conventions

- Decisions are in subdirectories of `decisions/` by domain (`decisions/<domain>/`), such as `process/` for the rules of work. A domain is a short English name in kebab-case. A new domain is created when a decision fits none of the existing ones; a decision that concerns several domains goes to the one where it has the most effect.
- <Other conventions of this brain not stated in the dotbrain specification, e.g. area directories other than `architecture/`. Remove this item if there are none.>
