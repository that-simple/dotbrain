---
status: accepted
decided: 2026-11-03
description: "The decisions of this brain are in subdirectories by domain: `model/`, `agents/`, `collaboration/`, `setup/`, `tooling/` and `repository/`."
---
# The decisions of this brain in subdirectories by domain

## Context

In a flat `decisions/`, the decision list (`decisions/README.md`) lies under all the decision files in the repository browser and in the IDE. The specification allows any layout of subdirectories, and the ID does not depend on the path ([a free layout of `decisions/`](../model/2026-10-28-decision-area-subdirectories.md)).

## Decision

The decisions of this brain are in subdirectories by domain:

- `model/`: the core format and languages;
- `agents/`: the agent contract and instruction files;
- `collaboration/`: work of many people;
- `setup/`: the starter template;
- `tooling/`: tools, distribution, license, the conformance suite;
- `repository/`: rules of work in this repository.

A decision that concerns several domains goes to the one where it has the most effect. A new domain is created when a new decision fits none of the existing ones.

## Consequences

The conventions of `.brain/README.md` describe the layout in one sentence. The `.brain/decisions/**` glob of the rule on ADRs matches all subdirectories.

## Who decides and when

The owner of the project.
