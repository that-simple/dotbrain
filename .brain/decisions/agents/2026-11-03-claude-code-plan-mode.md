---
status: accepted
decided: 2026-11-03
description: "In Claude Code, writing a step and carrying it out start in plan mode, and after the plan is accepted they go on in auto mode; the agent turns plan mode on by itself according to a line in the block of `CLAUDE.md`."
---
# Plan mode in Claude Code when working on a step

## Context

Work on a step is [first the plan of the step, then the work](../collaboration/2026-11-03-plan-before-work.md). Plan mode in Claude Code adds one more acceptance by a person in the plan and in the work: before the agent writes anything, the person accepts the plan in the conversation, and then the agent writes it without asking about every change. Auto mode is chosen by the person when accepting the plan; the agent does not turn it on. The agent in Claude Code can turn plan mode on by itself. The agent contract is independent of the tool ([decision](2026-10-28-ai-tool-independence.md)), so the way of working in one tool belongs to the adapter (`spec/adapters/agents.md`), not to the core of the contract.

## Decision

In Claude Code, writing a step and carrying it out start in plan mode by default: the agent presents the plan, the person accepts it and chooses auto mode, in which the agent writes or carries it out. Accepting the plan in plan mode does not agree the step: the document of the step is written with `status: draft`, and `agreed` is set by a person. In the work, the plan in plan mode is the way of carrying out an already agreed step (e.g. its stages, [step size and stages](../collaboration/2026-11-03-step-stages.md)). The way of working is described by the adapter for Claude Code and the README of the starter template, and the managed block of `CLAUDE.md` (only this instruction file) has a line according to which the agent, at the start of writing a step and of carrying it out, turns plan mode on by itself when the session is not in it. The core of the contract stays unchanged.

The block is made from the contract, the rules of the brain and the tool's addition from the agents adapter, which goes only into the instruction file of that tool ([instruction files with a managed block](2026-10-28-instruction-files-managed-block.md)). The blocks of the instruction files of one brain thus differ in relative links and in the tool's addition.

## Consequences

- `spec/adapters/agents.md` describes the way of working in Claude Code and the tool's addition as part of the block of `CLAUDE.md`; the addition is in English like the concise form ([decision](2026-11-17-managed-block-contract-in-english.md)).
- In this brain: [ai-integrations.md](../../architecture/ai-integrations.md); in this repository, the managed block of `CLAUDE.md`.

## Who decides and when

The owner of the brain (dkowcun).
