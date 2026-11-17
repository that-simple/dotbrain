---
status: accepted
decided: 2026-11-17
description: "The Simplicity gate after the MVP does not require the same brain to work in two AI tools; in the MVP only Claude Code is checked live."
---
# The MVP gate without a second AI tool

## Context

The condition of the Simplicity gate after the MVP ([roadmap.md](../../roadmap.md)) required, among other things, that the same brain work in at least two AI tools. In [step 3](../../steps/03-init.md) the owner of the brain decided that in the MVP we check only Claude Code live. The `AGENTS.md` and Copilot instruction templates have the same managed block, but nobody has checked them with the tool. Because of that, the condition of the gate was waiting for a second tool or for a change of the gate.

## Decision

The requirement of two AI tools disappears from the condition of the Simplicity gate. The gate checks a project in which several people work in parallel and keep a brain without the CLI, using only the templates and the agent contract, and an independent project in a language other than this brain that uses the templates without a fork. Independence from the AI tool ([decision](2026-10-28-ai-tool-independence.md)) stays unchanged: one contract and adapters from one source.

## Consequences

The `AGENTS.md` and Copilot templates stay in the starter template and in `init` without a live trial. In [risks.md](../../risks.md), the risk of dependence on one tool is mitigated by one contract and adapters from one source, not by the gate.
