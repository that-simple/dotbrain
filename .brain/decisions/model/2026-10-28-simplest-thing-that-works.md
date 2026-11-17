---
status: accepted
decided: 2026-10-28
description: "A brain in a code repository without tools is a full use of the framework; tools are optional and do not require rewriting the brain."
---
# The simplest thing that works

## Context

The framework is to be as simple and effective as possible. A team may work on the files in the repository alone, and that may be enough for it forever.

## Decision

A brain in a code repository, without the CLI and other tools, is a full use of the framework. Tools (CLI, CI) come only when needed and do not require rewriting the brain. We measure effectiveness by use, not by the number of features.

## Consequences

The MVP gate checks work in one repository without tools ([roadmap.md](../../roadmap.md)). Every convention must be applicable by hand or by an agent ([overview.md](../../architecture/overview.md)).
