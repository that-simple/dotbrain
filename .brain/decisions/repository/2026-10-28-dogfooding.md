---
status: accepted
decided: 2026-10-28
apply: always
description: "The dotbrain repository is the first user of the framework: every change of a convention also changes its own brain in the same change."
---
# Dogfooding

## Decision

This repository is run according to dotbrain. Every change of a convention of the framework (the structure of the brain, frontmatter, decisions, steps, the agent contract, instruction files) also changes this repository's own `.brain/` and instruction files in the same commit or PR. A convention that cannot be applied here by hand or by an agent is too complicated ([2026-10-28-simplest-thing-that-works](../model/2026-10-28-simplest-thing-that-works.md)).
