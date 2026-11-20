---
status: draft
description: "`init` stops before writing anything when git ignores a file `index` must read, accepts every real date, and reports each out-of-date view once; a test covers each fix."
---
# Step 10: fixes from the review of step 9

<!-- BEGIN:dotbrain status -->
Status: `draft`
<!-- END:dotbrain status -->

A code review of the branch of [step 9](09-tools-code-quality.md), after the step was done, found faults in `init` and `lint`; step 9 records them in its log, and the owner asked for them to be fixed (conversation with the agent, 2026-11-20).

## Goal

The faults found by the code review of step 9 are fixed, and the promise of stage 4 of step 9, that `scaffold` changes nothing when a check fails, holds in every case.

## Scope

- **Files ignored by git.** The tools skip the files ignored by git ([spec/brain.md](../../spec/brain.md)), so `index` does not see a file `init` writes when git ignores it, and `init` fails after writing the files. Before writing anything, `scaffold` checks that git does not ignore any file it writes that `index` reads: the files under `.brain/` and the root instruction files. For an ignored one it stops with an error that names the path and says to change `.gitignore`. The check uses `git check-ignore` without `--no-index`, because a tracked file is read even when it matches `.gitignore`. The warnings about `.claude/rules/` and `.claude/agents/` stay as they are.
- **Dates.** `validDate` accepts the dates of the years 0000–0099, which `Date.UTC` reads as 1900–1999; this fixes the `decided` date in `lint` and the `date` answer of `init`.
- **Out-of-date views.** At the end, `init` reports each out-of-date view once, by `lint`, instead of a second time by `index --check`; the exit code stays the same.
- **Tests** in `tools/test/init.test.ts`: `init` in a repository whose `.gitignore` lists `CLAUDE.md`, and one that lists `.brain/`; and the test of the date covering a date of the years 0000–0099, so that it tells the checks before and after the fix apart.

## Out of scope

- The listing of files in `tools/src/repo.ts`: the specification says to skip the files ignored by git.
- A change to the specification or the conformance cases.
- New features of the CLI, such as `--help` or `--version`.

## Decisions

- [The simplest thing that works](../decisions/model/2026-10-28-simplest-thing-that-works.md): no more structure than the code needs.
- [The brain in the same PR as the work](../decisions/repository/2026-11-03-brain-in-the-same-pr.md): the step set to `agreed` before the work.
- [spec/brain.md](../../spec/brain.md): tools skip `.git/` and the files ignored by git.

## Acceptance criteria

1. When git ignores `CLAUDE.md` or `.brain/`, `init` exits with code 2 and a message naming the path, and the repository is unchanged; tests cover both cases and fail on the code before the fix.
2. `validDate` accepts `0050-01-01` and `2024-02-29` and rejects `2026-02-30`; `init --date=0050-01-01` writes a brain that passes `lint` and `index --check`; the test fails on the code before the fix.
3. `init` prints each out-of-date view once.
4. `npm run check` passes with `spec/conformance/` unchanged, and the output of the CLI in the cases of the log of step 9 is unchanged, apart from the cases above.
