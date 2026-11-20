---
brain: dotbrain
lang: en
spec: 1.0.0
owner: dkowcun
description: "The source of truth of the dotbrain project: the model of the framework, the agent contract, languages, AI integrations, tools, decisions and the plan."
---
# .brain

The source of truth of the dotbrain project: decisions on the model of the framework, the agent contract, integrations with AI tools, tools and distribution. dotbrain works only in a code repository ([decision](decisions/model/2026-11-05-code-repository-only.md)). First a decision in this directory, then the specification, templates and code. Documents live together with the project: when a decision changes, we update the document in the same commit or PR as the rest.

This brain is also the first brain run according to dotbrain, in the code repository of dotbrain ([setup.md](architecture/setup.md)). The frontmatter of this file is the manifest of the brain ([core-model.md](architecture/core-model.md)).

## Index

The list of documents is generated from their `description` ([decision](decisions/model/2026-10-28-generated-index-and-registry.md)).

<!-- BEGIN:dotbrain index -->
<!-- Generated from document frontmatter. Do not edit by hand; regenerate on conflict. -->

- [risks.md](risks.md): Risks of the framework (overengineering, drifting from practice, agent obedience, AI tools, parallel work) and ways to mitigate them.
- [roadmap.md](roadmap.md): Phases from dogfooding to the MVP, that is version 1.0, and the gate with its passing conditions; what is outside 1.0.

`architecture/`:

- [agent-contract.md](architecture/agent-contract.md): The agent contract independent of the tool: why it has its groups of rules, which decisions each rule rests on, and the form in which it reaches agents; the rules themselves are in the specification.
- [ai-integrations.md](architecture/ai-integrations.md): Integrations with AI tools: instruction files, a context package for chats, plugins and skills.
- [core-model.md](architecture/core-model.md): The brain, the manifest, frontmatter, the core document kinds, decisions as ADRs, lifecycles, generated views, conventions and what the brain does not keep.
- [governance.md](architecture/governance.md): Governance of the brain: the owner, the decision process, superseding decisions and the periodic review.
- [languages.md](architecture/languages.md): Language as a property of the brain, keys in YAML, the heading map in the manifest, the agent writing in the language of the brain.
- [overview.md](architecture/overview.md): The problem, the answer (a brain in a code repository), the principles of the framework and the high-level view of its layers.
- [setup.md](architecture/setup.md): Setting up a brain in a code repository: the starter template, the first decisions, instruction files and the review subagent.
- [tooling-and-distribution.md](architecture/tooling-and-distribution.md): The `dotbrain` CLI: `lint`, `index` and `init` ready, `new` and `export` outside 1.0; the conformance suite and the distribution channels of the framework (the public repository and the npm package).

`decisions/`:

- [decisions/README.md](decisions/README.md): Decisions: Proposed, Accepted, Rejected, Superseded

`steps/`:

- [03-init.md](steps/03-init.md): The `init` wizard builds, step by step, a valid skeleton of a brain in a code repository with an instruction for the agent, which finishes the setup: translation, code scan and architecture draft. (`done`)
- [04-npm-package.md](steps/04-npm-package.md): The npm package `@that-simple/dotbrain` ready for publication, with the specification at version 1.0.0 like the package: from the tarball, `init`, `lint` and `index` work in another repository the same as from a clone of dotbrain. (`done`)
- [05-brain-in-english.md](steps/05-brain-in-english.md): The dotbrain brain and all documentation of the repository are in English, with the same meaning as today, readable for contributors from around the world. (`done`)
- [06-lint-hook.md](steps/06-lint-hook.md): The agent runs `dotbrain lint` after every piece of work that changes the brain: in Claude Code through a hook from the starter template, in other tools according to a contract rule, when the CLI is available. (`done`)
- [07-lighter-entry.md](steps/07-lighter-entry.md): A lighter entry to dotbrain: the agent gets only the core of the contract in every task and the rules of work on the brain when it works on the brain, the contract has one normative text, and the framework is run through an agent with a person in the loop: the person reads steps, decisions and risks, the agent finds the rest and keeps the generated views. (`done`)
- [08-publication.md](steps/08-publication.md): dotbrain 1.0 is public: the `that-simple/dotbrain` repository on GitHub with a squashed history and the tag `spec-v1.0.0`, and the package `@that-simple/dotbrain@1.0.0` on npm, with managed blocks linking to the published specification. (`done`)
- [09-tools-code-quality.md](steps/09-tools-code-quality.md): The code of the tools has one checked style (Biome, four spaces), modules with one responsibility each, and the faults found in a review fixed, with the behavior of the CLI unchanged. (`done`)
- [10-tools-review-fixes.md](steps/10-tools-review-fixes.md): `init` stops before writing anything when git ignores a file `index` must read, accepts every real date, and reports each out-of-date view once; a test covers each fix. (`in-progress`)
<!-- END:dotbrain index -->

## Steps

Phases from the roadmap are split into smaller steps, each in a separate file `steps/NN-short-name.md`. A step is the spec the work is done by, agreed by a person before the work ([agent contract](../spec/agent-contract.md), rule 6, [decision](decisions/collaboration/2026-11-03-plan-before-work.md)). The frontmatter of a step has `description` and `status` (`draft`, `agreed`, `in-progress`, `done`). Under the title of a step there is a status line generated from the frontmatter, and the index shows the status next to every step; we change the status only in the frontmatter ([decision](decisions/model/2026-11-03-step-status-in-body.md)). The required sections are Goal, Scope and Acceptance criteria, the others are optional; the headings are the English labels of the section keys, because this brain has no `sections` map in its manifest ([decision](decisions/model/2026-10-28-section-map-in-manifest.md)).

A step is one result that can be reviewed and agreed as a whole. A giant step (e.g. a whole application) is split into several steps, and a large one is divided into stages, carried out one at a time ([agent contract](../spec/agent-contract.md), rules 6, 7 and 18, [decision](decisions/collaboration/2026-11-03-step-stages.md)). Content:

- **Goal:** what is to work after the step, and why.
- **Scope** and **out of scope.**
- **Decisions:** links to documents in `architecture/` and to decisions in `decisions/` the step builds on. Decisions made within the step are recorded as ADRs in `decisions/`.
- **Acceptance criteria:** checkable conditions for finishing.
- **Stages** (in a large step): parts of the work in the order of execution, agreed together with the step.
- **Log:** what was done and when, how it was checked (added during the work).
- **Open questions.**

## Decisions

Every decision is a file `decisions/<domain>/YYYY-MM-DD-slug.md` (the file name is the ID) with the frontmatter `status` (`proposed`, `accepted`, `rejected`, `superseded`), `description` and `decided`. The list in [decisions/README.md](decisions/README.md) is generated from the frontmatter ([decision](decisions/model/2026-10-28-decisions-as-adr.md)).

## Conventions

- Documents in English, file names in English (kebab-case), values in the frontmatter as English keys ([decision](decisions/repository/2026-11-17-dotbrain-docs-in-english.md)). The language concerns this brain, not the framework ([languages.md](architecture/languages.md)).
- Every document has frontmatter with `description` (one sentence).
- Decisions are in subdirectories of `decisions/` by domain: `model/` (the core format and languages), `agents/` (the contract and instruction files), `collaboration/` (work of many people), `setup/` (the starter template), `tooling/` (tools and distribution) and `repository/` (rules of work in this repository). A decision concerning several domains goes to the one where it has the most effect; a new domain is created when a decision fits none of the existing ones ([decision](decisions/repository/2026-11-03-decisions-by-domain.md)).
- Section headings of decisions and steps are the English labels from the specification.
- One topic per file; when a file grows over a few hundred lines, we split it.
- The index block, the status lines of steps and the decision list are generated views; when they are regenerated is set by the [agent contract](../spec/agent-contract.md) (rule 7).
