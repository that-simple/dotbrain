---
description: "Integrations with AI tools: instruction files, a context package for chats, plugins and skills."
---
# Integrations with AI tools

How the brain gets into AI tools. Every integration is an adapter of the same model ([core-model.md](core-model.md)) and contract ([agent-contract.md](agent-contract.md)); no feature of the framework exists in only one tool ([decision](../decisions/agents/2026-10-28-ai-tool-independence.md)).

The ways, from the simplest. Each next one is optional.

## 1. Instruction files in the repository

The agent contract and a pointer to the index of the brain in files the tools read by themselves:

| File | Tools |
| --- | --- |
| `CLAUDE.md` | Claude Code |
| `AGENTS.md` | Codex and other tools that read this standard |
| `.cursor/rules/` | Cursor |
| `.github/copilot-instructions.md` | GitHub Copilot |

The files are made from one source of the contract (by `init` and `index`, or by an agent following the specification, [tooling-and-distribution.md](tooling-and-distribution.md)) as a managed block; outside the block the project adds only operational hints that do not contradict the brain ([decision](../decisions/agents/2026-10-28-instruction-files-managed-block.md)). The block carries the core of the contract; the rules of work on the brain go into a rule file of the brain, which the tool reads when the agent works in the brain directory: `.claude/rules/<brain>.md`, `.github/instructions/<brain>.instructions.md` or `<brain-path>/AGENTS.md` ([decision](../decisions/agents/2026-11-17-contract-core-and-brain-rules.md)). Rules with `apply: always` go into the block; rules with a glob go where the tool supports a scope: `globs` in Cursor rules, `applyTo` in Copilot instructions, `paths` in `.claude/rules/` for Claude Code ([decision](../decisions/agents/2026-10-28-apply-scope-for-agent-rules.md), [`.claude/rules/`](../decisions/agents/2026-11-03-claude-code-rules-directory.md), the content of the block and the budget in [spec/adapters/agents.md](../../spec/adapters/agents.md)). The agent reads the index and the documents it needs by itself.

The block in the instruction file of one tool may have that tool's addition from the agents adapter. In Claude Code, writing a step and carrying it out start in plan mode, and after the plan is accepted they go on in auto mode; the agent turns plan mode on by itself according to the addition in the block of `CLAUDE.md`. Accepting the plan does not agree the step ([decision](../decisions/agents/2026-11-03-claude-code-plan-mode.md)).

## 2. Context package

For chats without access to files: Projects in Claude.ai, Projects and Custom GPTs in ChatGPT, other assistants with knowledge uploaded from files.

- The package is an export of the brain or a part of it (e.g. the contract, the index, the decisions and one area) to one markdown file or a small set of files.
- The contract goes into the instructions of the chat's project, the content into its knowledge.
- The package is a copy at the moment of export; the source of truth stays the brain in the repository, and changes are carried into it through a PR ([agent contract](../../spec/agent-contract.md), rules 1 and 16).

Assembling the package by hand according to the instructions is enough; the export tool (`export`) is outside 1.0, without a plan ([decision](../decisions/repository/2026-11-17-mvp-is-1-0.md)).

## 3. Plugins and skills

Outside 1.0, without a plan ([decision](../decisions/repository/2026-11-17-mvp-is-1-0.md)). For tools that support them (e.g. Claude Code skills and plugins): ready procedures on top of the contract, e.g. `new-step` (a step from the template), `decide` (an open decision with options), `sync-brain` (a check of discrepancies brain ↔ work), `review-brain` (the periodic review). Every procedure must also be described in the contract or a template, so that it can be done in a tool without plugins.

`sync-brain` is already available as the review against the brain ([spec/review.md](../../spec/review.md)): in Claude Code it is a subagent copied by the starter template, and the mechanical checks are enforced by a hook of the tool where tools are available ([decision](../decisions/agents/2026-11-03-brain-review-procedure.md)).

## Principles

- Instruction files first, because they work everywhere and cost nothing.
- We generate the adapters from one source, so that a change in the format of one tool does not make the contract drift apart.
