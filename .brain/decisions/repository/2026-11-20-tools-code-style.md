---
status: accepted
decided: 2026-11-20
description: "The code of the tools is formatted and linted by Biome, a pinned devDependency run in `npm run check`: four-space indentation, lines up to 120 characters, the recommended lint rules."
---
# Code style of the tools

Source: conversation with the agent, 2026-11-20. The owner asked for Biome and for four-space indentation instead of two, and chose the line width and the scope of the check in the same conversation, and accepted this decision there.

## Context

The code of the tools (`tools/`) has no formatter and no linter. Its style is kept by hand: two-space indentation, double quotes, semicolons, trailing commas, and lines of any length, up to 527 characters; 249 lines are longer than 100 characters. Nothing in `npm run check` checks the style, so it drifts with every change, and a review spends attention on it.

The tools have no runtime dependencies ([tooling-and-distribution.md](../../architecture/tooling-and-distribution.md)). A devDependency does not change that: it is not installed with the package.

## Options

- **Biome**: one devDependency that formats and lints TypeScript and JSON, configured in one file, without plugins.
- **Prettier and ESLint**: two tools, ESLint with the TypeScript parser and plugins, and their configurations kept in step.
- **No tool**: the style stays kept by hand.

## Decision

Biome, as a devDependency pinned to an exact version (`@biomejs/biome` 2.6.8), with `biome check` (the formatter and the linter with the `recommended` rules) in `npm run check`, so the checks of this repository and its `Stop` hook enforce it.

- Indentation with four spaces; lines up to 120 characters; double quotes, semicolons and trailing commas, as today.
- The scope is `tools/**` and the JSON files at the root of the repository. `templates/`, `spec/`, `.brain/` and `dist/` are outside it: templates and the specification are text of the framework read by people and other implementations, not code of the tools.
- The configuration is `biome.jsonc`, because Biome accepts comments only there; a lint rule turned off in it has its reason written next to it, in a comment.

## Consequences

[Step 9](../../steps/09-tools-code-quality.md) adds Biome, reformats the code and fixes the lint findings. Every later change of `tools/` passes `biome check` as part of `npm run check`.

## Who decides and when

The owner of the project (dkowcun), 2026-11-20.
