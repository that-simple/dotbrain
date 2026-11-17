---
status: accepted
decided: 2026-11-03
description: "`init` is a wizard that collects answers question by question and builds from them a valid skeleton of a brain with a setup instruction; the rest (translation, code scan, architecture draft, decisions from the code) is done by the agent."
---
# The role of `init`: a wizard of the skeleton, finished by the agent

## Context

The roadmap has `init` in the MVP ([roadmap.md](../../roadmap.md)). The brain described it as a tool that sets up a brain in a code repository by itself according to the starter template, interactively or from an answers file, in the chosen language.

An offline tool without a model cannot do part of this work, because it requires judgment: translating the templates, describing the project and optional documents without inventing content. In an existing code repository it also cannot do what gives the brain the most value from the first day: describing the architecture based on the code and the decisions that follow from the code. An agent can do that. A tool does better what is deterministic: generated views, checking the whole brain with one command and checking in CI, independently of the agent's obedience.

Source: a conversation with the owner of the brain when planning [step 3](../../steps/03-init.md), 2026-11-03.

## Decision

`init` creates the skeleton, and the agent completes it; it does not set up the whole brain by itself and does not leave all the work to the agent.

- `init` is a wizard: it asks the questions of the starter template's procedure ([setup.md](../../architecture/setup.md)) one at a time, with default values where they can be determined (the name of the brain from the name of the directory, the owner from the git configuration, the order of work according to the default rule of the template). The same answers can be given without questions, for scripts and tests.
- From the answers, `init` builds a skeleton that passes `lint` and the check of views right away: the manifest, the decisions from the answers, the decision list, the index block, the managed blocks of instruction files and the review subagent. It takes the content from the templates, and generates the views with the same logic as `index`.
- The skeleton carries a setup instruction that an agent in every tool will find, and at the end `init` prints an instruction for the agent. Where exactly the instruction lies is set by [step 3](../../steps/03-init.md).
- The agent finishes the setup according to the procedure of the template: it translates the templates for a brain in another language, scans the code and drafts the architecture with links to the code, and records decisions read from the code as `proposed` with their source ([pattern](../agents/2026-10-28-decisions-extracted-from-conversations.md)). At the end, the setup instruction disappears from the skeleton, and the agent checks the result.
- Without the tool, the whole setup, with the wizard's questions, is done by an agent according to the same procedure ([optional tools](2026-10-28-tools-optional.md)).

## Consequences

`init` does not translate: in a brain in another language, the skeleton is in English until the agent translates the `sections` map, the headings and the text of the templates. The descriptions of `init` and of translating the templates in [tooling-and-distribution.md](../../architecture/tooling-and-distribution.md), [setup.md](../../architecture/setup.md) and [languages.md](../../architecture/languages.md) change together with this decision. The procedure of the [starter template](../../../templates/README.md) gets a code scan step and works the same with `init` and without it. Plugins for agents are outside 1.0 ([decision on distribution channels](2026-10-28-distribution-channels.md)).

## Who decides and when

The owner of the brain (dkowcun).
