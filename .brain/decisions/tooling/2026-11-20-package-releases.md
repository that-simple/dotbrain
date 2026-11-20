---
status: accepted
decided: 2026-11-20
description: "A release of the npm package is a step: it raises the version in `package.json` and in `README.md`, the release commit on `main` gets the tag `v<version>`, and the owner publishes it; `spec-v<version>` only when the specification changes."
---
# Releases of the npm package

## Context

[Step 8](../../steps/08-publication.md) published dotbrain 1.0: the package `@that-simple/dotbrain@1.0.0` and the specification at the tag `spec-v1.0.0`. The versions of the package and of the specification may part: a release that only fixes the tools raises the version of the package and leaves the version of the specification ([decision](../model/2026-11-17-spec-version-in-semver.md)). The brain said nothing about how a later release is made: whether it is a step, whether the package gets a tag, and who publishes it.

Steps 9 and 10 changed `init` and the starter procedure in `templates/README.md` without changing the specification; the package carries both ([decision on channels](2026-10-28-distribution-channels.md)), so the fixes reach people only with a new release.

The other options were a release without a tag of the package, with npm as the only record of which commit a version came from, and a GitHub release for every version, with notes written from the steps, a second record to keep next to the steps.

Source: the conversation of the owner with the agent, 2026-11-20, after the merge of steps 9 and 10, where the owner accepted this decision.

## Decision

A release of the npm package is a step. The step raises `version` in `package.json` by semver (a fix of the tools is a PATCH) and the version `README.md` names for the hook of a setup without `init` ([decision](2026-11-20-readme-commands-without-version.md)). After the merge into `main`, the release commit gets the tag `v<version>`, pushed, and the owner runs `npm publish` with their npm account. The tag `spec-v<version>` is added only when the version of the specification changes. There are no GitHub releases and no changelog: the steps are the history.

## Consequences

[tooling-and-distribution.md](../../architecture/tooling-and-distribution.md) describes the way of releasing. The first release by this decision is [step 11](../../steps/11-release-1-0-1.md).
