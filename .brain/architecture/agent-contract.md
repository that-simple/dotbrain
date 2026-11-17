---
description: "The agent contract independent of the tool: why it has its groups of rules, which decisions each rule rests on, and the form in which it reaches agents; the rules themselves are in the specification."
---
# Agent contract

The rules by which an AI agent works with the brain and the code of the repository. There is one contract, independent of the tool; `CLAUDE.md`, `AGENTS.md` and other files are its adapters ([ai-integrations.md](ai-integrations.md)). The rules are written once, in [spec/agent-contract.md](../../spec/agent-contract.md); this document does not restate them, it explains their structure and links them to the decisions they rest on ([decision](../decisions/agents/2026-10-28-agent-contract.md)).

## Structure

The groups follow the sections of the specification; they are not the two parts of the compact form, the core and the work on the brain (see [form of the contract](#form-of-the-contract)).

- **Core rules (1–7).** The brain binds, the agent reads before it works, keeps to the decisions and the step, leaves open decisions to a person and reports discrepancies. They carry the first principles of the framework ([overview.md](overview.md#principles-of-the-framework)) into the agent's behaviour.
- **Language rule (8).** The brain has its own language, independent of the language of the contract and of the conversation ([languages.md](languages.md)).
- **Conflict rules (9–13).** Several people and agents work on parallel branches; a merge must not break the brain or settle a matter without a person ([core-model.md](core-model.md)).
- **Content rules (14–15).** The brain keeps results, not raw material, and does not take decisions from outside it as made.
- **Rules of work in the repository (16–21).** The brain binds the code, and the team's choices on languages and the order of work are decisions; checks and the review against the brain close a stage, a step and a merge.
- **Answering questions (22).** A person reads steps, decisions and risks and asks the agent for the rest, so the agent answers from the brain and shows what the answer rests on ([decision](../decisions/model/2026-11-17-agent-with-a-person-in-the-loop.md)).
- **Checking the brain (23).** With the CLI at hand, a violation of the validity rules goes back to the agent before the work ends, not to the review of a pull request; in Claude Code a hook of the starter template enforces it ([decision](../decisions/agents/2026-11-17-lint-before-end-of-work.md)).

## The decisions behind the rules

| Rule | Decisions |
| --- | --- |
| 1. The brain binds | [Agent contract](../decisions/agents/2026-10-28-agent-contract.md) |
| 2. Read first | [Required minimal frontmatter in documents](../decisions/model/2026-10-28-document-frontmatter.md), [generated index](../decisions/model/2026-10-28-generated-index-and-registry.md) |
| 3. Keep to the decisions | [Agent contract](../decisions/agents/2026-10-28-agent-contract.md) |
| 4. Do not resolve open decisions | [Lifecycles of a decision and a step](../decisions/model/2026-10-28-lifecycles.md) |
| 5. Report discrepancies | [Instruction files with a managed block](../decisions/agents/2026-10-28-instruction-files-managed-block.md) |
| 6. Keep to the step | [The plan of a step first, then the work](../decisions/collaboration/2026-11-03-plan-before-work.md), [step size and stages](../decisions/collaboration/2026-11-03-step-stages.md) |
| 7. Update the brain | [Who works on a step](../decisions/collaboration/2026-11-01-who-works-on-a-step.md), [decisions as ADRs](../decisions/model/2026-10-28-decisions-as-adr.md), [the status of a step visible in the content](../decisions/model/2026-11-03-step-status-in-body.md) |
| 8. Write in the language of the brain | [A language-agnostic framework](../decisions/model/2026-10-28-language-agnostic.md) |
| 9. Regenerate generated views | [Conflicts in the log of a step and in generated views](../decisions/collaboration/2026-11-01-step-log-and-view-conflicts.md) |
| 10. Understand conflicts in documents before merging | [Contradicting decisions until resolved](../decisions/collaboration/2026-11-01-contradictory-decisions-until-resolved.md) |
| 11. Detect parallel decisions | [Decisions as ADRs](../decisions/model/2026-10-28-decisions-as-adr.md) |
| 12. Merge step logs mechanically | [Conflicts in the log of a step and in generated views](../decisions/collaboration/2026-11-01-step-log-and-view-conflicts.md) |
| 13. Renumber your own step | [Step numbers on parallel branches](../decisions/collaboration/2026-11-01-step-numbers-on-parallel-branches.md) |
| 14. Keep raw material at its source | [The brain is not a data lake](../decisions/model/2026-10-28-brain-is-not-a-data-lake.md) |
| 15. A decision from outside the brain is a proposal | [Decisions extracted from conversations](../decisions/agents/2026-10-28-decisions-extracted-from-conversations.md) |
| 16. The brain binds the code | [The brain with the work in any commit](../decisions/setup/2026-11-03-brain-with-the-work-in-any-commit.md) |
| 17. Languages of the work are a decision | [A language-agnostic framework](../decisions/model/2026-10-28-language-agnostic.md) |
| 18. Checks before a stage and before done | [Step size and stages](../decisions/collaboration/2026-11-03-step-stages.md) |
| 19. Keep the brain clean | [The brain is not a data lake](../decisions/model/2026-10-28-brain-is-not-a-data-lake.md), [core-model.md](core-model.md#what-the-brain-does-not-keep) |
| 20. The order of work is a decision | [The brain with the work in any commit](../decisions/setup/2026-11-03-brain-with-the-work-in-any-commit.md) |
| 21. Review before closing | [Review of changes against the brain](../decisions/agents/2026-11-03-brain-review-procedure.md), [review before committing to the main branch](../decisions/agents/2026-11-03-review-before-committing-to-main.md) |
| 22. Answer from the brain | [An agent with a person in the loop](../decisions/model/2026-11-17-agent-with-a-person-in-the-loop.md) |
| 23. Lint the brain you changed | [`dotbrain lint` before the end of work on the brain](../decisions/agents/2026-11-17-lint-before-end-of-work.md), [optional tools](../decisions/tooling/2026-10-28-tools-optional.md) |

## Form of the contract

The contract is written once, in English ([spec/agent-contract.md](../../spec/agent-contract.md)); in a brain in another language the agent applies it without translation, and the managed block carries it in English, with the rules of the brain in its language ([decision](../decisions/agents/2026-11-17-managed-block-contract-in-english.md)). Instruction files for particular tools are made from the same source with the tool's additions and the rules of the brain.

The contract reaches the agent in two parts of its compact form ([decision](../decisions/agents/2026-11-17-contract-core-and-brain-rules.md)): the **core**, which every task needs, in the managed block of the root instruction file, and the **work on the brain** (writing decisions, generated views, conflicts, the log of a step, what the brain keeps), in a rule file of the brain that the tool reads when the agent works in the brain directory. The managed block is in the context of every task, so the core stays within 400 words; the mechanics of the brain cost nothing in a task that does not change it. Which rule is in which part is set by a table in [spec/adapters/agents.md](../../spec/adapters/agents.md#compact-form).

The generated content goes into the managed block (`<!-- BEGIN:dotbrain <version> -->` … `<!-- END:dotbrain -->`), and the generator changes only the block ([decision](../decisions/agents/2026-10-28-instruction-files-managed-block.md)).

An instruction file is an adapter, not a source of truth. The hierarchy applies: brain > block > manual part. The manual part outside the block contains only operational hints (commands, paths, environment) and must not contradict the brain. A rule of work added by hand (e.g. a section on languages) is a discrepancy: we move it into the brain as a decision, and it comes back into the file through the block.
