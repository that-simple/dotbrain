# dotbrain

<!-- BEGIN:dotbrain 1.0.0 -->
<!-- Managed block: generated from the agent contract and the brain. Do not edit by hand; change the brain and regenerate. Text outside this block must not contradict the brain. -->

## The brain is the source of truth

The source of truth of the dotbrain project: the model of the framework, the agent contract, languages, AI integrations, tools, decisions and the plan. The brain is in `.brain/`: decisions, knowledge and the plan of the work. If the brain and the work (code, process, documents outside the brain, this file included) disagree, the brain wins.

- Start with `.brain/README.md`, the index of documents: scan the `description` of each document before reading whole documents, and read only what the task concerns.
- Asked about the project, answer from the brain, link the documents the answer rests on, and say when the brain does not cover the question.
- A decision is made in the brain first, then carried into the work. A change that departs from a document updates the document in the same change, for code in the same pull request.
- Do not resolve decisions with `status: proposed`: prepare options and a recommendation if useful, and ask. Change their status only on the explicit instruction of the person who decides.
- A decision found in a conversation, transcript, chat or email is recorded as `proposed` with its source, even if it was made there.
- Rules with `apply: always` are in this block and apply to every task; rules with a glob apply when working with matching files.
- Report any discrepancy between the brain and the work; do not leave it or fix it silently.
- Keep to the scope and acceptance criteria of the step you work on; propose anything outside them. A new step is only written, with `status: draft`; a person sets it to `agreed`, and the work starts after that, on a separate instruction.

## Working in the repository

- Write to the brain in its language (`lang` in the manifest); talk to people in their language.
- The languages of code, comments, commits, branch names and pull requests, and the order of work (brain changes with the work or before it), are decisions in the brain with `apply: always`; without them, ask before assuming.
- Before committing a finished stage of a step and before setting a step to `done`, run the repository's checks and record in its log what was checked and how.
- Before setting a step to `done`, merging a branch into the main branch or committing directly to it, review the change against the brain (the review procedure of the dotbrain specification) and report the discrepancies.

## Claude Code

- Start writing a new step, and carrying out an `agreed` one, in plan mode. If the session is not in plan mode, enter it and present the plan; write the step or do the work only after the person accepts the plan. Accepting the plan does not agree the step: a new step is still written with `status: draft`.

## Rules for this brain

### Dogfooding

This repository is run according to dotbrain. Every change of a convention of the framework (the structure of the brain, frontmatter, decisions, steps, the agent contract, instruction files) also changes this repository's own `.brain/` and instruction files in the same commit or PR. A convention that cannot be applied here by hand or by an agent is too complicated ([2026-10-28-simplest-thing-that-works](.brain/decisions/model/2026-10-28-simplest-thing-that-works.md)).

Source: [decisions/repository/2026-10-28-dogfooding.md](.brain/decisions/repository/2026-10-28-dogfooding.md)

### The brain in the same PR as the work

Changes to `.brain/` (decisions, including `proposed`, steps, documents) go in the same PR as the work that follows from them (changes in `spec/`, `templates/` and outside the brain), together with the generated views and the managed blocks of instruction files. The order of commits in the PR is free: a change to the brain may be in the same commit as the work. The exception is a step: the commit that sets it to `agreed` comes before the work on it, and every finished stage is a separate commit. A `proposed` decision or a new step that concerns the work of other people may reach the main branch earlier in a separate small PR.

Source: [decisions/repository/2026-11-03-brain-in-the-same-pr.md](.brain/decisions/repository/2026-11-03-brain-in-the-same-pr.md)

### The dotbrain brain in English

The documentation of this repository, including everything in `.brain/`, is in English. In English too are: the specification, the agent contract and the templates of the framework, code, identifiers, comments, log and error messages in code, file and directory names, values in the frontmatter, branch names, commits, PR titles and descriptions. This concerns only this brain, not brains created with the framework: the specification and the templates assume no language of the brain.

Source: [decisions/repository/2026-11-17-dotbrain-docs-in-english.md](.brain/decisions/repository/2026-11-17-dotbrain-docs-in-english.md)

## Rules for specific files

- `.brain/decisions/**`: [Decisions as ADRs, a generated list](.brain/decisions/model/2026-10-28-decisions-as-adr.md)

Specification: [dotbrain 1.0.0](spec/README.md)
<!-- END:dotbrain -->
