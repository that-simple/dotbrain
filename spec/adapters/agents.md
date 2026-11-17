# Agents adapter

An adapter ([README.md](README.md)) that delivers the [agent contract](../agent-contract.md) and the effective rule set of the brain ([documents.md](../documents.md#effective-rule-set)) to AI agents. The contract and the rules are the same whatever the way of delivery. Version `1.0.0` specifies one way: **instruction files**, which work without a network.

AI tools read some files on their own: `CLAUDE.md` (Claude Code), `AGENTS.md` (Codex and other tools following that standard), `.github/copilot-instructions.md` (GitHub Copilot). dotbrain puts the core of the [compact form](#compact-form) of the contract and the rules of the brain into these files as a **managed block**, and the rules of work on the brain into a [rule file of the brain](#rule-file-of-the-brain), which the tool reads when the agent works in the brain directory. An instruction file is an adapter of the brain, not its source of truth.

## Hierarchy

**Brain > managed block > hand-written part.**

- The managed block is generated from the agent contract, the add-on of the file's tool, and the rules for agents in the brain. A generator (a tool, or an agent following this document) changes only the block. The rule file of the brain is generated whole, from the work on the brain of the compact form.
- The hand-written part outside the block contains only operational hints for the tool and the repository (commands, paths, environment, tool specifics). It contains no decisions and no rules of work: those go to the brain and come back to the file through the block. A rule of work written there by hand is a discrepancy, to be moved to the brain as a decision.
- The hand-written part MUST NOT contradict the brain. An agent that notices a contradiction reports it as a discrepancy; the brain wins.

## Managed block

```markdown
<!-- BEGIN:dotbrain <spec-version> -->
<!-- Managed block: generated from the agent contract and the brain. Do not edit by hand; change the brain and regenerate. Text outside this block must not contradict the brain. -->

<content>
<!-- END:dotbrain -->
```

`<spec-version>` is the `spec` of the brain (e.g. `1.0.0`). The comments are written as above, in English.

### Content

The content of the block is, in this order:

1. **Contract:** the core of the [compact form](#compact-form) of the agent contract, with its placeholders filled in.
2. **Tool add-on:** in the instruction file of a tool that has one, the compact [add-on of that tool](#tool-add-ons), under a heading naming the tool. Skipped in the files of other tools.
3. **Rules for this brain:** the heading `## Rules for this brain`, followed by the effective set of `always` rules ([effective rule set](../documents.md#effective-rule-set)). For each rule: a level-3 heading with the title of the document, the text of the rule, and the line `Source: [<path>](<link>)`, where `<path>` is the path of the document relative to its brain and `<link>` the link to it from the instruction file. Skipped when the set is empty.
4. **Rules for specific files:** the heading `## Rules for specific files`, followed by one line per glob of the rules with a glob, in the order of the effective set: `` - `<glob>`: [<title>](<link>) ``. In `AGENTS.md`, the first line is `` - `<brain-path>/**`: [Work on the brain](<link>) ``, linking to the rule file of the brain `<brain-path>/AGENTS.md`. Skipped when there are no lines. These rules are read on demand when working with matching files; tools with scoped instruction files also get them through [tools](#tools).
5. **Specification:** the line `Specification: [dotbrain <spec-version>](<spec-link>)`, linking to the specification in the exact version ([README.md](../README.md#linking-to-an-exact-version)).

The parts are separated by one blank line, as are the heading, the text and the source line of every rule. The compact form and the tool add-ons use no level-3 headings, so that every level-3 heading in a block starts a rule. The template [managed-block.md](../../templates/managed-block.md) of the starter shows a block with parts 1 and 5; in `CLAUDE.md`, part 2 follows part 1. The template [brain-rules.md](../../templates/brain-rules.md) shows the managed block of a rule file of the brain.

**The text of a rule** is the content of its `decision` section when the rule is a decision, and the body without the H1 title for any other document. It is copied verbatim, in the brain's language, except that relative links are rewritten so that they point to the same targets from the location of the instruction file.

**Language.** The compact form of the contract, the tool add-ons, the fixed words of the block (the headings of the parts, `Source:`, `Specification:`) and the two comment lines are always in English, in every brain. The titles and texts of the rules are in the language of the brain, as in its documents. A block is generated character for character in every language and compared as a whole.

**Identical blocks.** Every instruction file of the repository carries the same block. The only differences allowed are the [tool add-on](#tool-add-ons) of the file's tool, the line linking the rule file of the brain in `AGENTS.md`, and relative links, which point to the same targets from the location of each file (e.g. `.brain/…` in `CLAUDE.md`, `../.brain/…` in `.github/copilot-instructions.md`). A change of the contract or of a rule changes all of them in the same way.

## Budget

The effective set of `always` rules is limited, because it is in the agent's context in every task:

- at most **10** rules with `apply: always` in the effective set;
- at most **150 words** in the text of each such rule (words are counted as runs of characters separated by whitespace).

Exceeding the budget is a warning ([V-BUDGET](#validity-rules)), reported by `lint` or by an agent that regenerates the block. Excess rules move to a glob or become on-demand rules (no `apply`); a long rule moves its reasoning to an area document and keeps only the rule in its `decision` section.

## Tools

| Tool | Core and rules `always` (managed block) | Work on the brain (rule file of the brain) | Rules with a glob |
| --- | --- | --- | --- |
| Claude Code | `CLAUDE.md` at the repository root | `.claude/rules/<brain>.md` | `.claude/rules/<brain>-<name>.md` |
| Tools reading `AGENTS.md` | `AGENTS.md` at the repository root | `<brain-path>/AGENTS.md` | Line in "Rules for specific files" (on demand) |
| GitHub Copilot | `.github/copilot-instructions.md` | `.github/instructions/<brain>.instructions.md` | `.github/instructions/<brain>-<name>.instructions.md` |

A repository uses the instruction files for the tools its people use. Instruction files for other tools (such as Cursor rules) are not specified in version `1.0.0`.

**Which files are generated.** Which tools a repository uses follows from the files at its root ([adapters](README.md#rules-for-every-adapter), rule 4). A generator keeps the managed block of every root instruction file that exists (`CLAUDE.md`, `AGENTS.md`, `.github/copilot-instructions.md`) and does not create them; the [starter](../../templates/README.md) does. For every root instruction file that exists, it writes the [rule file of the brain](#rule-file-of-the-brain) of that tool. When `CLAUDE.md` exists, it writes a file in `.claude/rules/` for every rule with a glob; when `.github/copilot-instructions.md` exists, a file in `.github/instructions/`. A file in either directory that contains a start marker of a dotbrain managed block and is neither the file of a current rule nor the current rule file of the brain is out of date, and the generator removes it, as it removes `<brain-path>/AGENTS.md` with such a marker when `AGENTS.md` does not exist. Files without such a marker are the repository's own and are never changed.

In both files for a rule with a glob, `<brain>` is the `brain` of the manifest and `<name>` is the file name of the document without `.md`. The whole file is generated. Its rule has a level-3 heading with the title, the text of the rule and the source line, as in the managed block, with relative links pointing to the same targets from the file's location. For a rule with several globs, there is one file with all of them, in the order of the rule's globs.

**Claude Code rules for a glob.** Claude Code reads a file in `.claude/rules/` with `paths` in its frontmatter when it reads or edits a matching file, and resolves the patterns from the repository root:

```markdown
---
paths:
  - "<glob>"
---
<!-- BEGIN:dotbrain <spec-version> -->
<!-- Managed block: generated from the agent contract and the brain. Do not edit by hand; change the brain and regenerate. Text outside this block must not contradict the brain. -->

### <title>

<text of the rule>

Source: [<path>](<link>)
<!-- END:dotbrain -->
```

`paths` has one entry per glob. A pattern without `/` matches in every directory in Claude Code but only at the repository root in `apply` ([documents.md](../documents.md#apply)), so a glob without `/` is written with a leading `/` (`*.md` becomes `/*.md`). The directory `.claude/rules/` is committed to the repository: when git ignores it, the rules work only for the person who generated them.

**Copilot instructions for a glob.** The file `.github/instructions/<brain>-<name>.instructions.md`:

```markdown
---
applyTo: "<glob>"
---
<!-- BEGIN:dotbrain <spec-version> -->
<!-- Managed block: generated from the agent contract and the brain. Do not edit by hand; change the brain and regenerate. Text outside this block must not contradict the brain. -->

### <title>

<text of the rule>

Source: [<path>](<link>)
<!-- END:dotbrain -->
```

For a rule with several globs, `applyTo` lists them separated by commas, without spaces.

Both files follow the language rules of the managed block ([content](#content)) and are compared as a whole, frontmatter included.

Instruction files are not documents of a brain, also when they are placed inside a brain directory ([documents.md](../documents.md#document-kinds)).

## Rule file of the brain

The rule file of the brain carries the work on the brain of the [compact form](#compact-form), with its placeholders filled in, to the agent when it works in the brain directory. The core rule to start with the index makes the agent read a file in the brain before it writes to it, so by then the tool has the rule file in the agent's context, or, for `AGENTS.md`, the agent follows the link in "Rules for specific files". The whole file is generated, follows the language rules of the managed block ([content](#content)) and is compared as a whole, frontmatter included. `<brain>` is the `brain` of the manifest; the name without a suffix does not collide with the files of rules with a glob, `<brain>-<name>`.

- **Claude Code:** `.claude/rules/<brain>.md`, with `paths` for the brain directory:

  ```markdown
  ---
  paths:
    - "<brain-path>/**"
  ---
  <managed block>
  ```

- **GitHub Copilot:** `.github/instructions/<brain>.instructions.md`, with the frontmatter `applyTo: "<brain-path>/**"` before the block.
- **Tools reading `AGENTS.md`:** `<brain-path>/AGENTS.md`, the nested instruction file of the brain directory, without frontmatter: the whole file is the block.

The managed block of the file is written as in [managed block](#managed-block), with the work on the brain as its only content. The template [brain-rules.md](../../templates/brain-rules.md) shows it for `.brain`.

## Regeneration and conflicts

- Regenerate the managed blocks and the rule files after a change of the contract, of the tool add-ons, of a rule (its `apply`, status, title or text) or of the manifest.
- A conflict in a managed block when merging branches is resolved by regenerating it ([generated-views.md](../generated-views.md#conflicts)).
- When an instruction file has no block yet, add it after the first heading of the file, or at the beginning of a file without headings.

## Compact form

The compact form is the text of the contract that agents get in instruction files. It has two parts: the **core**, in the managed block of every root instruction file, in the agent's context in every task; and the **work on the brain**, in the [rule file of the brain](#rule-file-of-the-brain), read when the agent works in the brain directory. Together they cover everyday work; the [contract](../agent-contract.md) and this specification cover the rest. Placeholders:

- `<brain-path>`: path of the brain directory relative to the repository root (e.g. `.brain`);
- `<brain-description>`: the `description` from the brain's manifest;
- `<spec-link>`: link to the specification in the exact version ([README.md](../README.md#linking-to-an-exact-version)).

The core has at most 400 words, counted as in the [budget](#budget) with the placeholders unfilled, because it is in the context of every task like the `always` rules. Every rule of the [contract](../agent-contract.md) is carried by exactly one part:

| Part | Rules of the contract |
| --- | --- |
| Core | 1–6, 8, 15–18, 20–22 |
| Work on the brain | 7, 9–14, 19, 23 |

### Core

```markdown
## The brain is the source of truth

<brain-description> The brain is in `<brain-path>/`: decisions, knowledge and the plan of the work. If the brain and the work (code, process, documents outside the brain, this file included) disagree, the brain wins.

- Start with `<brain-path>/README.md`, the index of documents: scan the `description` of each document before reading whole documents, and read only what the task concerns.
- Asked about the project, answer from the brain, link the documents the answer rests on, and say when the brain does not cover the question.
- A decision is made in the brain first, then carried into the work. A change that departs from a document updates the document in the same change, for code in the same pull request.
- Do not resolve decisions with `status: proposed`: prepare options and a recommendation if useful, and ask. Change their status only on the explicit instruction of the person who decides.
- A decision found in a conversation, transcript, chat or email is recorded as `proposed` with its source, even if it was made there.
- Rules with `apply: always` are in this block and apply to every task; rules with a glob apply when working with matching files.
- Report any discrepancy between the brain and the work; do not leave it or fix it silently.
- Keep to the scope and acceptance criteria of the step you work on; propose anything outside them. A new step is only written, with `status: draft`; a person sets it to `agreed`, and the work starts after that, on a separate instruction.

## Working in the repository

- Write to the brain in its language (`lang` in the manifest); talk to people in their language.
- The languages of code, comments, commits, branch names and pull requests, and the order of work (brain changes with the work or before it), are decisions in the brain with `apply: always`; without them, ask before assuming.
- Before committing a finished stage of a step and before setting a step to `done`, run the repository's checks and record in its log what was checked and how.
- Before setting a step to `done`, merging a branch into the main branch or committing directly to it, review the change against the brain (the review procedure of the dotbrain specification) and report the discrepancies.
```

### Work on the brain

```markdown
## Work on the brain

These rules apply to every change in `<brain-path>/`, in addition to the managed block of the root instruction file.

- A new decision is a new file `YYYY-MM-DD-slug.md` in `<brain-path>/decisions/` (in the subdirectory the index's conventions name, if any) with frontmatter (`status`, `description`, and `decided` once resolved) and the sections its status requires, headed with labels from the `sections` map of the manifest. Before adding one, check the descriptions of existing decisions; if one already covers the matter, report it instead.
- After adding a decision or changing its frontmatter or title, regenerate `<brain-path>/decisions/README.md`. After adding a document or changing its `description`, regenerate the index block in `<brain-path>/README.md`. After changing the `status` or `assignee` of a step, regenerate its status line and the index block. Never edit generated views by hand.
- Resolve a conflict in a generated view by regenerating it. In the log of a step, keep the entries of both sides, sorted by date, with those already on the main branch first within a date. If a step added on your branch has the number of a step already on the main branch, give yours the first free number and fix the links to it. Resolve any other conflict in a document by reading both versions and the version before the change; merge what does not contradict, and record a contradiction as a `proposed` decision with both options. If a decision accepted on your branch contradicts one accepted on the main branch, turn yours back to `proposed` as that decision; until it is resolved, the main branch's version binds.
- When the work on a step starts, set its `status` to `in-progress` and its `assignee` to the people doing the work (in the first commit of the work). Do a step with `stages` one stage at a time, each leaving the work in a working state (one commit each). Record progress in its log, one list entry per change or finished stage, starting with the date (`- YYYY-MM-DD: …`).
- Keep raw material (recordings, transcripts, emails, PDFs, contracts, images) at its source: write to the brain what follows from it (decisions, knowledge, open questions) with a link to the source, never the material itself.
- Do not put run instructions, commands, personal notes or personal data into the brain; commands go to the repository's `README.md` or outside the managed blocks of instruction files.
- If the `dotbrain` CLI is available, run `dotbrain lint` before ending work that changed the brain, and fix what it reports.
```

## Tool add-ons

A tool add-on belongs to one tool. It is a way of carrying out rules of the contract (such as the plan and the work of [plan before work](../documents.md#steps)) with features of that tool; agents of other tools carry out the same rules without it. It goes only into the instruction file of its tool ([content](#content), part 2).

| Tool | Add-on |
| --- | --- |
| Claude Code | Plan mode at the start of writing a step and of carrying it out |
| Other tools | None in version `1.0.0` |

**Claude Code.** Writing a step and carrying it out, the plan and the work of [plan before work](../documents.md#steps), each start in plan mode:

1. **Writing a step.** In plan mode, the agent presents the plan of the step: its goal, scope, acceptance criteria and, for a large step, its stages. The person accepts the plan and chooses auto mode, and the agent writes the step with `status: draft` and ends the task. The person reviews the step and sets it to `agreed`.
2. **Carrying out a step.** On a separate instruction, in plan mode again, the agent presents how it will do the `agreed` step, stage by stage when it has stages. The person accepts the plan and chooses auto mode, and the agent does the work.

Accepting a plan in plan mode does not agree the step. The person chooses auto mode; the agent enters plan mode itself when the session is not in it. Compact form for `CLAUDE.md`:

```markdown
## Claude Code

- Start writing a new step, and carrying out an `agreed` one, in plan mode. If the session is not in plan mode, enter it and present the plan; write the step or do the work only after the person accepts the plan. Accepting the plan does not agree the step: a new step is still written with `status: draft`.
```

## Review against the brain

The [review against the brain](../review.md) runs, where the tool allows it, in a separate context without the history of the work under review.

| Tool | Review |
| --- | --- |
| Claude Code | Subagent `.claude/agents/brain-review.md`, copied by the [starter](../../templates/README.md) from [brain-review.md](../../templates/brain-review.md) when the repository has `CLAUDE.md` |
| Other tools | The agent runs the procedure itself, in a new session when the tool has no subagents |

The subagent file is not a generated view: it has no managed block, a generator never changes it, and the repository MAY adapt it (for example, name its checks). It is committed to the repository like `.claude/rules/`.

A tool that runs hooks MAY run the repository's checks in a hook when the agent ends its work, so that they do not depend on the agent remembering them.

## Hooks

Rule 23 of the [contract](../agent-contract.md) has the agent run `dotbrain lint` before it ends work that changed the brain. A tool that runs hooks can enforce it, so that a violation goes back to the agent before the work reaches a pull request.

| Tool | Hook |
| --- | --- |
| Claude Code | `Stop` hook in `.claude/settings.json`, from [claude-settings.json](../../templates/claude-settings.json) of the [starter](../../templates/README.md) when the repository has `CLAUDE.md` |
| Other tools | None in version `1.0.0`: the agent follows rule 23 |

**Claude Code.** The hook of the starter, a POSIX shell command:

- runs `npx --yes @that-simple/dotbrain@<version> lint` with the exact version of the package, not a range, so that after the first download it works without a network and a new version does not come in by itself; `init` writes the version it runs from;
- runs `lint` only when `git status` shows changes in the brain directory, the root instruction files, `.claude/rules/` or `.github/instructions/`, or when `HEAD` differs from the one of the last successful check, which it keeps in the `.git/` directory (`dotbrain-lint-head`); a turn that does not touch the brain does not run `npx`;
- when `lint` fails (a violation in the brain, or `npx` cannot get the package), ends with code 2 and the output on the error output, which Claude Code gives back to the agent; it ends with code 0 when `stop_hook_active` is set (the agent is already continuing because of a hook), when `npx` is not available, and outside a git repository.

An existing `.claude/settings.json` is the repository's own: the hook is added to its `hooks.Stop` list, and the rest of the file stays unchanged. The file is not a generated view; the repository MAY adapt the hook, for example run its own checks instead.

## Validity rules

These rules apply in addition to the [rules of the core](../validity.md#rules) when the repository has instruction files:

| ID | Severity | Rule |
| --- | --- | --- |
| V-BUDGET | warning | The effective set of `always` rules has at most 10 rules, and the text of each has at most 150 words ([budget](#budget)). |

Managed blocks of instruction files are generated views checked by [V-VIEWS](../validity.md#rules).
