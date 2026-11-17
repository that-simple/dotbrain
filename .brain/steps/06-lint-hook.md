---
status: done
assignee: [user:dkowcun]
description: "The agent runs `dotbrain lint` after every piece of work that changes the brain: in Claude Code through a hook from the starter template, in other tools according to a contract rule, when the CLI is available."
---
# Step 6: `dotbrain lint` run by the agent

<!-- BEGIN:dotbrain status -->
Status: `done` · Assignee: user:dkowcun
<!-- END:dotbrain status -->

It carries out the part of the [decision on the review against the brain](../decisions/agents/2026-11-03-brain-review-procedure.md) that step 4 postponed: the mechanical checks are enforced by a hook of the AI tool, and the starter template provides it when the CLI is in the npm package. It depends on [step 4](04-npm-package.md) (the package and its test from the tarball) and must be ready before the publication step, because it belongs to 1.0 ([roadmap.md](../roadmap.md)).

## Goal

In a repository set up with the starter template or by `init`, the agent runs `dotbrain lint` after every piece of work that changes the brain. In Claude Code a hook enforces it, and in other tools a contract rule, when the CLI is available. A violation goes back to the agent before the end of the work, before it reaches a PR, and the brain still works without the CLI ([decision on optional tools](../decisions/tooling/2026-10-28-tools-optional.md)).

## Scope

- **A `Stop` hook for Claude Code** in the `templates/claude-settings.json` template, modelled on the `.claude/settings.json` of this repository: the `stop_hook_active` guard, and on a violation exit code 2 with the list of violations for the agent. Details:
  - **Version:** the hook runs `npx --yes @that-simple/dotbrain@<version> lint` with the exact version of the package, not a range. After the first download it then works offline and does not query the registry at every turn, and a new version does not come in by itself. `init` writes the version of the package it runs from; without the tool, the starter procedure says to write the version from the `README.md` of the dotbrain repository.
  - **When:** `lint` runs only when `git status` shows changes in `.brain/`, instruction files, `.claude/rules/` or `.github/instructions/`, or when `HEAD` has changed since the last successful check (a change to the brain committed in the same turn). The hook stores the last checked `HEAD` in the `.git/` directory, outside the files of the repository. A turn that does not touch the brain does not pay for `npx` and is not blocked.
  - **Without Node or `npx`**, the hook ends with code 0.
- **The starter procedure** in `templates/README.md` (instruction files): with `CLAUDE.md`, copy the template to `.claude/settings.json`, and when the file already exists, add the hook to `hooks.Stop` without changing the rest of the file.
- **`init`** writes `.claude/settings.json` from the template. It does not overwrite an existing file: in `DOTBRAIN-SETUP.md` it tells the agent to add the hook.
- **A contract rule** for tools without hooks: a decision in `decisions/agents/`, written in the work on the step as `accepted`, because it carries out this step; if in the work it were to bring anything beyond this scope, it is written as `proposed`. The rule in the work on the brain of the compact form of the contract and in `spec/agent-contract.md`: if the `dotbrain` CLI is available, the agent runs `dotbrain lint` before the end of work that changed the brain, and fixes what it reports. Together with it, the rebuilt conformance cases, the rule file of the brain `.claude/rules/dotbrain.md` of this repository and [agent-contract.md](../architecture/agent-contract.md).
- **Specification:** in `spec/adapters/agents.md`, the starter template provides a hook with `lint` for Claude Code.
- **Brain:** [setup.md](../architecture/setup.md) and [tooling-and-distribution.md](../architecture/tooling-and-distribution.md) describe the hook and the rule.
- **Tests** in `tools/test/`: `init` writes `.claude/settings.json` with the exact version and does not overwrite an existing file; the hook script skips `lint` without changes in the brain and runs it after a change in `.brain/` and after a new commit; with the package installed from the tarball (the package test from step 4) the hook ends with code 0 on a valid brain and with code 2 on a violation.

## Out of scope

- Hooks of other tools: in the MVP only Claude Code is checked live ([decision](../decisions/agents/2026-11-17-mvp-gate-without-second-ai-tool.md)); other tools get the contract rule.
- `index --check` in the hook: `lint` checks the freshness of the views through `V-VIEWS`.
- A warning when Node or `npx` is missing.
- Publishing the package: the publication step.

## Decisions

- [Review of changes against the brain](../decisions/agents/2026-11-03-brain-review-procedure.md): the hook enforces the mechanical checks.
- [Optional tools](../decisions/tooling/2026-10-28-tools-optional.md): the contract rule works only when the CLI is available.
- [Distribution channels](../decisions/tooling/2026-10-28-distribution-channels.md): the CLI from the npm package.
- [The MVP is version 1.0](../decisions/repository/2026-11-17-mvp-is-1-0.md).
- [The contract in the managed block in English](../decisions/agents/2026-11-17-managed-block-contract-in-english.md): the rule goes into the block in English.

## Acceptance criteria

1. A repository with `CLAUDE.md` set up by `init` has a `.claude/settings.json` with a `Stop` hook that runs `npx --yes @that-simple/dotbrain@<version> lint` with the exact version of the package `init` ran from; an existing `.claude/settings.json` stays unchanged, and `DOTBRAIN-SETUP.md` says to add the hook to it.
2. The hook does not run `lint` when the brain, the instruction files and the rule files have not changed in the working tree and `HEAD` is the same as at the last successful check; it runs it after a change in `.brain/` and after a new commit; without Node or `npx` it ends with code 0.
3. With the package installed from the tarball, the hook ends with code 0 on a valid brain and with code 2 with the violation on the error output when the brain has one.
4. `templates/README.md` describes copying or adding the hook, `spec/adapters/agents.md` the hook of the starter template, and the work on the brain of the compact form of the contract and `spec/agent-contract.md` the rule on `dotbrain lint`; the decision on the rule is in `decisions/agents/`, and the rule file of the brain `.claude/rules/dotbrain.md` of this repository carries it.
5. The repository's checks pass and include the tests from the scope.

## Log

- 2026-11-17: Work started.
- 2026-11-17: The `Stop` hook in `templates/claude-settings.json`, written by `init` with the version of its package (an existing `.claude/settings.json` is left, and `DOTBRAIN-SETUP.md` gets the step to add the hook), rule 23 of the contract in the work on the brain ([decision](../decisions/agents/2026-11-17-lint-before-end-of-work.md)), the starter procedure, `spec/adapters/agents.md`, the conformance cases and the brain. Checked with `npm run check` (types, `lint`, `index --check`, freshness of the cases, 48 tests): `tools/test/hook.test.ts` runs the hook with a fake `npx` (skips without changes, runs after a change in `.brain/`, in an instruction file and after a commit, code 2 on a failure, code 0 with `stop_hook_active`, without `npx` and outside git), `init.test.ts` checks the exact version and an existing settings file, and `package.test.ts` runs the hook with the package installed from the tarball and `npx` offline: code 0 on a valid brain, code 2 with the violation on the error output after a `description` is removed.

- 2026-11-17: Review against the brain (`brain-review` subagent): no contradiction with the brain. Of its two minor points, the change of criterion 4 is in the commit that set the step to `agreed`, on the instruction of the owner, not in the work, and `init` writes `.claude/settings.json` always because it always has `CLAUDE.md`. `npm run check` passes again (48 tests). The state in [roadmap.md](../roadmap.md) is updated: until 1.0, the publication remains. Step done.

## Open questions

None. The rule on `dotbrain lint` goes into the work on the brain, not the core of the compact form: the core has 393 of its 400 words, and the rule file of the brain is read exactly when the agent changes the brain (instruction of the owner, 2026-11-17).
