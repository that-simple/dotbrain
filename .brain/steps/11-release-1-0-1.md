---
status: agreed
description: "`@that-simple/dotbrain@1.0.1` is on npm with the fixes of steps 9 and 10, tagged `v1.0.1` on `main`; the specification stays at 1.0.0."
---
# Step 11: release 1.0.1

<!-- BEGIN:dotbrain status -->
Status: `agreed`
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
