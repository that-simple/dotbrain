---
status: accepted
decided: 2026-11-11
description: "Every decision the starter template writes has its own template to fill in without judgment: languages of the work (`languages.md`), order of work (`order-of-work.md` or `order-of-work-before.md`) and steps named by the keys of tickets (`step-ids.md`)."
---
# Starter decisions from their own templates

## Context

The `init` wizard writes the decisions of the starter template from the answers to questions, without a model ([decision](../tooling/2026-11-03-init-skeleton-for-agent.md)). The procedure said to fill in the decision on languages from the general `decision-accepted.md` (title, description, content, optional sections to remove), and for an order of work other than the default to write in the team's rule. A tool cannot do that without judgment, and the text of a decision in code would bypass the templates.

Source: the answers of the owner of the brain when planning the work on [step 3](../../steps/03-init.md), 2026-11-11.

## Decision

- Every decision the starter template writes has its own template in `templates/` with a ready title, description and content; only placeholders filled in directly with the answer (date, language) remain in it.
- Languages of the work: `templates/languages.md` with one language for code, comments, commits, branch names and PRs.
- Order of work: the question has two answers, each with its own template: brain with the work (`templates/order-of-work.md`, the default) or brain in a separate PR before the work (`templates/order-of-work-before.md`). A team writes another rule into the decision after the setup.
- Steps named by the keys of tickets: `templates/step-ids.md`.

## Consequences

The table in [setup.md](../../architecture/setup.md) and the procedure of the [starter template](../../../templates/README.md) point to the new templates. Changing the text of a starter decision is a change of the template, without a change of the code of `init`.
