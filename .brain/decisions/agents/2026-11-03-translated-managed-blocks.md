---
status: superseded
decided: 2026-11-03
superseded-by: 2026-11-17-managed-block-contract-in-english
description: "In the managed block of a brain in a language other than English, `V-VIEWS` checks character by character only the parts that follow from the brain; the translated concise form of the contract, the tools' additions and the fixed words of the block are translated by the agent."
---
# Checking translated managed blocks

## Context

The specification allows translating the concise form of the contract, the tools' additions and the fixed words of the block into the language of the brain in the managed block ([spec/adapters/agents.md](../../../spec/adapters/agents.md#content)), and `V-VIEWS` requires the block to be identical to the result of regeneration. A translation cannot be generated character by character, and the framework does not maintain translations ([decision on the heading map](../model/2026-10-28-section-map-in-manifest.md)); an example is the `CLAUDE.md` of this repository.

## Decision

In the managed block of a brain whose `lang` is not English, `V-VIEWS` checks character by character only what follows from the brain: the markers and the two comment lines, the set and order of rules (titles and texts), the targets of links and the link to the specification in the exact version. It does not check the concise form of the contract, the tools' additions and the fixed words of the block; the agent is responsible for their translation. `index` updates only those parts in such a block, and does not translate a block that does not exist yet: it writes it in English and reports that the translation belongs to the agent. The block of a brain in English is checked in full.

## Consequences

The templates and the specification are in one version, in English. A change of the contract in a brain in another language requires the work of an agent, which translates the new rule; `lint` will not detect it. This is described by `V-VIEWS` in `spec/validity.md` and the description of the language of the block in `spec/adapters/agents.md`.
