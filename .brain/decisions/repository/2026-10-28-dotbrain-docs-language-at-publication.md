---
status: accepted
decided: 2026-11-16
description: "Before publication, the brain and all documentation of dotbrain move to English, so that they are readable for contributors from around the world; the translation is a separate step."
---
# The language of dotbrain documents at publication

## Context

The dotbrain brain is in Polish ([decision](2026-10-28-dotbrain-docs-in-polish.md)), and the specification and the templates are in English ([decision](../model/2026-10-28-section-map-in-manifest.md)). An open project is read by people from outside Poland, but the brain is also a living example that the framework works in any language.

The publication of the `that-simple/dotbrain` repository and of the npm package will be described by a separate step after [step 4](../../steps/04-npm-package.md). The `README.md` of the repository is also the README of the package on npm, so its language is seen by anyone who comes across the package.

The brain has about 70 documents. Moving it to English means translating all documents, the `sections` map, the managed block in `CLAUDE.md` and the rule in `.claude/rules/`, plus changing the decision on the Polish brain. In Polish are the decisions and their rationale, that is what someone who wants to contribute to the framework needs.

## Options

- Move the brain to English before publication.
- Keep the brain in Polish as an example of a brain in a language other than the specification; the README of the repository in English.

## Decision

Before publication, the dotbrain brain and all documentation of the repository, including `README.md`, move to English. The brain is to be readable for contributors from around the world, not only for people who know Polish: the decisions and their rationale are what someone who wants to contribute to the framework needs. The translation is a separate step before the publication step.

## Consequences

Until the end of the translation step, the decision on the [Polish brain](2026-10-28-dotbrain-docs-in-polish.md) is in force. The translation step supersedes it with a decision with `apply: always` on an English brain, changes `lang` in the manifest and moves all documents, the `sections` map, the managed block and the rules to English.

This brain stops being an example of a brain in a language other than the specification. Multilinguality is still checked by the conformance cases and tests with a brain in Polish, and the condition of the Simplicity gate on a project in a language other than this brain will be met by a pilot with a brain in a language other than English ([roadmap.md](../../roadmap.md)). The descriptions that point to this brain as an example in Polish ([languages.md](../../architecture/languages.md), [README.md](../../README.md)) change in the translation step.

## Who decides and when

The owner of the project, before the first publication.
