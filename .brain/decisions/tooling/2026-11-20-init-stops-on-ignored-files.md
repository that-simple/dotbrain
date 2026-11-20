---
status: accepted
decided: 2026-11-20
description: "`init` stops before writing anything when git ignores a file the tools read (the brain, the root instruction files, the views and the rule files among them); an ignored `.claude/agents/` stays a warning."
---
# `init` stops when git ignores a file the tools read

## Context

The tools skip the files git ignores ([spec/brain.md](../../../spec/brain.md#concepts)). When git ignores a file `init` writes and the tools read, `index` does not generate its view or `lint` reports it missing, so `init` wrote the whole skeleton and then failed. Two code reviews of [step 9](../../steps/09-tools-code-quality.md) and [step 10](../../steps/10-tools-review-fixes.md) found such cases: `CLAUDE.md`, `.brain/`, `.brain/decisions/README.md`, `.github/instructions/` and `.claude/`. An ignored `.claude/` is common, and with it `init` always ended with exit code 1 after writing.

The [decision on `.claude/rules/`](../agents/2026-11-03-claude-code-rules-directory.md) says that `init` and the starter template check that `.claude/rules/` is not ignored by git, "and report it if it is"; until step 10, `init` reported it as a warning. The other option was to keep the warning and leave the ignored rule files out of the result of the final `lint`, so that `init` ends with success while the rules work only for the person who ran it.

Source: the conversation of the owner with the agent on the fixes of step 10, 2026-11-20. The owner accepted the stop because the specification requires `.claude/rules/` to be committed ([spec/adapters/agents.md](../../../spec/adapters/agents.md)), and the tools skip the ignored files.

## Decision

Before writing anything, `init` asks git about every file it writes that the tools read: the documents of the brain, the root instruction files and every view, the rule files in `.claude/rules/`, `.github/instructions/` and `.brain/AGENTS.md` among them. For an ignored one it stops with an error naming the path and saying to change `.gitignore`, and writes nothing. An ignored `.claude/agents/`, which the tools do not read, stays a warning.

## Consequences

`init` keeps its promise to change nothing when a check fails. The "report" of the decision on `.claude/rules/` is an error that stops `init`; that decision is not superseded, as the error reports the ignored directory. The starter procedure in [templates/README.md](../../../templates/README.md) says the same. Carried out in [step 10](../../steps/10-tools-review-fixes.md).
