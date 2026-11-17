---
status: accepted
decided: 2026-10-28
apply: ".brain/decisions/**"
description: "Every decision is a separate ADR file in `decisions/` with an ID from the date and a slug; the list is generated from the frontmatter, and conflicts are resolved by regeneration or by the agent."
---
# Decisions as ADRs, a generated list

## Context

A single `decisions.md` file gives conflicts when several people change it in parallel, and `D-NN` numbers collide between branches. ADR (Architecture Decision Record: Nygard, MADR) is a recognized standard.

## Decision

- A decision is a `YYYY-MM-DD-slug.md` file in `decisions/` or its subdirectories (any layout, [decision](2026-10-28-decision-area-subdirectories.md)). The file name without the extension is the ID, unique without coordination; decision files are not renamed.
- Frontmatter: `status`, `description`, `decided` (the date of acceptance or rejection), `superseded-by` (the ID of the new decision).
- The minimal content is the Decision section. Context and Consequences are added when the decision needs them. A `proposed` decision has Context, Options, optionally a Recommendation, and who decides and when.
- `decisions/README.md` is a list generated from the frontmatter: groups by status, one line per decision (title with a link, description, date of resolution), sorted by ID. It is made by a tool or by an agent according to the specification; it is not edited by hand.
- A conflict in the list is resolved by regeneration. A conflict in the content of a decision, or two parallel decisions on the same matter, is resolved by the agent: it reads both versions and the state before the changes, merges what does not contradict, and reports a contradiction to a person as a `proposed` decision.

## Consequences

One format from the smallest brain to the largest. A small decision has a few lines, and the reader sees the list as in a single `decisions.md` file ([core-model.md](../../architecture/core-model.md)).
