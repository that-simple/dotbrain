---
status: accepted
decided: 2026-11-05
description: "Instead of a number, a step may have in its file name the key of its ticket from the tracker in lowercase (`steps/rp-111-slug.md`); both forms are valid in one brain, and a brain may require keys with a decision with `apply: always`."
---
# Steps named by the key of a ticket

## Context

Source: a conversation with the owner of the brain on 2026-11-05 (translated from Polish): "let's add an option so that steps, instead of 01, 02 etc., could be (…) a ticket number, e.g. from Jira, like RP-111".

A step number requires coordination between branches: the branch merged second renumbers its step ([decision](../collaboration/2026-11-01-step-numbers-on-parallel-branches.md)). When the work lives in a tracker (Jira, Linear, YouTrack), the ticket already has a unique key, and the branch and commits usually carry it. A step named by the key of a ticket requires no renumbering and links the spec of the work in the brain with its status in the tracker. File names in the brain are in lowercase kebab-case ([conventions](2026-10-28-conventions.md), `V-NAMES`), and keys in trackers are usually uppercase (`RP-111`).

## Decision

- A step has in its file name a number (`steps/01-slug.md`, at least two digits) or the key of its ticket in lowercase: a letter, then letters or digits, a hyphen and the number of the ticket (`steps/rp-111-slug.md` for `RP-111`). Both forms are valid, also in one brain.
- The number or key is the ID of the step, unique in the brain. A number gives the order of the plan, a key does not: the order of steps with keys is in the roadmap or in the tracker.
- Renumbering on parallel branches ([decision](../collaboration/2026-11-01-step-numbers-on-parallel-branches.md)) concerns only numbers. The key of a ticket is not changed; two steps with the same key are a conflict of documents, resolved like any other.
- A brain that wants steps named by the keys of tickets records it with a decision with `apply: always`. The specification and `lint` do not enforce it.

## Consequences

The IDs of steps are described in `spec/documents.md` and `V-STEP` in `spec/validity.md`. The agent contract and the managed blocks speak of renumbering only numbers. The index block sorts steps by file name, so steps with numbers come before steps with keys. The `init` wizard asks whether steps have numbers or ticket keys ([step 3](../../steps/03-init.md)). The key for a step without a ticket (e.g. changes without a task) may have a prefix set by the maintainers of the repository, in the same format; the brain records it in its decision on keys. Open: the address of the tracker in the manifest for links to tickets.

## Who decides and when

The owner of the brain (dkowcun).
