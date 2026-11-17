---
status: accepted
decided: 2026-10-28
description: "Instruction files for agents have a generated managed block; an instruction file is an adapter, not a source of truth, and its manual part contains only operational hints that do not contradict the brain."
---
# Instruction files with a managed block

## Context

Instruction files (`CLAUDE.md`, `AGENTS.md`, Copilot instructions) are generated from one contract ([ai-integrations.md](../../architecture/ai-integrations.md)), but projects add their own content to them.

## Decision

- An instruction file has a **managed block** between the markers `<!-- BEGIN:dotbrain <version> -->` and `<!-- END:dotbrain -->`, where `<version>` is the version of the specification from the manifest ([decision](../model/2026-10-28-spec-version-without-beta-migration.md)). The block is made from the agent contract, the tool's addition and the rules for the agent recorded in the brain. The generator (a tool or an agent according to the specification) changes only the block.
- **Hierarchy: brain > block > manual part.** An instruction file is an adapter, not a source of truth: it decides nothing and does not change the brain.
- **The manual part** outside the block contains only operational hints for the tool and the repository (commands, paths, environment, specifics of the tool), which are not decisions. A decision or a rule of work (e.g. the languages of code and documentation) goes into the brain and comes back into the file through the block.
- The manual part **must not contradict the brain**. An agent that notices a contradiction reports it as a discrepancy, and the brain binds. The contract in the block says so directly.
- The block is a generated view: a conflict in it when merging branches is resolved by regeneration.

## Consequences

Rules for the agent are documents with the `apply` field ([decision](2026-10-28-apply-scope-for-agent-rules.md)). This brain has its block in `CLAUDE.md` at the root of the repository.
