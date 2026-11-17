---
status: accepted
decided: 2026-11-01
description: "A decision extracted from a conversation or another source outside the brain (a transcript, a chat, an email) always goes into the brain as `proposed`, with its source; `accepted` only on the explicit instruction of the person who decides."
---
# Decisions extracted from conversations

## Context

Agents built on dotbrain process conversations: meeting transcripts, chats, emails. They extract knowledge, open questions and decisions from them and record them in the brain. Raw material stays at its source; the brain gets only the result.

A decision in the brain binds people and agents ([contract](../../architecture/agent-contract.md), rule 1). A transcript may garble words, an agent may misunderstand whether a decision was made or only proposed, and in a conversation the decision is often made by someone other than the person who decides in the brain.

## Decision

- A decision extracted from a conversation or another source outside the brain (a transcript, a chat, an email, an account of a meeting) goes into the brain as `proposed`, even if it was made in the source. In its context the decision gives the source: the conversation, the date and a link, if there is one.
- The rule concerns material, not an instruction. An explicit instruction of the person who decides in this brain, given to the agent in the current work ("accept this"), allows setting `accepted`, as in rule 4 of the contract. An account of a conversation ("at the meeting we agreed…") is not such an instruction.

## Consequences

This is rule 15 of the agent contract (full and in its concise form), next to the rule on raw material ([decision](../model/2026-10-28-brain-is-not-a-data-lake.md)).

## Who decides and when

The owner of the brain (dkowcun).
