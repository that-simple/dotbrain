---
status: accepted
decided: 2026-10-28
description: "A brain declares its data (name, language, specification version, owner, description) in the YAML frontmatter of its `README.md`, without a separate file."
---
# The manifest of the brain in the frontmatter of the index

## Context

Tools and the agent need to know what the brain is and what language it is in. A separate file is one more thing to maintain, and prose in the index is ambiguous. Claude's skills show that YAML frontmatter in markdown is enough.

## Decision

The index of the brain (`README.md`) has frontmatter with the fields `brain` (name), `lang` (BCP 47), `spec`, `owner`, `description` and optionally `sections`.

## Consequences

There is no separate manifest file. GitHub shows the frontmatter as a table above the index. The fields and their values are described in [spec/brain.md](../../../spec/brain.md).
