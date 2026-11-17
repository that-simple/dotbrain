---
description: "Phases from dogfooding to the MVP, that is version 1.0, and the gate with its passing conditions; what is outside 1.0."
---
# Roadmap

First the simplest version that works in one code repository without tools. The MVP is version 1.0, released as the `1.0.0` package; we do not plan phases after the MVP ([decision](decisions/repository/2026-11-17-mvp-is-1-0.md)). dotbrain works only in a code repository ([decision](decisions/model/2026-11-05-code-repository-only.md)). Dates will be added when it is known who works on the project and for how long. Phases are split into steps in `steps/` ([README.md](README.md)).

## Phases

| Phase | For whom | Scope |
| --- | --- | --- |
| Phase 0: dogfooding | This project | The `.brain/` of dotbrain: principles, model, languages, contract, integrations, decisions and risks |
| MVP (1.0) | A code repository in which many developers work in parallel | The core specification (manifest, frontmatter, decisions as ADRs, keys in YAML, work in git), the agent contract with the `CLAUDE.md`, `AGENTS.md` and Copilot adapters, rules for parallel work on many branches, the starter template, `init`, `lint` and `index`, `dotbrain lint` run by the agent (Claude Code hook, contract rule) |

State: of the MVP, the core specification, the agent contract with adapters, the rules for parallel work, the starter template, `lint`, `index` and `init` are ready ([tooling-and-distribution.md](architecture/tooling-and-distribution.md), [step 3](steps/03-init.md)). The Simplicity gate is passed by a pilot in a project outside dotbrain with a brain in Polish. The pilot was given a link to the dotbrain repository and took the framework from it, before the npm package was published. With this brain in English since [step 5](steps/05-brain-in-english.md), the pilot also meets the condition of a project in a language other than this brain, so the Simplicity gate has passed. The framework has been checked live only with Claude Code, and the condition of two AI tools was dropped from the gate ([decision](decisions/agents/2026-11-17-mvp-gate-without-second-ai-tool.md)). [Step 7](steps/07-lighter-entry.md) is done: it changed the specification and the contract before their publication. [Step 4](steps/04-npm-package.md) made the npm package, and [step 6](steps/06-lint-hook.md) has the agent run `lint` from it: a `Stop` hook of the starter template in Claude Code and rule 23 of the contract. [Step 8](steps/08-publication.md) published 1.0: the repository `that-simple/dotbrain` with the specification at the tag `spec-v1.0.0`, and the package `@that-simple/dotbrain@1.0.0` on npm.

Outside 1.0, without a plan or a date, are `new`, `export` (a context package for chats, e.g. Claude.ai and ChatGPT) and plugins and skills for AI tools ([decision](decisions/repository/2026-11-17-mvp-is-1-0.md)). They come back with a step or a decision when someone needs them.

Integrations according to [ai-integrations.md](architecture/ai-integrations.md), tools according to [tooling-and-distribution.md](architecture/tooling-and-distribution.md).

## Gates

| Gate | After phase | Passing condition |
| --- | --- | --- |
| Simplicity | MVP | A project in which several people work in parallel keeps a brain in its repository using only the templates and the agent contract, without the CLI, and parallel branches do not break the brain; an independent project in a language other than this brain (English) uses the templates without a fork |

The gate after the MVP is deliberately about simplicity: if the framework does not work in one repository without tools, tools will only hide the problem.
