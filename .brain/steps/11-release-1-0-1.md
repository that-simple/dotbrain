---
status: done
assignee: [user:dkowcun]
description: "`@that-simple/dotbrain@1.0.1` is on npm with the fixes of steps 9 and 10, tagged `v1.0.1` on `main`; the specification stays at 1.0.0."
---
# Step 11: release 1.0.1

<!-- BEGIN:dotbrain status -->
Status: `done` · Assignee: user:dkowcun
<!-- END:dotbrain status -->

Steps [9](09-tools-code-quality.md) and [10](10-tools-review-fixes.md) changed `init` and the starter procedure without changing the specification, and are on `main`; the published package `1.0.0` does not have them (conversation of the owner with the agent, 2026-11-20).

## Goal

People who run `init` from npm get the fixes of steps 9 and 10: `@that-simple/dotbrain@1.0.1` is on npm. The specification stays at version `1.0.0`, so the managed blocks keep linking to `spec-v1.0.0` ([decision](../decisions/model/2026-11-17-spec-version-in-semver.md)).

## Scope

- **The version.** `package.json` and `package-lock.json` have the version `1.0.1`; `README.md` names `1.0.1` as the version to write into the hook of a setup without `init`.
- **The brain.** [tooling-and-distribution.md](../architecture/tooling-and-distribution.md) and [roadmap.md](../roadmap.md) describe the state after the release where they name the published version, and the way of releasing set by the [decision on releases](../decisions/tooling/2026-11-20-package-releases.md).
- **The publication**, each action on an explicit instruction of the owner, because it is outside the repository:
  - the agent checks the package from `main` after the merge (`npm run check`, `npm pack --dry-run`);
  - the tag `v1.0.1` is set on the release commit on `main` and pushed;
  - the owner runs `npm publish` by hand, with their npm account;
  - from the registry, `npx --yes @that-simple/dotbrain@1.0.1 init` in an empty repository writes a valid skeleton with `1.0.1` in its hook and `spec: 1.0.0` in its manifest.
- The log of the publication and `done` go to `main` in a separate small pull request.

## Out of scope

- A change of the specification and the tag `spec-v<version>`.
- GitHub releases, a changelog, CI.
- Any change of the tools.

## Decisions

- [Releases of the npm package](../decisions/tooling/2026-11-20-package-releases.md) (`accepted`): a release is a step, tagged `v<version>`, published by the owner.
- [The specification version in semver](../decisions/model/2026-11-17-spec-version-in-semver.md): a release that only fixes the tools leaves the version of the specification.
- [`README.md` commands without a version](../decisions/tooling/2026-11-20-readme-commands-without-version.md): `README.md` names the exact version only for the hook.
- [Distribution channels](../decisions/tooling/2026-10-28-distribution-channels.md): the npm package carries the tools, the templates and the specification.

## Acceptance criteria

1. `package.json` has the version `1.0.1`, `npm run check` passes, and `init` from the tarball writes `1.0.1` into the hook and `spec: 1.0.0` into the manifest.
2. `@that-simple/dotbrain@1.0.1` is on npm; with it, `init`, `lint` and `index --check` pass in an empty repository, and `init` in a repository whose `.gitignore` lists `.claude/` exits with code 2 and writes nothing.
3. The tag `v1.0.1` is on the release commit on `main` and is pushed.

## Stages

1. Ready for release: the version, `README.md` and the brain, in a pull request.
2. The publication after the merge: the tag, `npm publish`, the check from the registry, and `done`.

## Log

- 2026-11-21: Stage 1, ready for release. `package.json` and `package-lock.json` have the version `1.0.1`; `README.md` names the package `1.0.1` in its status, the tarball `that-simple-dotbrain-1.0.1.tgz`, and `1.0.1` as the version of the hook of a setup without `init`. [tooling-and-distribution.md](../architecture/tooling-and-distribution.md) names the current version `1.0.1` with the specification `1.0.0` and describes the way of releasing by the [decision on releases](../decisions/tooling/2026-11-20-package-releases.md); [roadmap.md](../roadmap.md) names this step. The version of the specification is separate from the version of the package in the tools (`SPEC_VERSION` in `tools/src/lint.ts`, the version of the hook from `package.json`), so nothing else changes. Checked: `npm run check` (53 tests including the test of the package, the conformance cases unchanged), and the tarball from `npm pack` installed into a temporary directory: `init` in an empty repository writes `@that-simple/dotbrain@1.0.1 lint` into `.claude/settings.json`, `spec: 1.0.0` into `.brain/README.md` and managed blocks `BEGIN:dotbrain 1.0.0`, with `lint` and `index --check` passing; `init` in a repository whose `.gitignore` lists `.claude/` exits with code 2 and writes nothing.
- 2026-11-21: Stage 2, the publication. After the merge of pull request #2, on `main` at its merge commit `34de3ff` with the version `1.0.1`: `npm run check` passes (53 tests) and `npm pack --dry-run` lists `@that-simple/dotbrain@1.0.1`, 70 files. The annotated tag `v1.0.1` is set on `34de3ff` and pushed (criterion 3). The owner ran `npm publish`; npm reported the package as being processed, and `1.0.1` became `latest` in the registry about a minute and a half later (criterion 2). From the registry, `npx --yes @that-simple/dotbrain@1.0.1` in an empty repository: `init` writes `@that-simple/dotbrain@1.0.1 lint` into the hook, `spec: 1.0.0` into the manifest and managed blocks `BEGIN:dotbrain 1.0.0`, and `lint` and `index --check` pass; `init` in a repository whose `.gitignore` lists `.claude/` exits with code 2, names `.claude/rules/notes-api.md`, and writes nothing. The specification stays at `1.0.0`, without a new `spec-v` tag. The step is done.
