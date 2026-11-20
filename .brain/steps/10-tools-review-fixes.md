---
status: done
assignee: [user:dkowcun]
description: "`init` stops before writing anything when git ignores a file `index` must read, accepts every real date, and reports each out-of-date view once; a test covers each fix."
---
# Step 10: fixes from the review of step 9

<!-- BEGIN:dotbrain status -->
Status: `done` · Assignee: user:dkowcun
<!-- END:dotbrain status -->

A code review of the branch of [step 9](09-tools-code-quality.md), after the step was done, found faults in `init` and `lint`; step 9 records them in its log, and the owner asked for them to be fixed (conversation with the agent, 2026-11-20).

## Goal

The faults found by the code review of step 9 are fixed, and the promise of stage 4 of step 9, that `scaffold` changes nothing when a check fails, holds in every case.

## Scope

- **Files ignored by git.** The tools skip the files ignored by git ([spec/brain.md](../../spec/brain.md)), so `index` and `lint` do not see a file `init` writes when git ignores it, and `init` fails after writing the files. Before writing anything, `scaffold` checks that git does not ignore any file it writes that the tools read: the files under `.brain/`, the root instruction files and every view `index` generates, the rule files in `.claude/rules/`, `.github/instructions/` and `.brain/AGENTS.md` among them. For an ignored one it stops with an error that names the path and says to change `.gitignore`. The check uses `git check-ignore` without `--no-index`, because a tracked file is read even when it matches `.gitignore`. The warning about `.claude/rules/` goes, as that case is now an error; the warning about `.claude/agents/`, which the tools do not read, stays.
- **The starter procedure.** The step of `templates/README.md` that checks `.gitignore` says the same: git must ignore none of the files the tools read, and the person changes `.gitignore` if it does; `.claude/agents/` stays a matter to tell the person.
- **When git cannot tell.** When `git check-ignore` fails (for example with exit code 128 on a broken index), `init` stops with an error before writing anything, instead of reading the failure as no file ignored.
- **Dates.** `validDate` accepts the dates of the years 0000–0099, which `Date.UTC` reads as 1900–1999; this fixes the `decided` date in `lint` and the `date` answer of `init`.
- **Out-of-date views.** At the end, `init` reports each out-of-date view once, by `lint`, instead of a second time by `index --check`; the exit code stays the same.
- **Tests** in `tools/test/init.test.ts`: `init` in a repository whose `.gitignore` lists `CLAUDE.md`, `.brain/`, `.brain/decisions/README.md`, `.github/instructions/` or `.claude/`, or lists an existing `CLAUDE.md`, and the warning when it lists `.claude/agents/`; the test of the date covering a date of the years 0000–0099, so that it tells the checks before and after the fix apart; `init` in a repository with a broken index; and the report of `init` with an out-of-date view, through `report` exported from `tools/src/init/cli.ts`.

## Out of scope

- The listing of files in `tools/src/repo.ts`: the specification says to skip the files ignored by git.
- A change to the specification or the conformance cases.
- New features of the CLI, such as `--help` or `--version`.

## Decisions

- [The simplest thing that works](../decisions/model/2026-10-28-simplest-thing-that-works.md): no more structure than the code needs.
- [The brain in the same PR as the work](../decisions/repository/2026-11-03-brain-in-the-same-pr.md): the step set to `agreed` before the work.
- [spec/brain.md](../../spec/brain.md): tools skip `.git/` and the files ignored by git.
- [`init` stops when git ignores a file the tools read](../decisions/tooling/2026-11-20-init-stops-on-ignored-files.md) (`accepted`): the error before writing instead of the warning about `.claude/rules/` that the [decision on `.claude/rules/`](../decisions/agents/2026-11-03-claude-code-rules-directory.md) describes as a report.

## Acceptance criteria

1. When git ignores `CLAUDE.md`, `.brain/`, `.brain/decisions/README.md`, `.github/instructions/` or `.claude/`, `init` exits with code 2 and a message naming the path, and the repository is unchanged; when `git check-ignore` fails, `init` exits with code 2 and writes nothing; tests cover these cases and fail on the code before the fix.
2. `validDate` accepts `0050-01-01` and `2024-02-29` and rejects `2026-02-30`; `init --date=0050-01-01` writes a brain that passes `lint` and `index --check`; the test fails on the code before the fix.
3. `init` prints each out-of-date view once; a test covers it and fails on the code before the fix.
4. `npm run check` passes with `spec/conformance/` unchanged, and the output of the CLI in the cases of the log of step 9 is unchanged, apart from the cases above.

## Log

- 2026-11-20: Before writing anything, `scaffold` asks git, in one `git check-ignore` call, whether it ignores the files under `.brain/` it writes or the root instruction files, and stops with an error naming them and telling to change `.gitignore`; a file git tracks is not ignored, so a tracked `CLAUDE.md` that matches `.gitignore` still works. `validDate` sets the year with `setUTCFullYear`, so it accepts the years 0000–0099. `init` reports the out-of-date views only through `lint`. New tests: `init` with `.gitignore` listing `CLAUDE.md` and `.brain/` exits with code 2 and leaves the repository unchanged, and `init --date=0050-01-01` writes a valid brain; both failed on the code before the fix. Criterion 3 has no test, because `scaffold` leaves no view out of date; it is checked by reading `report` in `tools/src/init/cli.ts`, which no longer runs `index --check`. Checked: `npm run check` (51 tests including the test of the package, the conformance cases unchanged), `validDate` on `0050-01-01`, `2024-02-29`, `0000-02-29` (accepted), `2026-02-30` and `1900-02-29` (rejected), `init` in a repository where `.gitignore` lists a tracked `CLAUDE.md` (exit code 0), and the output of the CLI in the cases of the log of step 9 identical to the character with the state before the step.
- 2026-11-20: On the instruction of the owner, the description says that a test covers each fix whose effect `init` can show, as the work has it: the single report of out-of-date views has no test (see the entry above). Checked: `dotbrain lint` and `index --check`.
- 2026-11-20: Done, on the instruction of the owner. Before this commit, the review against the brain (`brain-review` subagent) found no contradiction with a decision, the specification or the instruction files, and reported three minor points left to the owner: criterion 3 is checked by reading the code, not by a test (recorded above); `ignoredByGit` reads any failure of `git check-ignore` (for example exit code 128 in a broken repository) as no file ignored, a case outside the scope; and the check also covers a root instruction file that already exists, which `init` writes its pointer into. `npm run check` passes on the final tree (51 tests). Step done.
- 2026-11-20: On the instruction of the owner, after the step was done, two of the points of the review are fixed in this step: the scope, criteria 1 and 3 and the description are extended, and the status stays `done`, because the lifecycle of a step allows no way back from `done`; this departs from the lifecycle. Criterion 3 now has a test, so the statements of the earlier entries that it has none, and the narrower description, no longer hold. `ignoredByGit` stops `init` with an error when `git check-ignore` fails with an exit code other than 0 and 1; before, `init` with a broken `.git/index` wrote the whole skeleton and exited with code 0. `report` is exported for a test. New tests: `init` in a repository with a broken index exits with code 2 and leaves the repository unchanged, and `report` after a decision title changed lists each out-of-date view once and returns 1; the first failed on the code before the fix, the second on `report` from before the first work entry of this step (commit `a2292f2`, with only the export added). Checked: `dotbrain lint` and `index --check`, `npm run check` (53 tests including the test of the package, the conformance cases unchanged), and the output of the CLI in the cases of the log of step 9 identical to the character with the state before.
- 2026-11-20: On the instruction of the owner, after the step was done, the faults found by a second code review are fixed in this step; the scope, criterion 1 and the tests are extended, and the status stays `done`, which again departs from the lifecycle of a step. The check of ignored files covered only the documents `scaffold` writes and the root instruction files, so when git ignored a view `index` generates (`.brain/decisions/README.md`, `.github/instructions/`) or `.claude/`, `init` wrote the skeleton, warned at most, and exited with code 1. Now `scaffold` evaluates the views of the planned skeleton first and asks git about their paths too, and an ignored `.claude/rules/` is an error before writing instead of a warning; the statement of the first entry that the warnings about `.claude/` stay as they are no longer holds. The starter procedure in `templates/README.md` says the same. New cases of the test: `.brain/decisions/README.md`, `.github/instructions/` and `.claude/` (each wrote 14 files and exited with code 1 on the code before the fix), and an existing `CLAUDE.md` that git ignores, which has no view because the tools do not see it. Checked: `dotbrain lint` and `index --check`, `npm run check` (the conformance cases unchanged), `init` with `.gitignore` listing `.claude/` (exit code 2, only `.gitignore` left), and the output of the CLI in the cases of the log of step 9 identical to the character with the state before the step.
- 2026-11-20: The review against the brain (`brain-review` subagent) of the entry above found that the stop on an ignored `.claude/rules/` goes beyond the [decision on `.claude/rules/`](../decisions/agents/2026-11-03-claude-code-rules-directory.md), which says `init` reports it. The choice of the owner in the conversation is recorded as the decision [`init` stops when git ignores a file the tools read](../decisions/tooling/2026-11-20-init-stops-on-ignored-files.md), accepted on the instruction of the owner, because the specification requires `.claude/rules/` to be committed and the tools skip the ignored files. The specification is unchanged. Checked: `dotbrain lint`, `index --check` and `npm run check`.
