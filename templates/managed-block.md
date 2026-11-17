<!-- BEGIN:dotbrain 1.0.0 -->
<!-- Managed block: generated from the agent contract and the brain. Do not edit by hand; change the brain and regenerate. Text outside this block must not contradict the brain. -->

## The brain is the source of truth

<brain-description> The brain is in `.brain/`: decisions, knowledge and the plan of the work. If the brain and the work (code, process, documents outside the brain, this file included) disagree, the brain wins.

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

Specification: [dotbrain 1.0.0](https://github.com/that-simple/dotbrain/blob/spec-v1.0.0/spec/README.md)
<!-- END:dotbrain -->
