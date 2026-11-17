---
status: accepted
decided: 2026-11-03
description: "The tools (CLI) are written in TypeScript run by Node.js, in one implementation."
---
# Technology of the tools

## Context

The tools are to install with one command, without a runtime on the user's side or with one most people have (Node), and to work offline.

## Decision

Node.js, code in TypeScript. Node runs `.ts` files directly (it strips the types), so in the repository the tools work without a build step; that is why the code uses only syntax that can be stripped without transformations (no `enum`, `namespace` or parameter properties), and the types are checked separately by `tsc`. The tools have one implementation; a second one comes only with real demand.

## Consequences

The user needs Node to run the tools; without Node, the same views and checks are done by an agent according to the specification ([decision](2026-10-28-tools-optional.md)). Node does not strip types in files from `node_modules`, so the package for publication contains compiled JavaScript: the build step comes back at publication. The distribution channel is a separate [decision](2026-10-28-distribution-channels.md).

## Who decides and when

The owner of the project.
