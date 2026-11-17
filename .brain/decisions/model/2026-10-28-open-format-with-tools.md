---
status: accepted
decided: 2026-10-28
description: "dotbrain is an open format with tools, not a product with a backend; the brain lies in git, in the code repository."
---
# An open format with tools

## Context

A backend with a document database would give concurrency, queries and search, but it requires a service, moves the brain away from the code and takes away the agents' native access to files.

## Decision

- dotbrain is an open format with tools (CLI, templates), not a product built around a backend.
- Git is the only storage: the brain lies in the code repository it concerns.

## Consequences

It complements [optional tools](../tooling/2026-10-28-tools-optional.md) and [the simplest thing that works](2026-10-28-simplest-thing-that-works.md).
