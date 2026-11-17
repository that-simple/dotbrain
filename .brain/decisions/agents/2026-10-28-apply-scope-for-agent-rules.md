---
status: accepted
decided: 2026-10-28
description: "The apply field (always, a glob or none) says when a decision goes into the agent's context; the effective set is the rules of the brain, limited by the budget."
---
# The scope of rules for the agent: the `apply` field

## Context

Some decisions are rules of work the agent must know in every task (e.g. the languages of commits), and some concern only one area or are rarely needed. Cursor (`alwaysApply`, `globs`) and GitHub Copilot (`applyTo`) solve the same problem with three modes: always, for matching files, on request by description.

## Decision

- A document (usually a decision) may have the `apply` field in its frontmatter:
  - `apply: always`: always in the agent's context (in the managed block of instruction files);
  - `apply: "<glob>"` or a list of globs: only when working with matching files of the repository;
  - no field: on request, the agent finds the document by its `description`.
- **The effective set** of rules is the documents of the brain with `apply`, of decisions only the `accepted` ones.
- **Budget:** `lint` (or the agent) warns when the effective `always` set exceeds the limit ([decision](2026-10-28-always-rules-budget.md)); excess rules move to a glob or to on request.
- The set is computed by the generator of the block. Adapters: the managed block in `CLAUDE.md` and `AGENTS.md` for `always`, rules with a glob in `.claude/rules/` for Claude Code ([decision](2026-11-03-claude-code-rules-directory.md)) and Copilot instruction files with `applyTo`.
