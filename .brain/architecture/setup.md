---
description: "Setting up a brain in a code repository: the starter template, the first decisions, instruction files and the review subagent."
---
# Setting up a brain

A brain is set up in an existing or new code repository from one starter template ([decision](../decisions/model/2026-11-05-code-repository-only.md)). The procedure is in [templates/README.md](../../templates/README.md), in English; the same course is followed by `init` or, without the CLI, by an agent ([tooling-and-distribution.md](tooling-and-distribution.md)).

## What is created

| Element | Source |
| --- | --- |
| `.brain/README.md`: manifest, description of the project, index block, conventions | [templates/index.md](../../templates/index.md) |
| `.brain/decisions/README.md`: decision list | generated view |
| Decision on the languages of the work with `apply: always` in `decisions/process/` | [templates/languages.md](../../templates/languages.md) |
| Decision on the order of work with `apply: always`: brain with the work (default) or in a separate PR before the work | [templates/order-of-work.md](../../templates/order-of-work.md), [templates/order-of-work-before.md](../../templates/order-of-work-before.md) |
| Optionally, a decision on steps named by the keys of tickets with `apply: always` | [templates/step-ids.md](../../templates/step-ids.md) |
| Optionally, the roadmap, risks and `architecture/overview.md` | document templates |
| Managed block in `CLAUDE.md`, `AGENTS.md` and `.github/copilot-instructions.md` | [templates/managed-block.md](../../templates/managed-block.md) |
| Subagent of the review against the brain for Claude Code | [templates/brain-review.md](../../templates/brain-review.md) |
| `Stop` hook for Claude Code in `.claude/settings.json`, running `dotbrain lint` from the package of an exact version when the brain has changed; added to an existing file without changing the rest ([decision](../decisions/agents/2026-11-17-lint-before-end-of-work.md)) | [templates/claude-settings.json](../../templates/claude-settings.json) |
| From `init`: a temporary setup instruction for the agent, `DOTBRAIN-SETUP.md` in the root directory, and a line pointing to it in the instruction files | [templates/agent-setup.md](../../templates/agent-setup.md) |

Decisions are in subdirectories by domain from the start ([decision](../decisions/setup/2026-11-03-decision-domains-from-setup.md)), and the order of work is "brain with the work" by default ([decision](../decisions/setup/2026-11-03-brain-with-the-work-in-any-commit.md)). Every starter decision has its own template, filled in directly with the answer to the question ([decision](../decisions/setup/2026-11-11-starter-decisions-from-templates.md)).

## How a brain is set up

The procedure has two parts. The skeleton:

1. The name of the brain, the language (the `sections` map is made by translating the labels, [languages.md](languages.md)), the owner and one sentence about the project.
2. The index and the decision list.
3. The first decisions: the languages of the work, the order of work and, when the team wants it, steps named by the keys of tickets ([decision](../decisions/model/2026-11-05-step-ids-from-tracker.md)).
4. The index block, instruction files with the managed block and their rule files of the brain, the review subagent and the hook with `lint` for Claude Code.

Finishing the setup:

1. Translating the skeleton for a brain in a language other than English.
2. A scan of the code: documentation, dependencies, entry points, configuration, CI and deployment, tests, without secrets; the code stays at its source ([decision](../decisions/model/2026-10-28-brain-is-not-a-data-lake.md)).
3. A description of the project in place of the remaining placeholders.
4. The architecture in `architecture/` matching the code, with links to the files it follows from.
5. Decisions read from the code as `proposed` with their source ([pattern](../decisions/agents/2026-10-28-decisions-extracted-from-conversations.md)).
6. Optional documents, when the team wants them.
7. Generated views and a check against the validity rules of the specification.

With the tool, the questions are asked by the `init` wizard (or it takes the answers without questions), and it builds from them the skeleton with the setup instruction in `DOTBRAIN-SETUP.md`, into which it pastes the finishing of the setup and the templates needed; the finishing is done by the agent, which deletes this file at the end ([decision](../decisions/tooling/2026-11-03-init-skeleton-for-agent.md)). Without the tool, the agent has the same conversation according to the procedure, writes the files from the templates and generates the views following the specification ([decision](../decisions/tooling/2026-11-17-cli-keeps-generated-views.md)).

A repository whose team does not want a brain (e.g. a vendor's code) simply does not have one.
