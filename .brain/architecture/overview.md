---
description: "The problem, the answer (a brain in a code repository), the principles of the framework and the high-level view of its layers."
---
# Overview: problem, principles and high-level view

## Problem

Decisions and knowledge about a project are scattered: in Confluence, Notion, Slack, emails, tickets and people's heads. Documentation is written after the fact and quickly drifts away from the code. AI agents get a task without the context of the decisions, so they settle in their own way things that are already settled or that a person should decide.

## Answer

dotbrain is an open framework for working with AI agents in a code repository. Its core is **the brain**: a `.brain/` directory of markdown documents, the single source of truth for agents and people, where a decision is made before the work is done, knowledge about the project lives and the work is planned as steps a person agrees, and where people and agents work by one contract. The brain goes through review together with the code ([decision](../decisions/model/2026-11-05-code-repository-only.md)); whether changes to it go in the same PR as the work or in a separate PR before it, the repository sets with a decision when the brain is set up ([setup.md](setup.md)).

dotbrain provides: the model of the brain ([core-model.md](core-model.md)), the agent contract ([agent-contract.md](agent-contract.md)), integrations with AI tools ([ai-integrations.md](ai-integrations.md)) and the starter template ([setup.md](setup.md)), with the `dotbrain` CLI keeping the generated views ([tooling-and-distribution.md](tooling-and-distribution.md)).

## Principles of the framework

1. **The brain binds.** When the brain and practice (code, process, the team's behaviour) disagree, the document wins or the document changes. We do not leave a discrepancy.
2. **Decision before the work.** A decision is made in the brain first, then carried into the work. A change that departs from a document updates it in the same PR.
3. **Open decisions belong to a person.** Agents prepare decisions; a person makes them ([agent contract](../../spec/agent-contract.md), rule 4).
4. **Plain markdown in a code repository, readable without tools.** People read and edit the brain in any editor and on GitHub. Generated views and instruction files are kept by the CLI, or by an agent without it, never by hand ([decision](../decisions/tooling/2026-11-17-cli-keeps-generated-views.md)).
5. **The simplest thing that works.** A brain in a code repository without the CLI, with an agent keeping the views, is a full use of the framework, not a demo version. Every convention must be applicable by an agent following the specification, and every document readable and writable by a person. We measure effectiveness by use (whether people and agents make decisions through the brain), not by the number of features.
6. **A small core.** Only the index and decisions are mandatory; the rest (areas, roadmap, risks, steps) comes when it is needed.
7. **Read only what the task concerns.** The index of the brain is a map for people and agents; nobody has to know the whole to work correctly.
8. **Language-agnostic.** The framework imposes no language; a brain has its own, and the structure is recognizable regardless of the language ([languages.md](languages.md)).
9. **Independence from the AI tool.** One contract and many adapters; no feature of the framework exists in only one tool ([ai-integrations.md](ai-integrations.md)).
10. **An agent with a person in the loop.** A person reads and agrees steps and looks at them again when they are carried out, reads the content of decisions and possibly the risks; for anything else the person asks the agent, which answers from the brain ([decision](../decisions/model/2026-11-17-agent-with-a-person-in-the-loop.md)).

## High-level view

| Layer | What it is | Required |
| --- | --- | --- |
| Core | Manifest, frontmatter, document kinds (index, decisions, roadmap, risks, areas, steps), lifecycles, conventions, work in git; specification and templates in English | Yes |
| Agent contract | Rules for an agent's work with the brain and the code, independent of the tool | Yes |
| AI integrations | Instruction files, context package, plugins and skills | Instruction files yes, the rest no |
| Tools | `init`, `new`, `lint`, `index` | No: without the CLI, an agent keeps the views |

The source of truth is always the brain. Everything outside the core and the contract reads it, checks it or makes it available, but does not replace it.
