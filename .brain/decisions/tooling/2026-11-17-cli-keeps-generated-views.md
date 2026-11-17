---
status: accepted
decided: 2026-11-17
description: "Generated views and instruction files are kept by the `dotbrain` CLI, and without it by an agent following the specification; a person keeping them by hand is not a supported way of working, people still read and write documents by hand, and no feature of the framework requires the CLI."
---
# The CLI keeps the generated views, or an agent without it

## Context

The [decision on optional tools](2026-10-28-tools-optional.md) said that what the tools do can be done by hand or by an agent according to the specification. In practice nobody keeps the decision list, the index block, the status lines and the managed blocks by hand, and the promise that a person can makes the specification read as if a person were its compiler: the starter procedure described the algorithms of the views for a person to follow ([step 7](../../steps/07-lighter-entry.md)). dotbrain is run through an agent with a person in the loop ([decision](../model/2026-11-17-agent-with-a-person-in-the-loop.md)), and the agent can follow the specification where there is no CLI.

This decision supersedes the [decision on optional tools](2026-10-28-tools-optional.md).

## Decision

- Generated views and instruction files are kept by the `dotbrain` CLI (`index`, checked by `lint` and `index --check`). Without the CLI, an agent keeps them following the specification.
- A person keeping generated views by hand is not a supported way of working; the framework does not describe it as one.
- People still read and write documents by hand: decisions, steps, areas, the index outside its block.
- No feature of the framework requires the CLI: a brain without it, with an agent keeping the views, is a full use of the framework ([decision](../model/2026-10-28-simplest-thing-that-works.md)).

## Consequences

`README.md`, `spec/README.md`, [overview.md](../../architecture/overview.md) (principles 4 and 5), [tooling-and-distribution.md](../../architecture/tooling-and-distribution.md) and the starter procedure in `templates/README.md` name the CLI as the way to keep the views and an agent as the way without it.
