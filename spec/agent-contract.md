# Agent contract

The rules every AI agent follows when working with the brain and the code of a repository. There is one contract, independent of any tool. The [agents adapter](adapters/agents.md) delivers it to agents in instruction files, as its [compact form](adapters/agents.md#compact-form) in two parts: the core in the managed block of every task, and the rules of work on the brain in a rule file read when the agent works on the brain. Whatever delivers the contract is an adapter of the brain, not its source of truth: if it contradicts the brain, the brain wins.

The contract is written once, in English. In a brain in another language, the agent applies it without translating it: the managed block carries it in English, and only the rules of the brain are in the brain's language.

## Core rules

1. **The brain binds.** If the brain and the work (code, process, a document outside the brain) disagree, the brain wins.
2. **Read first.** Before working, read the brain's index and the documents concerning the area being changed. Read only what the task concerns: first the descriptions in the frontmatter (`description`), then the whole documents that are needed.
3. **Keep to the decisions.** Work according to accepted decisions. A change that departs from them updates the document in the same change.
4. **Do not resolve open decisions.** Decisions with status `proposed` are resolved by the person named in them. You may prepare options and a recommendation, then ask. Change the status to `accepted` or `rejected` only on that person's explicit instruction.
5. **Report discrepancies.** If you notice a discrepancy between the brain and practice, report it; do not leave it silently and do not fix it silently in either direction.
6. **Keep to the step.** When working on a step, keep to its scope and acceptance criteria; propose anything outside the scope. When a new step comes up, only write its document with `status: draft` and end the task there; when its plan describes several results each useful on its own, write several steps ([documents.md](documents.md#steps)); start work only on a step a person has set to `agreed`, on a separate instruction, and never set `agreed` without a person's explicit instruction.
7. **Update the brain.** When the work on a step starts, set its `status` to `in-progress` and its `assignee` to the people doing the work ([documents.md](documents.md#steps)). A new decision is a new ADR file in `decisions/`, followed by regenerating the decision list. Progress of a step goes to its log, as a list entry starting with the date, one entry per finished stage in a step with `stages`; a new document (with frontmatter) goes to the index block; a change of the `status` or `assignee` of a step is followed by regenerating its status line and the index block.

## Language rule

8. **Write in the language of the brain.** Write to the brain in its language (`lang` in the manifest). Talk to a person in the language the person uses.

## Conflict rules

9. **Regenerate generated views.** Resolve a conflict in a generated view (such as `decisions/README.md`) by generating it again from the frontmatter, never by merging it by hand ([generated-views.md](generated-views.md)).
10. **Understand conflicts in documents before merging.** For a conflict in a document (except those covered by rules 12 and 13), read both versions and the version before the changes. Combine what does not contradict. Report a contradiction (such as two changes of the same decision in opposite directions) to a person and record it as a `proposed` decision with both options; do not choose yourself. Until it is resolved, the version on the main branch binds: if a decision accepted on your branch contradicts an accepted decision that reached the main branch first, turn yours back to `proposed` before merging and make it the decision on the contradiction ([documents.md](documents.md#lifecycles)), and keep from the main branch the fields and links that can name only one decision (`superseded-by`, links in steps). This reopens the matter; it does not resolve it, so rule 4 does not apply.
11. **Detect parallel decisions.** When adding a decision, check the descriptions of existing decisions. If another decision concerns the same matter (also one added in parallel on another branch), report it instead of writing a second one.
12. **Merge step logs mechanically.** For a conflict in the log of a step, keep the entries of both sides, sorted by date, with entries already on the main branch first within the same date. Do not merge or change their text.
13. **Renumber your own step.** If a step added on your branch has the number of a step that reached the main branch first, give your step the first free number before merging and fix the links to it. Never renumber steps already on the main branch.

## Content rules

14. **Keep raw material at its source.** From recordings, transcripts, emails, documents or contracts, write to the brain what follows from them (decisions, knowledge, open questions) with a link to the source, never the material itself, also not pasted into a markdown file ([brain.md](brain.md#concepts)).
15. **A decision from outside the brain is a proposal.** Record a decision extracted from a conversation or another source outside the brain (a transcript, a chat, an email, an account of a meeting) as `proposed`, with its source, even if it was made there. Set `accepted` only on the explicit instruction of the person who decides (rule 4); an account of a conversation is not such an instruction.

## Rules of work in the repository

16. **The brain binds the code.** A code change that departs from a document updates the document in the same pull request.
17. **Languages of the work are a decision.** The languages of code, identifiers, comments, log and error messages, commits, branch names and pull requests are recorded in the brain as a decision with `apply: always`. Documentation is in the brain's language. Without such a decision, ask before assuming.
18. **Checks before a stage and before done.** Before committing a finished stage of a step and before setting a step to `done`, run the repository's checks (tests, linters, build) and record in the step's log what was checked and how.
19. **Keep the brain clean.** Do not put run instructions, commands, personal notes or personal data into the brain ([brain.md](brain.md#what-the-brain-does-not-keep)).
20. **The order of work is a decision.** Whether changes to the brain go in the same pull request as the work that follows from them, or to the main branch in a separate pull request before it, is recorded in the brain as a decision with `apply: always`; the [starter](../templates/README.md) sets up "brain changes with the work" by default. Without such a decision, ask before assuming. Rule 16 applies in either order.
21. **Review before closing.** Before setting a step to `done`, before merging a branch into the main branch and before committing directly to the main branch, run the [review against the brain](review.md) and report the discrepancies it finds to the person you work with.

## Answering questions

22. **Answer from the brain.** When a person asks about the project, answer from the brain: link the documents the answer rests on, and say when the brain does not cover the question instead of filling the gap with a guess. A person reads steps, the content of decisions and the risks, and asks the agent for the rest.

## Checking the brain

23. **Lint the brain you changed.** If the `dotbrain` CLI is available, run `dotbrain lint` before ending work that changed the brain, and fix what it reports. A tool that runs hooks MAY run it in a hook ([agents adapter](adapters/agents.md#hooks)).
