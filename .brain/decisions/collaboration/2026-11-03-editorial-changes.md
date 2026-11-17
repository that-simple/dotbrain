---
status: accepted
decided: 2026-11-03
description: "An editorial change that does not change the meaning of a document (a link, a typo, wording, formatting) is allowed without a step and without a decision; the review checks only that the meaning has not changed."
---
# Editorial changes

## Context

According to [changes without a step](2026-11-03-changes-without-a-step.md), a change that neither belongs to a step nor wholly carries out an accepted decision is a discrepancy to report. Fixes without effect on the content (links, typos, wording, formatting) recur, and each would raise the same discrepancy.

## Decision

An editorial change that does not change the meaning of any rule, decision or document (links, typos, wording, formatting) requires neither a step nor a decision. It does not change the status, the frontmatter or the Decision section of an accepted decision. The review against the brain then checks only whether the meaning has not changed, and reports every change of meaning, also of the normative words of the specification (MUST, SHOULD, MAY). This is an exception to the last sentence of the Decision in [changes without a step](2026-11-03-changes-without-a-step.md).

## Consequences

This is described by the review procedure in `spec/review.md` and the subagent in the starter template and in `.claude/agents/` of this repository.

## Who decides and when

The owner of the brain (dkowcun).
