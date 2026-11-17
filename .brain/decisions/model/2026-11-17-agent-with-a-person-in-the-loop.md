---
status: accepted
decided: 2026-11-17
description: "dotbrain is run through an agent with a person in the loop: a person reads and agrees steps and looks at a step again when it is carried out, reads the content of decisions and possibly the risks; for anything else the person asks the agent, which finds the answer in the brain."
---
# An agent with a person in the loop

## Context

In the discussion of the review of the framework on 2026-11-17, the owner set who reads what (conversation with the agent, recorded in [step 7](../../steps/07-lighter-entry.md)). The framework did not say how the brain is used, so every document read as if a person had to know it, and the specification as if a person had to carry it out.

## Decision

- dotbrain is run through an agent with a person in the loop.
- A person reads and agrees steps, and looks at a step again when it is carried out; reads the content of decisions; and possibly the risks.
- For anything else, the person asks the agent about the project, and the agent finds the answer in the brain: it answers from the brain, links the documents the answer rests on, and says when the brain does not cover the question ([agent contract](../../../spec/agent-contract.md), rule 22).
- This decision describes how the brain is used. It sets no new requirements for documents and changes none of the existing ones: the brain stays readable and writable by a person ([decision](2026-10-28-markdown-in-git.md)).

## Consequences

The principles in [overview.md](../../architecture/overview.md) and `README.md` say how a person works with a brain. The contract has rule 22 on answering questions about the project, in its core part, and so in the managed block of every brain.
