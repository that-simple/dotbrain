---
status: accepted
decided: 2026-11-01
description: "An entry in the log of a step is a list item with a date added at the end, and a conflict in the log is resolved mechanically, keeping the entries of both sides in date order; generated views unchanged, regeneration on conflict."
---
# Conflicts in the log of a step and in generated views

## Context

Two places of the brain change in almost every PR, so with several people working in parallel a conflict is the rule, not the exception: the log of a step (every branch adds an entry at the end of the same section) and generated views (the decision list, the index block, the managed block of an instruction file). The views must stay in the repository: the brain is to be readable without tools ([decision](../model/2026-10-28-markdown-in-git.md)).

## Decision

- **The log of a step.** Every log entry is a list item with a date (`YYYY-MM-DD`), added at the end of the section. A conflict in the log is resolved mechanically: the entries of both sides stay, sorted by date, and within the same date the entries from the main branch first. The texts of entries are not merged or changed.
- **Generated views.** An explicit conflict is resolved by regeneration ([specification](../../../spec/generated-views.md#conflicts)).

## Consequences

The rules are in `spec/documents.md` (step), in the agent contract (conflict rules) and in the step template.

## Who decides and when

The owner of the brain (dkowcun).
