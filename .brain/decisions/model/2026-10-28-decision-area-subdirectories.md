---
status: accepted
decided: 2026-10-28
description: "The layout of the `decisions/` directory is free (flat, by domain, by year or a hybrid); decisions are detected by the file name, and the ID is unique in the brain."
---
# A free layout of the `decisions/` directory

## Context

A brain with a few hundred decisions in one directory is unreadable when browsing the repository, and there is no single good split: in one brain a split by domain fits, in another by year, in yet another a flat directory. The layout is decided by the owner of the brain, not by the framework.

## Decision

- Inside `decisions/`, the owner of the brain arranges subdirectories freely: flat, by domain, by year or a hybrid, in any order (e.g. `decisions/2026/payments/2026-10-28-slug.md` or `decisions/payments/2026/2026-10-28-slug.md`). Directory names in English in kebab-case.
- A decision is every `YYYY-MM-DD-slug.md` file in `decisions/` and its subdirectories. The ID is the file name without the extension, regardless of the path, unique in the brain; references and `superseded-by` do not depend on the path.
- Moving a decision to another directory does not change its ID; relative links to it are fixed in the same change.
- The `decisions/README.md` list is one and the same for every layout: groups by status, sorted by ID, a link with a relative path.
- A brain with a layout other than flat describes it in one sentence in the conventions of its index, so that people and the agent know where to put new decisions.

## Consequences

The layout is described in [spec/documents.md](../../../spec/documents.md), [spec/generated-views.md](../../../spec/generated-views.md) and [spec/validity.md](../../../spec/validity.md).
