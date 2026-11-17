---
status: accepted
decided: 2026-11-17
description: "In the managed block of every brain, the concise form of the contract, the tools' additions and the fixed words of the block are in English, and only the titles and texts of rules are in the language of the brain; the block is generated and compared in full."
---
# The contract in the managed block always in English

## Context

The specification allowed translating the concise form of the contract, the tools' additions and the fixed words of the block into the language of the brain in the managed block ([spec/adapters/agents.md](../../../spec/adapters/agents.md#content)). A translation cannot be generated character by character, so the [decision on translated blocks](2026-11-03-translated-managed-blocks.md) introduced a partial comparison for a brain in a language other than English: `V-VIEWS` checks only the parts that follow from the brain, and `index` updates only them and keeps the translation.

This possibility has its costs:

- **The specification and the tools have a separate path for a block in another language.** The specification defines which parts of the block are compared, and the tools merge the generated parts with the translation and report what is left to translate (`tools/src/views.ts`).
- **The tests carry a hand translation of the contract.** The conformance cases with a brain in Polish need a translated contract (`tools/conformance/contract-pl.md`), which is fixed by hand at every change of the contract, although it is not compared.
- **Every brain in another language maintains its own translation.** A change of the contract in a new version of the specification requires the agent to translate the new rules, and `lint` will not detect a translation that is stale or changes the meaning.

The contract is written once, in English, and in a brain in another language the agent applies it without translation ([agent-contract.md](../../architecture/agent-contract.md)). The block is read above all by the agent. The rules of the brain, that is the titles and texts of decisions with `apply`, are the team's content and go into the block in the language of the brain anyway. The framework is to remain the simplest thing that works ([decision](../model/2026-10-28-simplest-thing-that-works.md)).

This decision supersedes the [decision on translated blocks](2026-11-03-translated-managed-blocks.md).

## Options

1. **Keep translating the block (the current state):** the block is wholly in the language of the brain, so a person from the team reads `CLAUDE.md` in one language. The cost is the partial comparison in the specification and the tools, the hand translation in the tests and a translation maintained in every brain without a check by `lint`.
2. **The contract always in English:** the concise form of the contract, the tools' additions and the fixed words of the block (headings of the parts, `Source:`, `Specification:`) are always in English, and only the titles and texts of rules from its documents are in the language of the brain. The block of every brain is generated and compared in full, so the separate path for translations disappears from the specification and the tools, and the translated contract from the tests. Multilinguality is still checked by the example brain in Polish: the `sections` map, documents and rules in Polish. The cost is a block in two languages in a brain other than English and a change of the `CLAUDE.md` of this repository, which today has a block in Polish. On top of that comes the risk that the agent, reading the contract in English, starts writing to the brain in English. Most exposed are the short texts the agent writes by itself: `description`, titles of documents and entries in the log of a step. The risk is limited by the contract rule that the agent writes to the brain in its language and to people in theirs, and by the documents and rules of the brain being in its language. If that were not enough, the language rule could be moved to the start of the block, with `description` and titles added to it explicitly. This cannot be checked here, because after [step 5](../../steps/05-brain-in-english.md) this brain is in English; a pilot with a brain in a language other than English will confirm it.

## Recommendation

Option 2. Translating the block gives the agent nothing, because the contract is applied according to the English version anyway, while it requires a separate path in the specification, the tools and the tests, and work in every brain at every change of the contract. A block in two languages is a small cost for people, because the block is an instruction for the agent, not a document of the brain.

Once accepted, the change will cover: the description of the language of the block and of the comparison in `spec/adapters/agents.md`, `V-VIEWS` in `spec/validity.md`, the sentence on translation in `spec/agent-contract.md`, the steps of translating the block in `templates/README.md` and `templates/agent-setup.md`, merging the translation in `tools/src/views.ts`, the `valid-project-pl` and `error-views-translated` cases in `tools/conformance/build-cases.ts` (without `contract-pl.md`), [languages.md](../../architecture/languages.md), [agent-contract.md](../../architecture/agent-contract.md) and the block in `CLAUDE.md` of this repository. The part about this brain and its `CLAUDE.md` overlaps with [step 5](../../steps/05-brain-in-english.md), so the order of both changes has to be set on acceptance.

## Decision

Option 2. In the managed block of every brain, the concise form of the contract, the tools' additions, the fixed words of the block (headings of the parts, `Source:`, `Specification:`) and the markers and the comment are in English. Only the titles and texts of rules, copied from its documents, are in the language of the brain. The block and the rule files with a glob are generated and compared in full, in every language. The change goes right away, without a step, before [step 4](../../steps/04-npm-package.md) and [step 5](../../steps/05-brain-in-english.md).

## Consequences

The separate path for a translated block disappears from the specification (`spec/adapters/agents.md`, `V-VIEWS` in `spec/validity.md`, `spec/agent-contract.md`, `spec/conformance/README.md`), the starter template and `tools/src/views.ts`. The translated contract disappears from the tests (`tools/conformance/contract-pl.md`). The `error-views-translated` case now checks that a translated contract is a `V-VIEWS` violation. The block in `CLAUDE.md` of this repository and the files in `.claude/rules/` have, until step 5, the contract in English and the rules in Polish.

## Who decides and when

The owner of the project, before the publication of the npm package ([step 4](../../steps/04-npm-package.md)), because the change concerns specification 0.1 and the tools in the package.
