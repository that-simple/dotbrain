---
status: superseded
decided: 2026-11-16
superseded-by: 2026-11-17-no-repository-template
description: "The framework comes out as a repository template on GitHub and the npm package `@that-simple/dotbrain` with the `dotbrain` command; no binary, plugins and skills outside 1.0."
---
# Distribution channels

## Context

A team is to start without tools, and the CLI is to install with one command ([tooling-and-distribution.md](../../architecture/tooling-and-distribution.md)). The channels can work together.

Today the CLI works only from a clone of the dotbrain repository ([step 3](../../steps/03-init.md), Out of scope), so a project outside dotbrain cannot set up a brain with one command. The pilot the Simplicity gate is waiting for is to take the framework the way anyone will take it ([roadmap.md](../../roadmap.md)), so it needs a channel that works without cloning.

The name `dotbrain` on npm is taken by an unrelated project (a PKM organizer for macOS). The decision on the [name of the project](../model/2026-10-28-name-and-brain-directory.md) says nothing about the name of the package. The `that-simple` organization on npm belongs to the owner of the project.

## Options

Channels:

- A repository template on GitHub.
- A CLI package on npm.
- A CLI binary.
- Plugins and skills for AI tools.

Name of the npm package:

- `@that-simple/dotbrain`: in the owner's organization, with the `dotbrain` command (`npx @that-simple/dotbrain init`).
- `dotbrain-cli`: without an organization, the name is free, but nobody reserves the prefix.
- An own `@dotbrain` organization: requires creating an organization on npm, availability not checked.

## Decision

For the first publication, the framework comes out as a repository template on GitHub and the npm package `@that-simple/dotbrain` with the `dotbrain` command. The repository template gives a start without tools ([decision](2026-10-28-tools-optional.md)), and the npm package gives `init` with one command, without cloning. We do not release a binary: the CLI requires Node anyway ([decision](2026-10-28-tooling-technology.md)), and a second form of release is a second thing to maintain. Plugins and skills are outside 1.0 ([decision](../repository/2026-11-17-mvp-is-1-0.md)).

## Consequences

The package contains compiled JavaScript and the `templates/` and `spec/` directories, which `init` and `index` read at runtime. The license is set by a separate [decision](2026-10-28-license.md). The work on the package will be described by a separate step.

## Who decides and when

The owner of the project, before the first publication.
