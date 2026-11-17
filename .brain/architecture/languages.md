---
description: "Language as a property of the brain, keys in YAML, the heading map in the manifest, the agent writing in the language of the brain."
---
# Languages

The framework is language-agnostic: the language of a brain is decided by the team of the repository ([decision](../decisions/model/2026-10-28-language-agnostic.md)).

## Language as a property of the brain

- A brain has one language of documents, declared with the `lang` field (BCP 47) in the manifest ([core-model.md](core-model.md)). We do not mix languages in one brain.
- The language of code, commits and PRs is a separate decision in the brain with `apply: always` ([agent contract](../../spec/agent-contract.md), rule 17); it may differ from the language of documents.
- File and directory names are always in English (kebab-case), regardless of the language of documents. Thanks to that, tools, links and people find documents in every brain the same way.

## Example that must work

A team keeps the brain of its repository in Polish, and the specification, contract and templates of the framework are in English. The conformance cases and tests with a brain in Polish check this example ([decision](../decisions/repository/2026-10-28-dotbrain-docs-language-at-publication.md)).

- The agent reads the specification in English and writes decisions in Polish, with headings from the `sections` map.
- The managed block in `CLAUDE.md` has the contract in English and the rules in Polish; the tools generate it and check it in full ([decision](../decisions/agents/2026-11-17-managed-block-contract-in-english.md)).
- An independent project in another language uses the same templates without a fork.

## Keys in YAML, the heading map in the manifest

The structure of the brain is language-neutral without translations maintained by the framework ([decision](../decisions/model/2026-10-28-section-map-in-manifest.md)):

- **Values for machines** are English keys in the frontmatter, the same in every language: `status: draft`, `status: accepted`, `apply: always`, `lang: pl`.
- **Section keys** (`goal`, `scope`, `acceptance`, `decision`…) are defined by the specification in English. The heading in the content is in the language of the brain, and the key from the **`sections` map in the manifest** of the brain corresponds to it, e.g. for a Czech brain:

  ```yaml
  lang: cs
  sections:
    goal: Cíl
    scope: Rozsah
    acceptance: Kritéria přijetí
    proposed: Navrhované
  ```

- No map, or no key in the map, means the English label (`## Goal`).
- The map is made by the agent when the brain is set up, by translating the labels from the template.
- The agent and scripts read the same map, so recognizing sections is deterministic, and a new language requires no changes to the framework.

The specification, the agent contract and the templates are in English, in one version. A brain in another language is made by the agent translating the template; `init` does not translate, and the skeleton it builds is translated by the agent ([decision](../decisions/tooling/2026-11-03-init-skeleton-for-agent.md)).

Only decisions and steps have a fixed skeleton of sections; knowledge areas, the roadmap and risks have free content ([core-model.md](core-model.md)).

## Agent

The language the agent writes to the brain in, and the language it talks to a person in, are set by rule 8 of the [agent contract](../../spec/agent-contract.md).
