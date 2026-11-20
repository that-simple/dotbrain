---
status: draft
assignee: [user:dkowcun]
description: "The code of the tools has one checked style (Biome, four spaces), modules with one responsibility each, and the faults found in a review fixed, with the behavior of the CLI unchanged."
---
# Step 9: code quality of the tools

<!-- BEGIN:dotbrain status -->
Status: `draft` · Assignee: user:dkowcun
<!-- END:dotbrain status -->

The owner asked for a review and a cleanup of the code of the CLI, with Biome and four-space indentation, the large modules split, and DRY only where it is needed (conversation with the agent, 2026-11-20). Three modules hold most of the code: `tools/src/init.ts` (526 lines), `tools/src/views.ts` (465) and `tools/conformance/build-cases.ts` (849).

## Goal

The code of the tools has one style, checked by `npm run check` ([decision](../decisions/repository/2026-11-20-tools-code-style.md)). Each module has one responsibility and can be read whole. The faults found in the review are fixed. The CLI behaves exactly as before, which the conformance cases, the tests and the test of the package confirm.

## Scope

- **Biome**, as set by the [decision on the code style](../decisions/repository/2026-11-20-tools-code-style.md): the devDependency, `biome.json`, a `format` script, `biome check` in `check`, and the whole code reformatted. The pattern of the `Stop` hook in `.claude/settings.json` that picks lines from a failed check also picks the diagnostics of Biome. [tooling-and-distribution.md](../architecture/tooling-and-distribution.md) names Biome among the checks of this repository.
- **The lint findings** of the `recommended` rules fixed, or the rule turned off with its reason in `biome.json`. For example, `tools/src/markdown.ts` assigns in an expression and keeps the state of an HTML comment in a getter and setter pair; a plain state object replaces them.
- **The large modules split**, without a change of behavior:
  - `tools/src/views.ts` into `tools/src/views/`: the decision list, the index block, the status line, the managed block, the rule files, and `allViews` with the `View` and `Outcome` types.
  - `tools/src/init.ts` into `tools/src/init/`: the questions and their checks, the skeleton from templates (the brain index, the setup file, the Claude Code settings), `preflight` and `scaffold`, and the command line (the arguments, the reader of lines, `runInit`, split into the questions of the wizard, the confirmation and the report).
  - `tools/conformance/build-cases.ts` into the builder (building, reading and writing trees, mutations), the fixtures (the project in English, the project in Polish, the state after merging two branches) and the list of cases.
  - The paths to `templates/`, `spec/` and `package.json`, computed relative to the file of a module, follow the new depth of the module.
- **The faults found in the review.** DRY only where the same rule is written twice, not where code merely looks alike:
  - `init` checks the `date` answer with its own date logic; it uses `validDate`, the rule `lint` applies to dates.
  - The end marker of the managed block is defined in both `init` and the views; one constant.
  - The line of a violation (`<severity> <rule> <path>: <message>`) is built in both `tools/dotbrain.ts` and `init`; it is one contract of the output of the CLI, so one function builds it.
  - `index` runs `lint`, which already evaluates every view, and then evaluates them again; the checks of documents are separated from the check of views, and `index` runs only the first.
  - `scaffold` promises to change nothing when a check fails, but when `index` skips views the files are already written; the promise is made true or the description says what happens.
- Left as they are, on purpose: the calls of `git` in `tools/src/repo.ts` and `init` (different commands, only the options are alike) and the up-to-date checks of the index block and the status line (different views).

## Out of scope

- A change of the behavior or the output of the CLI, and new features such as `--help` or `--version`.
- Formatting `templates/`, `spec/` and `.brain/`.
- CI.
- A decision on runtime dependencies: the architecture and steps 3 and 4 require the tools to have none, but no decision records why; a matter for a separate decision.

## Decisions

- [Code style of the tools](../decisions/repository/2026-11-20-tools-code-style.md) (`proposed`): Biome, four spaces, 120 characters, the recommended rules.
- [Technology of the tools](../decisions/tooling/2026-10-28-tooling-technology.md): TypeScript run directly by Node, syntax that can be stripped, types checked by `tsc`.
- [The simplest thing that works](../decisions/model/2026-10-28-simplest-thing-that-works.md): no more structure than the code needs.
- [The brain in the same PR as the work](../decisions/repository/2026-11-03-brain-in-the-same-pr.md): the step set to `agreed` before the work, each stage a separate commit.

## Acceptance criteria

1. `npm run check` runs `biome check` and passes; `biome.json` sets four-space indentation and a line width of 120; Biome is a devDependency at an exact version, and `package.json` still has no `dependencies`.
2. The behavior is unchanged: `node tools/conformance/build-cases.ts --check` passes with no change in `spec/conformance/`, the tests in `tools/test/` pass with at most their imports changed, and the test of the package installed from the tarball passes.
3. No module in `tools/src/` and `tools/conformance/` has more than 300 lines, apart from modules holding only fixture data.
4. Each fault of the review listed in the scope is fixed, and where its effect can be observed, a test covers it (for example, `init --date=2026-02-30` is rejected).
5. [tooling-and-distribution.md](../architecture/tooling-and-distribution.md) names Biome among the checks of this repository.

## Stages

1. Biome: configuration, scripts, the hook, the brain document, and the code reformatted in a commit with no other change.
2. The lint findings.
3. The large modules split.
4. The faults found in the review.

## Open questions

- The step can be agreed only after the [decision on the code style](../decisions/repository/2026-11-20-tools-code-style.md) is accepted.
