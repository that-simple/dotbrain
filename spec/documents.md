# Documents

## Frontmatter

Every document of a brain starts with YAML frontmatter: a block between two lines `---` at the very beginning of the file. The frontmatter is for machines (agents and tools such as `lint`); the body below it is for people. Values in the frontmatter are English keys regardless of the brain's language.

| Field | Applies to | Required | Value |
| --- | --- | --- | --- |
| `description` | every document | MUST | One sentence in the brain's language about what the document covers. An agent decides from it whether to read further. |
| `status` | decisions, steps | MUST | Lifecycle status ([lifecycles](#lifecycles)). |
| `decided` | decisions with status `accepted`, `rejected`, `superseded` | MUST | Date the decision was accepted or rejected (`YYYY-MM-DD`). It does not change when the decision is superseded. |
| `superseded-by` | decisions with status `superseded` | MUST | ID of the decision that replaces it. |
| `assignee` | steps | MAY | List of the identities of the people working on the step, each of the form `user:<login>` with the person's login on the git host (e.g. `[user:jdoe]`). Set when the work starts, together with `status: in-progress`. It records who worked on the step; it does not reserve the step ([steps](#steps)). |
| `apply` | any document (usually a decision) | MAY | When the document is put into an agent's context: `always`, a glob, or a list of globs ([apply](#apply)). Absent means on demand. |

The manifest is the frontmatter of the index and has its own fields ([brain.md](brain.md#manifest)). Unknown fields are allowed and ignored by tools.

**Single source.** A value kept in the frontmatter is not repeated in the body by hand. For example, the status of a step is changed only in its frontmatter; the status line in its body is a generated view of it ([steps](#steps)).

### `apply`

- `apply: always`: the document is a rule the agent needs in every task. The agents adapter puts it into the agent's context in every task (the managed block of instruction files, [adapters/agents.md](adapters/agents.md)).
- `apply: "<glob>"` or a list of globs: the rule is needed only when working with matching files of the repository.
- No `apply`: the agent finds the document on demand, by its `description`.

Globs are relative to the repository root. `*` matches any characters within one path segment, `**` matches any number of segments, `?` matches one character. This is the syntax of `applyTo` in GitHub Copilot and `globs` in Cursor.

### Effective rule set

The rules for agents are the documents of the brain with an `apply` field:

1. Take every document of the brain with an `apply` field, except decisions whose `status` is not `accepted`. A proposed, rejected or superseded decision is never a rule.
2. Order the rules by the path of the document within the brain.
3. Split the set: rules with `apply: always`, and rules with globs. A document with a list of globs counts once for each glob.

The [agents adapter](adapters/agents.md) delivers the effective rule set to agents and limits the number and length of `always` rules ([budget](adapters/agents.md#budget)).

## Document kinds

The kind of a document follows from its path relative to the brain directory.

| Kind | Path | Role | Mandatory |
| --- | --- | --- | --- |
| `index` | `README.md` | Manifest, title, description of the brain, generated index block, conventions | Yes |
| `decision-list` | `decisions/README.md` | Generated list of decisions ([generated-views.md](generated-views.md#decision-list)) | Yes |
| `decision` | `decisions/**/YYYY-MM-DD-slug.md` | One decision (ADR), in `decisions/` or any of its subdirectories | No (the directory is mandatory) |
| `roadmap` | `roadmap.md` | Phases and gates with conditions to pass | No |
| `risks` | `risks.md` | Risks, their impact and mitigation | No |
| `step` | `steps/NN-slug.md` or `steps/<ticket-key>-slug.md` | Unit of work: the spec the work is done by | No |
| `area` | any other `.md` file, usually in an area directory (`architecture/` or another named in the index, [brain.md](brain.md#areas)) | Area of knowledge: one topic, decisions explained with their reasoning | No |

Files that an adapter places inside a brain directory, such as instruction files (`CLAUDE.md`, `AGENTS.md` and other files listed in [adapters/agents.md](adapters/agents.md#tools)), are not documents of the brain.

**Minimal brain:** `README.md` with a manifest and `decisions/README.md`, even when there are no decisions yet ([validity.md](validity.md#minimal-valid-brain)).

### Index

The index (`README.md`) contains, in this order: the manifest, an H1 title, a hand-written description of the brain, the generated index block ([generated-views.md](generated-views.md#index-block)) and the conventions of the brain that are not stated in the specification (such as the names of its area directories other than `architecture/`).

### Titles

Every document has exactly one H1 heading (`# Title`), the first heading after the frontmatter. The title of a decision is used in the decision list.

## Section keys and the section map

Documents that machines rely on (decisions and steps) have a fixed skeleton of sections. Each section has an English key defined here. The heading in the body is the label for that key in the brain's language.

**Sections are H2 headings** (`## Heading`). A heading matches a key when its text, with leading and trailing whitespace removed, is exactly equal to the label of the key:

- the value of the key in the `sections` map of the manifest, if the map has the key;
- otherwise the default English label below.

The `sections` map is created when the brain is set up, by translating the default labels into the brain's language. Agents and scripts use the same map, so recognizing sections is deterministic in every language.

| Key | Default label | Used in |
| --- | --- | --- |
| `goal` | Goal | step |
| `scope` | Scope | step |
| `out-of-scope` | Out of scope | step |
| `decisions` | Decisions | step |
| `acceptance` | Acceptance criteria | step |
| `stages` | Stages | step |
| `log` | Log | step |
| `open-questions` | Open questions | step |
| `context` | Context | decision |
| `options` | Options | decision |
| `recommendation` | Recommendation | decision |
| `decider` | Who decides and when | decision |
| `decision` | Decision | decision |
| `consequences` | Consequences | decision |
| `proposed` | Proposed | group heading in the decision list |
| `accepted` | Accepted | group heading in the decision list |
| `rejected` | Rejected | group heading in the decision list |
| `superseded` | Superseded | group heading in the decision list |
| `status` | Status | label in the status line of a step |
| `assignee` | Assignee | label in the status line of a step |

### Required sections

| Document | Required sections | Optional sections |
| --- | --- | --- |
| Decision `proposed` | `context`, `options`, `decider` | `recommendation` |
| Decision `accepted`, `rejected`, `superseded` | `decision` | `context`, `consequences` |
| Step | `goal`, `scope`, `acceptance` | `out-of-scope`, `decisions`, `stages`, `log`, `open-questions` |
| Index, roadmap, risks, area | none | — |

Additional sections are always allowed. Each required section appears exactly once.

## Decisions (ADR)

Every decision is a separate file in the format of an Architecture Decision Record (after Nygard and MADR).

**ID.** The file name without the extension: `YYYY-MM-DD-slug`, where the date is the day the file was created and the slug is a short English description in kebab-case. The ID is unique without coordination, so two people on two branches do not take the same ID. Decision files are never renamed.

**Layout.** The layout inside `decisions/` is free: flat, by domain, by year, or any combination in any order (e.g. `decisions/2026/payments/2026-10-28-slug.md` or `decisions/payments/2026/2026-10-28-slug.md`). Directory names are English kebab-case. The ID does not depend on the path and MUST be unique within the brain, so references and `superseded-by` work without a path. Moving a decision to another directory keeps its ID; relative links to it are updated in the same change. A brain with a layout other than flat describes it in one sentence in the conventions of its index, so that people and agents know where new decisions go. `decisions/` contains only decision files, the decision list `decisions/README.md` and instruction files.

**Frontmatter:**

```yaml
---
status: accepted
decided: 2026-10-28
description: "One sentence: what we decided."
---
```

**Body:** an H1 title and the sections required for the status. A minimal decision is the frontmatter, the title and the `decision` section with one paragraph. Reasoning longer than a few sentences belongs in an area document, and the decision links to it.

A `proposed` decision states the question in `context`, lists the options in `options`, MAY recommend one in `recommendation`, and names in `decider` the person who resolves it and when. Without another name, the decider is the owner of the brain.

**References.** Link to a decision with a relative path.

## Lifecycles

**Decision:**

| Status | Meaning |
| --- | --- |
| `proposed` | Open: question, context, options, who decides and when |
| `accepted` | Made |
| `rejected` | Rejected, with the reason; it stays so that the topic is not reopened without new context |
| `superseded` | Replaced by the decision in `superseded-by` |

Allowed transitions: `proposed` → `accepted` or `rejected`; `accepted` → `superseded`. Only the decider changes `proposed` to `accepted` or `rejected`, and sets `decided` at the same time. When a decision is superseded, the new decision names the old one in its `context`, and the old one gets `status: superseded` and `superseded-by`.

**Contradicting decisions from two branches.** The main branch never binds with two contradicting decisions. When a decision accepted on a branch contradicts an accepted decision that reached the main branch first (for example, both supersede the same decision in different directions), the branch that merges second turns its decision back to `proposed` before merging: it removes `decided`, keeps the ID, and becomes the decision on the contradiction, with `context` describing it and linking the decision on the main branch, `options` naming both decisions, and `decider` naming the person who resolves it in this brain. Fields and links that can name only one decision (`superseded-by`, links in steps and documents) keep the values from the main branch. This `accepted` → `proposed` transition is made by whoever merges the branch, person or agent, and only for a decision that has not reached the main branch yet ([agent-contract.md](agent-contract.md), rule 10).

**Step:**

| Status | Meaning |
| --- | --- |
| `draft` | Spec in preparation; open questions block the start |
| `agreed` | Scope and acceptance criteria agreed; work can start |
| `in-progress` | Work in progress; the `log` section is being filled in |
| `done` | Acceptance criteria met and checked |

Allowed transitions: `draft` → `agreed` → `in-progress` → `done`. Only a person changes a step from `draft` to `agreed`, by doing it or by an explicit instruction to an agent ([plan before work](#steps)).

## Steps

Acceptance criteria MUST be checkable, also for work that is not code. Example steps: a walking skeleton, a production deployment, a domain module. A decision made during a step is written to `decisions/` like any other, and the step links to it in its `decisions` section.

**IDs.** The file name of a step starts with its ID: a number (`01`, `02`…, at least two digits) or the key of its ticket in an issue tracker, in lowercase (`rp-111` for the ticket `RP-111`: a letter, then letters or digits, a hyphen and the number of the ticket). Both forms MAY be used in one brain, and the ID is unique in the brain. A number gives the order of the plan; a ticket key does not, so the order of steps with ticket keys is kept in the roadmap or the tracker. A brain MAY require ticket keys with a rule for agents; the specification does not.

**Numbers on parallel branches.** When two branches add steps with the same number, the step that reaches the main branch first keeps it. Before merging, the other branch gives its step the first free number and fixes the links to it. Steps already on the main branch are never renumbered. A ticket key is never changed: two steps with the same key are a conflict between documents, resolved like any other.

**Plan before work.** Work on a new step is first planned, then done. First the plan: the step is written with `status: draft`, and the task that writes it ends there, without any work on the step. Then the work: it starts only on a step that a person has set to `agreed`, on a separate instruction given after that. In git, the step, its `agreed` and the work MAY go in one pull request, as commits in this order.

**Size and stages.** A step is one result that can be reviewed and agreed as a whole. When the plan of a step describes several results, each useful on its own (for example a whole application), it is written as several steps, each with `status: draft`, and the rest of the plan stays in the roadmap. The line is not a number: an agent proposes the split, and the person who agrees the steps decides. A large step MAY have a `stages` section: the stages of the work in the order they are done, agreed together with the step. The work is done one stage at a time; every stage leaves the work in a working state, and a finished stage is one entry in the step's log.

**Status line.** Directly under its title, every step has a generated status line with its `status` and `assignee` ([generated-views.md](generated-views.md#status-line-of-a-step)), so that a person sees them in the text, and the index block shows the status next to every step. Both are generated from the frontmatter; the status and the people are changed only there.

**Who works on a step.** When the work on a step starts, the step gets `status: in-progress` and `assignee` with the people doing the work, in the same change. On a branch, others see this only after the branch is merged: `assignee` records who worked on the step, it does not reserve it. Coordinating who takes which step before that is up to the team.

**Log.** Every entry of the `log` section is a list item that starts with its date and a colon (`- YYYY-MM-DD: …`), appended at the end of the section. A conflict in the log when merging branches is resolved mechanically: keep the entries of both sides, sorted by date, with entries already on the main branch first within the same date. The text of the entries is not merged or changed.

## Conventions

Fixed by the specification:

- Markdown with YAML frontmatter.
- Relative links within the brain and to other files of the repository.
- File and directory names in English, kebab-case. Values in frontmatter and section keys are English keys.
- One topic per file. A file longer than a few hundred lines is split.
- Every document appears in the generated index block, except decisions, which appear in the decision list.
- Dates in the format `YYYY-MM-DD`.
- One language per brain, the one declared in `lang`.

Configurable per brain (in the manifest or the index): the language and the section map, area directories other than `architecture/`, and the layout of `decisions/`.
