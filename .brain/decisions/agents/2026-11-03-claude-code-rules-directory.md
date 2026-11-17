---
status: accepted
decided: 2026-11-03
description: "Rules with a glob for Claude Code are generated into `.claude/rules/<brain>-<name>.md` with a `paths` field, instead of into a `CLAUDE.md` in the base directory of the glob."
---
# Rules with a glob for Claude Code in `.claude/rules/`

## Context

Claude Code loads `.claude/rules/*.md` files with a `paths` field in the frontmatter (a list of globs) when it reads, writes or edits a matching file. It resolves the patterns relative to the directory containing `.claude/`. A file without `paths` is loaded at startup ([Claude Code documentation](https://code.claude.com/docs/en/memory#organize-rules-with-claude/rules/)). The patterns agree with the `apply` syntax ([the scope of `apply` rules](2026-10-28-apply-scope-for-agent-rules.md)) with one exception: a pattern without `/` (e.g. `*.md`) matches in any directory in Claude Code, and only at the root of the repository in `apply` ([spec/documents.md](../../../spec/documents.md#apply)). The equivalent in Claude Code is `/*.md`.

## Decision

Rules with a glob for Claude Code are generated into `.claude/rules/<brain>-<name>.md` in the root directory of the repository, with the same name and layout as Copilot instructions. The whole file is generated: `paths` carries the globs of the rule, and the content is a managed block with the title, the text of the rule and a link to the source. A glob without `/` gets a leading `/` in `paths`, so that it means the same as in `apply`. Rules with the base directory at the root also get a file with a scope. There are no `CLAUDE.md` files in subdirectories, and the `CLAUDE.md` in the root directory stays for `always` rules. The visible list of rules with a glob for people and other tools stays the "Rules for specific files" section in the main block; `.claude/rules/` is only the way of delivering them to Claude Code. A missing or stale rule file is a stale view (`V-VIEWS`). `init` and the starter template check that `.claude/rules/` is not ignored by git, and report it if it is; otherwise the rule would work only for its author. The directory is created only with the first rule with a glob.

The instruction file does not lie in the brain, rules with a glob are in one directory, as with Copilot, and Claude Code gets every rule with a scope, also `**/*.ts`.

## Consequences

This is described by the table of tools in `spec/adapters/agents.md`. In this repository: `.claude/rules/dotbrain-2026-10-28-decisions-as-adr.md`.

## Who decides and when

The owner of the project.
