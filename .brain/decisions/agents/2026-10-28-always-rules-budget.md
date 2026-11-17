---
status: accepted
decided: 2026-10-28
description: "The title and the \"Decision\" section of a rule with `apply: always` go into the managed block; the budget is at most 10 such rules in the effective set and at most 150 words of content each."
---
# The budget of `apply: always` rules

## Context

The managed block is in the agent's context in every task ([the scope of `apply` rules](2026-10-28-apply-scope-for-agent-rules.md)), so the set of `always` rules must stay short, and the agent must have a rule right away, without reading further.

## Decision

- From an `always` rule, the title and the content of the `decision` section (for a document that is not a decision: the content without the title) go into the managed block, verbatim, in the language of the brain. The agent has the rule right away, also offline.
- Budget: at most 10 `always` rules in the effective set and at most 150 words of content for each of them.
- Exceeding it is a warning of `lint` or of the agent, not an error. Excess rules move to a glob or to the "on request" mode, and a long rule moves its rationale to an area and leaves only the rule in the decision.

## Consequences

The limit can be checked by hand. Details: [the specification of instruction files](../../../spec/adapters/agents.md#budget).
