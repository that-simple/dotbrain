---
status: accepted
decided: 2026-11-01
description: "The brain contains only markdown documents with knowledge, decisions and the plan; raw material (transcripts, emails, PDFs, contracts, images) stays at its source, and the brain gets the result with a link; `lint` reports other files as a warning."
---
# The brain is not a data lake

## Context

Agents built on dotbrain process transcripts, emails, documents and contracts. It is tempting to put this material into the brain "just in case". The brain would then become a file store: too big for the agent's context, full of personal data and unreadable for people.

## Decision

- A core principle: the brain contains markdown documents (and files added by adapters, e.g. instruction files): knowledge, decisions, the plan, risks. Raw material (recordings, transcripts, emails, PDFs, contracts, images) stays at its source; the brain contains what follows from it, with a link to the source.
- A rule of the agent contract: from raw material, write to the brain the result (decisions, knowledge, open questions) with a link to the source, never the material itself, also not pasted into a markdown file.
- A validity rule with the warning level: `lint` reports files other than markdown in the brain. Diagrams as text in markdown (e.g. Mermaid) are fine; an image of a diagram gives a warning, but does not make the brain invalid.

## Consequences

- A warning instead of an error, because diagrams in image files are common in code repositories, and a hard limit would encourage working around it.
- `lint` will not catch raw material pasted into markdown; the contract rule protects against that, and further the review of the brain.
- The principle is in `spec/brain.md`, `spec/validity.md`, the agent contract, its concise form and the managed block of the starter template.

## Who decides and when

The owner of the brain (dkowcun).
