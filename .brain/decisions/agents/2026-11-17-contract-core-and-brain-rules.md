---
status: accepted
decided: 2026-11-17
description: "The compact form of the contract has two parts: the core, in the managed block of every root instruction file, and the work on the brain, in a rule file of the brain read when the agent works in the brain directory (`.claude/rules/<brain>.md`, `.github/instructions/<brain>.instructions.md`, `<brain-path>/AGENTS.md`)."
---
# The core of the contract in the block, the work on the brain in a rule file

## Context

The managed block is in the agent's context in every task ([the budget of `apply: always` rules](2026-10-28-always-rules-budget.md)), but most of the compact form of the contract was the mechanics of work on the brain: writing decisions, regenerating views, conflicts, logs and numbering of steps. The agent needs them only when it changes the brain. The review of 2026-11-17 found the block in `CLAUDE.md` at about 1300 words ([step 7](../../steps/07-lighter-entry.md)). Tools can deliver instructions for a directory: Claude Code reads `.claude/rules/` with `paths` ([decision](2026-11-03-claude-code-rules-directory.md)), Copilot reads `.github/instructions/` with `applyTo`, and tools reading `AGENTS.md` read the nested file of a directory.

## Decision

- The compact form of the contract ([spec/adapters/agents.md](../../../spec/adapters/agents.md#compact-form)) has two parts, and every rule of the contract is in exactly one of them, as a table in the specification assigns them:
  - **Core:** in the managed block of every root instruction file, at most 400 words, checked by a test in `tools/test/`. It contains the rules every task needs: the brain binds, start with the index, answer questions about the project from the brain, a decision before the work, open decisions, decisions from conversations, discrepancies, the step and the plan before the work, the languages, the order of work, checks and the review.
  - **Work on the brain:** in the rule file of the brain. It contains the file, frontmatter and sections of a new decision, parallel decisions, regenerating views, conflicts, `in-progress`, `assignee`, stages and the log of a step, raw material and what the brain does not keep.
- The language rule (rule 8) is whole in the core: it is short, and the agent that reads the contract in English must always have the rule to write to the brain in its language ([decision](2026-11-17-managed-block-contract-in-english.md)). The setting of `in-progress` and `assignee` moves from rule 6 to rule 7 of the contract, so that each rule falls into one part.
- The rule file of the brain is a generated view, generated only for a root instruction file that exists: `.claude/rules/<brain>.md` with `paths` for `<brain-path>/**` next to `CLAUDE.md`, `.github/instructions/<brain>.instructions.md` with `applyTo` next to `.github/copilot-instructions.md`, and `<brain-path>/AGENTS.md` next to `AGENTS.md`, linked by the first line of "Rules for specific files" in its block. A stale rule file of the brain is removed by the generator.
- The core rule to start with the index makes the agent read a file in the brain before it writes to it, so the rule file is in its context by then, without a link and without a network.

## Consequences

The block in `CLAUDE.md` of this repository is shorter and `.claude/rules/dotbrain.md` holds the work on the brain. `spec/agent-contract.md`, `spec/adapters/agents.md`, `V-VIEWS`, the conformance cases, `tools/src/contract.ts`, `tools/src/views.ts`, the starter (`templates/README.md`, `templates/managed-block.md`, `templates/brain-rules.md`) and `init` follow it. The block of `AGENTS.md` differs from the others by one line.
