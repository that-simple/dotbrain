---
status: accepted
decided: 2026-10-28
description: "Every document of the brain has `description` in its frontmatter; a step also has `status`. The agent and tools scan the descriptions without reading the content."
---
# Required minimal frontmatter in documents

## Context

Claude's skills have `name` and `description` in their frontmatter, thanks to which the agent chooses what to read without loading the content (progressive disclosure).

## Decision

Every document has frontmatter with `description` (one sentence in the language of the brain). A step also has `status`, a decision the fields from the [decision on ADRs](2026-10-28-decisions-as-adr.md). A value lives in one place: the status is not repeated in the content. The kind of a document follows from its path, the owner from the manifest.

## Consequences

The descriptions in the index block of the brain are generated from the frontmatter ([decision](2026-10-28-generated-index-and-registry.md)).

An exception: the status and `assignee` of a step are in the content as a view generated from the frontmatter ([decision](2026-11-03-step-status-in-body.md)); by hand they are changed only in the frontmatter.
