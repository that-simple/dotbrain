# Starter

Sets up a brain in a code repository: `.brain/` ([specification](../spec/README.md)) and instruction files for AI agents. The steps below are the same for `init` and for an agent without the CLI; the generated views are kept by the CLI, or by an agent following the specification, not by hand.

Templates are in English. For a brain in another language, the skeleton is written in English first and translated when the setup is finished; without the tool, the agent can also translate the templates while copying them. File names, frontmatter keys and frontmatter values stay in English, except `description`, which is in the language of the brain.

| Template | Use |
| --- | --- |
| [index.md](index.md) | `.brain/README.md`: manifest, what the project is, generated index block, conventions |
| [decision-list.md](decision-list.md) | `.brain/decisions/README.md`, generated; the template is the empty list |
| [decision-proposed.md](decision-proposed.md), [decision-accepted.md](decision-accepted.md) | One decision (ADR) |
| [languages.md](languages.md) | The decision on the languages of the work |
| [order-of-work.md](order-of-work.md), [order-of-work-before.md](order-of-work-before.md) | The decision on the order of work: the default, and changes to the brain before the work |
| [step-ids.md](step-ids.md) | The decision to name steps by the keys of their tickets |
| [roadmap.md](roadmap.md) | Phases with scope, and gates with conditions to pass |
| [risks.md](risks.md) | Table of risks with impact and mitigation |
| [area.md](area.md) | One area of `architecture/` |
| [step.md](step.md) | Step |
| [managed-block.md](managed-block.md) | The managed block of instruction files |
| [brain-rules.md](brain-rules.md) | The managed block of the rule file of the brain: the rules of work on the brain |
| [brain-review.md](brain-review.md) | The Claude Code subagent for the review against the brain |
| [claude-settings.json](claude-settings.json) | `.claude/settings.json`: the Claude Code hook that runs `dotbrain lint` |
| [agent-setup.md](agent-setup.md) | `DOTBRAIN-SETUP.md`, written by `init`: the instruction for the agent that finishes the setup |

## Steps

The setup has two parts: the skeleton, then finishing the setup. `init` asks the questions and writes the skeleton; it pastes the part "Finishing the setup" into `DOTBRAIN-SETUP.md` for the agent. Without the tool, an agent does both parts and asks the person the questions.

1. **Ask** the person setting up the brain, one question at a time: the name of the brain (kebab-case, usually the name of the repository), its language (BCP 47 tag), its owner, and one sentence describing the project.
2. **Index.** Copy [index.md](index.md) to `.brain/README.md`. Fill in the manifest and write the name of the brain as the project name.
   - For a brain in English, remove the `sections` map and the comment above it.
   - For a brain in another language, remove the comment above the `sections` map.
3. **Decision list.** Generate `.brain/decisions/README.md` following the [decision-list algorithm](../spec/generated-views.md#decision-list). With no decisions yet, it is the [decision-list.md](decision-list.md) template with the labels of the brain's map.
4. **Languages of the work.** Ask about the language of code, comments, commits, branch names and pull requests (by default English). Copy [languages.md](languages.md) to `.brain/decisions/process/<today>-languages.md`, and fill in the date and the language. Decisions are kept in domain subdirectories of `decisions/` from the first one; `process/` is the domain of the rules of work.
5. **Order of work.** Ask whether changes to the brain go in the same pull request as the work that follows from them (the default) or to the main branch in a separate pull request before it. Copy [order-of-work.md](order-of-work.md) for the default, or [order-of-work-before.md](order-of-work-before.md) for the other answer, to `.brain/decisions/process/<today>-order-of-work.md` and fill in the date.
6. **Step names.** Ask whether steps are named by the keys of their tickets in the issue tracker instead of numbers (by default numbers). If they are, copy [step-ids.md](step-ids.md) to `.brain/decisions/process/<today>-step-ids.md` and fill in the date. Generate the decision list again.
7. **Index block.** Generate the index block in `.brain/README.md` following the [index-block algorithm](../spec/generated-views.md#index-block).
8. **Instruction files.** For each of `CLAUDE.md` and `AGENTS.md` at the repository root and `.github/copilot-instructions.md`:
   - if the file does not exist, create it with the heading `# <Project name>` followed by the block from [managed-block.md](managed-block.md);
   - if it exists, insert the block after its first heading and leave the rest unchanged, then check that the rest does not contradict the brain;
   - replace `<brain-description>` with the `description` from the manifest;
   - next to every instruction file, create its [rule file of the brain](../spec/adapters/agents.md#rule-file-of-the-brain) from [brain-rules.md](brain-rules.md): `.claude/rules/<brain>.md` with the frontmatter `paths` for `CLAUDE.md`, `.brain/AGENTS.md` for `AGENTS.md`, and `.github/instructions/<brain>.instructions.md` with the frontmatter `applyTo` for `.github/copilot-instructions.md`; in `AGENTS.md`, link it with the line `` - `.brain/**`: [Work on the brain](.brain/AGENTS.md) `` under the heading `## Rules for specific files`, before the line `Specification:`;
   - in `CLAUDE.md` only, add the [Claude Code add-on](../spec/adapters/agents.md#tool-add-ons) after the compact form of the contract;
   - add the rules with `apply: always` (the decisions on languages, on the order of work and, if there is one, on step names) as "Rules for this brain" before the line `Specification:`, as described in the [agents adapter](../spec/adapters/agents.md#content);
   - check that git ignores none of the files these steps write that the tools read: the brain, the instruction files and the rule files, `.claude/rules/` included, where rules with a glob also go for Claude Code once the brain has them ([tools](../spec/adapters/agents.md#tools)); the tools skip the files git ignores ([brain.md](../spec/brain.md#concepts)), so `lint` would report them missing, and if git ignores any, tell the person to change `.gitignore`; check also that git does not ignore `.claude/agents/`, where the review subagent goes, and tell the person if it does;
   - when `CLAUDE.md` exists, copy [brain-review.md](brain-review.md) to `.claude/agents/brain-review.md`, the subagent that reviews changes against the brain ([agents adapter](../spec/adapters/agents.md#review-against-the-brain));
   - when `CLAUDE.md` exists, copy [claude-settings.json](claude-settings.json) to `.claude/settings.json`, the hook that runs `dotbrain lint` when the agent ends work that changed the brain ([agents adapter](../spec/adapters/agents.md#hooks)), and replace `<version>` with the version of the dotbrain package: `init` writes the version it runs from, and without the tool it is the version in the `README.md` of the dotbrain repository; when `.claude/settings.json` exists, add the entry of the template to its `hooks.Stop` list instead, and leave the rest of the file unchanged.

## Finishing the setup

1. **Translate.** For a brain in a language other than English, translate everything of the skeleton that is still in English into the language of the brain, keeping file names, frontmatter keys and frontmatter values in English (`description` is the exception: translate it): every label of the `sections` map of the manifest in `.brain/README.md` (these labels are the headings of decisions and steps from now on), the text and headings of `.brain/README.md` and of every decision, the headings of `.brain/decisions/README.md` (they are the labels of the map), and `.claude/agents/brain-review.md`. In the managed blocks of the instruction files, translate only the titles and texts of the rules, exactly as in their decisions: the contract, the headings of the parts, `Source:`, `Specification:`, the markers and the comment stay in English ([agents adapter](../spec/adapters/agents.md#content)). The three instruction files carry the same block; only the Claude Code add-on in `CLAUDE.md` and relative links differ. Write everything below in the language of the brain.
2. **Read the code.** Read what the repository says about itself: its `README.md` and other documentation, build and dependency files, entry points, the layout of directories, configuration, CI and deployment, tests. Do not open secrets (such as `.env` files or keys) and do not copy code or other raw material into the brain: the brain keeps what follows from it, with a link to its source.
3. **Describe the project.** Replace every `<placeholder>` left in `.brain/README.md`: the project name in the title if it is not the name of the brain, what the project is and for whom, how steps are named (by ticket keys if the brain has the decision on step names, otherwise by numbers: this was asked when the skeleton was written, so do not ask again), and conventions of this brain, if any. Ask the person what you cannot tell from the repository; do not invent content.
4. **Architecture.** Write `.brain/architecture/overview.md` from the template [area.md](area.md): the components of the project, how they talk to each other, the data they keep, how the project is run and deployed. Describe the code as it is now, and link every statement to the files it comes from, with links relative to the document (for example `../../src/server.py`). When one document would hold several topics, write one area per topic in `.brain/architecture/` and keep the overview short. What the code does not show is a question for the person, not something to guess.
5. **Decisions from the code.** Record the choices the code shows the team made, such as the language and framework, the database, how components communicate, hosting and deployment, external services, and rules the documentation states, as decisions with `status: proposed` from the template [decision-proposed.md](decision-proposed.md), one file each in a domain subdirectory of `.brain/decisions/` (`.brain/decisions/<domain>/<today>-<slug>.md`). The context names the source with links to the files; the options are the current choice and a realistic alternative; the person who decides is the owner of the brain. Do not mark them `accepted`, even when the code clearly relies on them: only the person who decides accepts a decision. Record the choices that matter, at most about ten.
6. **Optional documents**, when the person wants them now: `.brain/roadmap.md` and `.brain/risks.md` from the templates [roadmap.md](roadmap.md) and [risks.md](risks.md). Fill them in or leave the placeholders replaced by one honest sentence each; do not invent content.
7. **Generated views.** With the dotbrain tools, run `index`. Without them, generate the views following the [specification](../spec/generated-views.md):
   - in `.brain/decisions/README.md`, under the heading of each status (the labels `proposed`, `accepted`, `rejected` and `superseded` of the map, in that order, a heading only for a status that has decisions), one line per decision, sorted by the file name alone, without its directory (that is by date, then by slug): `- [<title>](<domain>/<file>): <description>`, followed by ` (<decided>)` for every status but `proposed`;
   - in the index block of `.brain/README.md`, one line `- [<name>](<path>): <description>` per document other than decisions, where `<name>` is the file name alone (`- [overview.md](architecture/overview.md): …`) and only a `README.md` is named by its path (`- [decisions/README.md](decisions/README.md): …`); the lines are grouped by directory, documents at the root of the brain first, then a group `` `<directory>/`: `` per directory, each sorted by file name.
8. **Check** the brain against the [validity rules](../spec/validity.md#rules), at least: every document has a `description` in its frontmatter and one title; every relative link points to an existing file; the decision list and the index block list exactly the decisions and documents of the brain; the managed blocks of the three instruction files carry the rules with `apply: always`. With the dotbrain tools, run `lint` and `index --check`.

## Working on a step in Claude Code

Writing a step and carrying it out each start in plan mode ([tool add-ons](../spec/adapters/agents.md#tool-add-ons)):

1. **The step.** In plan mode, the agent presents the plan of the step. Accept it and choose auto mode: the agent writes the step with `status: draft`. Review it and set it to `agreed`.
2. **The work.** On a separate instruction, in plan mode again, the agent presents how it will do the step, stage by stage for a large step. Accept it and choose auto mode: the agent does the work, with one commit per finished stage.

A giant step (for example a whole application) is split into several steps; a large one is done in stages, each leaving the work in a working state ([steps](../spec/documents.md#steps)).

New documents later come from the same templates: a step from [step.md](step.md), a decision from [decision-proposed.md](decision-proposed.md) or [decision-accepted.md](decision-accepted.md), an area from [area.md](area.md).
