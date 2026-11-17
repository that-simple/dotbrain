---
status: accepted
decided: 2026-11-17
description: "The specification has a version in semver (`MAJOR.MINOR.PATCH`); the first published version is `1.0.0`, like the package, the versions may part later, and the specification describes the migration from the draft `0.1`."
---
# The specification version in semver, first published as 1.0.0

## Context

The specification had the version `0.1` in the form `MAJOR.MINOR` ([decision](2026-10-28-spec-version-without-beta-migration.md)). The first publication releases the npm package as `1.0.0` ([decision](../repository/2026-11-17-mvp-is-1-0.md)), and the package carries the specification ([decision on channels](../tooling/2026-10-28-distribution-channels.md)). Two version numbers of different forms for one release would confuse whoever takes the framework. Brains already use `0.1`: this one and the pilot. The owner instructed on 2026-11-17 that the specification is `1.0.0` too, in full semver ([step 4](../../steps/04-npm-package.md)).

## Decision

The specification has a version `MAJOR.MINOR.PATCH`, compared as text. The first published version is `1.0.0`, the version of the package. Later the versions may part: the version of the specification changes only with its text, a release of the package that only fixes the tools (e.g. `1.0.1`) does not change it, and the package says which version of the specification it implements. Version `0.1` was the draft before the publication; the specification describes the migration from it: set `spec: 1.0.0` and generate the views again.

The [decision on the version in the manifest](2026-10-28-spec-version-without-beta-migration.md) stays: the `spec` field, the version in the marker of the managed block and no migration from the beta version.

## Consequences

The specification, the templates, `lint` and the conformance cases have version `1.0.0`, and `lint` reports `spec: 0.1` as `V-MANIFEST`. This brain and the pilot migrate to `1.0.0`. Decisions and done steps that name `0.1` stay as history.
