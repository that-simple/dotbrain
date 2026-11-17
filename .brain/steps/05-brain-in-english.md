---
status: done
assignee: [user:dkowcun]
description: "The dotbrain brain and all documentation of the repository are in English, with the same meaning as today, readable for contributors from around the world."
---
# Step 5: the brain in English

<!-- BEGIN:dotbrain status -->
Status: `done` · Assignee: user:dkowcun
<!-- END:dotbrain status -->

It carries out the [decision on the language of documents at publication](../decisions/repository/2026-10-28-dotbrain-docs-language-at-publication.md): before publication, the brain and all documentation of the repository move to English. The step goes before the publication step and does not depend on [step 4](04-npm-package.md); the order is step 5, step 4, [step 6](06-lint-hook.md) ([roadmap.md](../roadmap.md)).

## Goal

The dotbrain brain and all documentation of the repository are in English, with the same meaning as today, and `lint` and `index --check` pass. A contributor from outside Poland reads the decisions and their rationale without a translator.

## Scope

- **A decision on the English brain** with `apply: always` in `decisions/repository/` (in English, dated the day of the work): the documentation of the repository and the brain are in English, and the rest of the language rules stays unchanged (code, identifiers, comments, messages, file names, frontmatter values, branches, commits, PRs). It supersedes the [decision on the Polish brain](../decisions/repository/2026-10-28-dotbrain-docs-in-polish.md), which gets `superseded` and `superseded-by`. It records what the Consequences of the accepted decision on the language at publication already set, so it is written as `accepted` in the work on the step; if in the work it were to bring anything beyond those Consequences, it is written as `proposed`.
- **Manifest:** `lang: en`, without the `sections` map (an English brain has none according to the index template, and no map means English labels), `description` in English.
- **Translation of all documents of the brain:** the index, `architecture/`, the roadmap, the risks, all decisions (also rejected and superseded) and steps, including this one. We translate the content, titles, headings (English labels from the specification), `description` and link text. File names, decision IDs, frontmatter values and dates stay unchanged.
- **The descriptions that point to this brain as an example of a brain in Polish** change according to the Consequences of the decision on the language: the conventions in the index of the brain, "Example that must work" in [languages.md](../architecture/languages.md) (multilinguality is checked by the conformance cases and tests in Polish) and the condition of the Simplicity gate in [roadmap.md](../roadmap.md) (a pilot with a brain in a language other than English).
- **Outside the brain:** the repository's `README.md` and the subagent `.claude/agents/brain-review.md` in English. The subagent keeps the settings of this repository from the [decision on a lighter review](../decisions/agents/2026-11-06-lighter-brain-review.md), so we translate it rather than replace it with the template. The instruction "Write in Polish" changes to writing in the language of the brain, as in the subagent template: the report is read by the agent, which passes it on to the person in their language.
- **The state of the project** in [roadmap.md](../roadmap.md) and `README.md`: the Simplicity gate has passed, and [step 4](04-npm-package.md), [step 6](06-lint-hook.md) and the publication remain until 1.0.
- **Generated views** through `index`: the managed block in `CLAUDE.md`, `.claude/rules/`, the decision list, the index block and the status lines of steps.
- **No stages:** after the `sections` map is removed, Polish headings are no longer recognized as sections, so a brain translated halfway does not pass `lint`. The work goes on a separate branch and reaches the main branch as a whole.

## Out of scope

- Changes of meaning. A discrepancy or an error found during the translation is reported as a separate proposal.
- Conformance cases and tests with a brain in Polish (`spec/conformance/`, `tools/test/`): they stay in Polish and check multilinguality.
- `spec/` and `templates/`: they are already in English.
- Publishing the repository and the package: a separate step.

## Decisions

- [The language of documents at publication](../decisions/repository/2026-10-28-dotbrain-docs-language-at-publication.md).
- [The dotbrain brain in Polish](../decisions/repository/2026-10-28-dotbrain-docs-in-polish.md): superseded in this step by [the dotbrain brain in English](../decisions/repository/2026-11-17-dotbrain-docs-in-english.md).
- [A language-agnostic framework](../decisions/model/2026-10-28-language-agnostic.md), [the heading map in the manifest](../decisions/model/2026-10-28-section-map-in-manifest.md), [the contract in the managed block in English](../decisions/agents/2026-11-17-managed-block-contract-in-english.md).
- [Editorial changes](../decisions/collaboration/2026-11-03-editorial-changes.md): the translation does not change the meaning.
- Architecture: [languages.md](../architecture/languages.md).

## Acceptance criteria

1. There is no text in Polish in `.brain/`, `README.md`, `CLAUDE.md` and `.claude/`: no Polish diacritics, and a manual review.
2. No file of the brain has changed its name, and the only new file is the decision on the English brain. The decision on the Polish brain is `superseded` with `superseded-by` pointing to the new one.
3. Every document has the same meaning as before the translation; the review against the brain compares the Polish version with the English one.
4. The repository's checks pass, and the managed block in `CLAUDE.md` is in English and up to date.
5. The roadmap and `README.md` say that the Simplicity gate has passed, and that step 4, step 6 and the publication remain until 1.0.

## Log

- 2026-11-17: The brain moved to English in one commit, without stages. A new decision [the dotbrain brain in English](../decisions/repository/2026-11-17-dotbrain-docs-in-english.md) (`accepted`, `apply: always`) supersedes the decision on the Polish brain; the manifest has `lang: en` and no `sections` map; all documents of the brain, the repository's `README.md` and the `brain-review` subagent are translated, and `CLAUDE.md`, `.claude/rules/`, the decision list, the index block and the status lines are regenerated by `index`. Beyond the translation, according to the Consequences of the decision on the language at publication: "Example that must work" in [languages.md](../architecture/languages.md), the state of the project in [roadmap.md](../roadmap.md) and `README.md`, and the conventions of the index. Sentences that described this brain as having a Polish map now say it had one until this step ([heading map](../decisions/model/2026-10-28-section-map-in-manifest.md), [stages](../decisions/collaboration/2026-11-03-step-stages.md)); the manifest example in [core-model.md](../architecture/core-model.md) is a Czech brain, as in languages.md, instead of a Polish one; the quoted words of the owner in the [decision on ticket keys](../decisions/model/2026-11-05-step-ids-from-tracker.md) are translated and marked so; the `init` example in `README.md` uses `--lang=en`. Anchors to the renamed heading "What the brain does not keep" fixed. Checked: `npm run check` (types, `lint` and `index --check` on this brain, conformance cases, 31 tests) passes; no Polish diacritics or „” quotes in `.brain/`, `README.md`, `CLAUDE.md` and `.claude/` (`grep`), and a search for common Polish words finds none; no file of the brain renamed. Found and not changed: the Out of scope of [step 4](04-npm-package.md) still says the tarball carries the `README.md` in Polish until the translation step.
- 2026-11-17: On the instruction of the owner of the brain, the Out of scope of [step 4](04-npm-package.md) now says that the README in English came with this step, so the tarball carries it. Checked: `npm run check` passes.
- 2026-11-17: Review against the brain (the `brain-review` subagent, commits since setting `agreed`): criteria 1, 2, 4 and 5 met, no change of normative weight or wrong term found. It reported the content changes beyond translation already listed in this log, the stale sentence in step 4 (fixed above) and that the Simplicity gate condition in the roadmap did not say this brain is in English; the table now says "a language other than this brain (English)". The review compared the Polish and English versions line by line for links, code spans and numbers in all documents, and read the index, the roadmap, the architecture of the contract, core model and languages, the repository decisions, the README and the subagent in full; the other documents were compared by sample. Checked: `npm run check` passes.
- 2026-11-17: The owner of the brain kept the content changes beyond translation listed above, including the Czech examples in core-model.md and in the decision on the heading map. Step closed. Checked: `npm run check` passes.

## Open questions

None.
