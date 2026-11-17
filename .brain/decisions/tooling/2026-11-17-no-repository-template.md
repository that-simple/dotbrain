---
status: accepted
decided: 2026-11-17
description: "dotbrain is published as the public repository `that-simple/dotbrain`, which documents the framework, without a repository template, and as the npm package `@that-simple/dotbrain` with the `dotbrain` command; no binary, plugins and skills outside 1.0."
---
# No repository template on GitHub

## Context

This decision supersedes the [decision on distribution channels](2026-10-28-distribution-channels.md), which released the framework also as a repository template on GitHub, for a start without tools ([optional tools](2026-10-28-tools-optional.md)). The dotbrain repository carries its own brain, the tools, the tests and the conformance suite, so "Use this template" on it would copy all of them into a new project. The start without tools is already the procedure of the starter in `templates/README.md`, which an agent follows from the published repository, and `init` from the package writes the skeleton with one command ([setup.md](../../architecture/setup.md)).

The question came up in the conversation of the owner with the agent of 2026-11-17, while writing the publication step ([step 8](../../steps/08-publication.md)): "why do we need a repository template; this repository is the documentation of how to do dotbrain" (translated from Polish). The other options were the dotbrain repository marked as a template, and a separate template repository with the skeleton of the starter; the owner chose none, on 2026-11-17.

## Decision

- The framework comes out as the public repository `that-simple/dotbrain` on GitHub and the npm package `@that-simple/dotbrain` with the `dotbrain` command.
- The repository is an ordinary repository, not a template: it documents the framework and holds the specification, the starter procedure and the templates. A start without tools follows the procedure of the starter from it; a start with tools runs `init` from the package.
- We do not release a binary: the CLI requires Node anyway ([decision](2026-10-28-tooling-technology.md)). Plugins and skills are outside 1.0 ([decision](../repository/2026-11-17-mvp-is-1-0.md)).

## Consequences

The package contains compiled JavaScript and the `templates/` and `spec/` directories, which `init` and `index` read at runtime ([license](2026-10-28-license.md)). Nothing is kept in step with a second repository. The documents describing the channels ([tooling-and-distribution.md](../../architecture/tooling-and-distribution.md), `.brain/README.md`, `README.md`) follow this decision in stage 1 of [step 8](../../steps/08-publication.md).
