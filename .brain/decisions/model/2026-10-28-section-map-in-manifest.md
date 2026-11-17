---
status: accepted
decided: 2026-10-28
description: "Keys in YAML and a heading map in the manifest of the brain instead of language packs; a fixed skeleton only for decisions and steps, free knowledge areas; specification and templates in English."
---
# A heading map in the manifest, a skeleton only where needed

## Context

The framework does not maintain translations of templates and labels: the agent translates a template into the language of the brain by itself, and scripts need only an unambiguous heading → key map. A common structure is needed for deterministic steps without an LLM (e.g. collect the open questions from all steps), but not every document needs it: the agent understands a knowledge area from its context.

## Decision

- **Values for machines** (`status`, `apply`, `lang` etc.) are English keys in the frontmatter, the same in every language.
- **Section keys** are defined by the specification in English (e.g. `goal`, `scope`, `acceptance`, `decision`), with default English labels.
- **The heading map** is in the manifest of the brain (the `sections` field): key → heading in the language of the brain, also for the headings of generated lists (e.g. `proposed: Navrhované`). No map, or no key in the map, means the English label. The map is made by the agent when the brain is set up, by translating the labels. The agent and scripts read the same map, so parsing is deterministic.
- **A fixed skeleton only where machines rely on it:**

  | Document kind | Required sections | Optional sections |
  | --- | --- | --- |
  | `proposed` decision | `context`, `options`, `decider` | `recommendation` |
  | `accepted`, `rejected`, `superseded` decision | `decision` | `context`, `consequences` |
  | Step | `goal`, `scope`, `acceptance` | `out-of-scope`, `decisions`, `stages`, `log`, `open-questions` |
  | Knowledge area, roadmap, risks | none (only `description` in the frontmatter) | — |

  Additional sections are always allowed.
- **No language packs.** The specification, the agent contract and the templates are in English; a brain in another language is made by the agent translating the template.

## Consequences

There is one version of the specification, so there is no question of which language binds. Every brain carries its own crib sheet of headings, so a new language requires no changes to the framework. This brain had a map in Polish in its manifest until it moved to English in [step 5](../../steps/05-brain-in-english.md) ([README.md](../../README.md)).
