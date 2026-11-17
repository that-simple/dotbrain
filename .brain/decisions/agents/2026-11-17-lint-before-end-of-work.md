---
status: accepted
decided: 2026-11-17
description: "The agent runs `dotbrain lint` before ending work that changed the brain when the CLI is available (rule 23 of the contract, in the work on the brain); in Claude Code a `Stop` hook of the starter template enforces it with the exact version of the package."
---
# `dotbrain lint` before the end of work on the brain

## Context

The [review against the brain](2026-11-03-brain-review-procedure.md) leaves the mechanical checks to a hook of the AI tool, and the starter template was to provide it once the CLI could be downloaded from the npm package ([distribution channels](../tooling/2026-10-28-distribution-channels.md)). [Step 4](../../steps/04-npm-package.md) made the package; [step 6](../../steps/06-lint-hook.md) carries this out. Tools without hooks need a rule of the contract instead. The core of the compact form has 393 of its 400 words ([decision](2026-11-17-contract-core-and-brain-rules.md)).

## Decision

- **The rule.** Rule 23 of the [agent contract](../../../spec/agent-contract.md), in a new section at its end so that no rule is renumbered: if the `dotbrain` CLI is available, the agent runs `dotbrain lint` before ending work that changed the brain, and fixes what it reports. Without the CLI the brain works as before ([optional tools](../tooling/2026-10-28-tools-optional.md)).
- **Its part of the compact form.** The rule is in the work on the brain, not the core: the rule file of the brain is in the agent's context exactly when it changes the brain, and the core keeps within its budget.
- **The hook of Claude Code.** The starter template provides a `Stop` hook in `templates/claude-settings.json`, copied to `.claude/settings.json` when the repository has `CLAUDE.md`; an existing file keeps its content and gets the hook in its `hooks.Stop` list. The hook:
  - runs `npx --yes @that-simple/dotbrain@<version> lint` with the exact version of the package: after the first download it works offline, and a new version does not come in by itself. `init` writes the version it runs from; without the tool, the version is taken from the `README.md` of the dotbrain repository;
  - runs `lint` only when `git status` shows changes in `.brain/`, the root instruction files, `.claude/rules/` or `.github/instructions/`, or when `HEAD` has moved since the last successful check, which it keeps in the `.git/` directory;
  - on a failure of `lint`, ends with code 2 and its output for the agent; with `stop_hook_active`, without `npx` or outside a git repository, it ends with code 0.
- Hooks of other tools are not specified in version `1.0.0` ([decision](2026-11-17-mvp-gate-without-second-ai-tool.md)).

## Consequences

`spec/agent-contract.md`, `spec/adapters/agents.md` (the compact form and the section on hooks), the conformance cases, `templates/brain-rules.md`, the starter procedure in `templates/README.md`, `templates/agent-setup.md` and `init` follow it, and `.claude/rules/dotbrain.md` of this repository carries the rule. This repository keeps its own `Stop` hook, which runs all its checks, `lint` included. A violation reaches the agent before the work reaches a pull request; a turn that does not touch the brain does not pay for `npx`.
