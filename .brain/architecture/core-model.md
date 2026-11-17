---
description: "The brain, the manifest, frontmatter, the core document kinds, decisions as ADRs, lifecycles, generated views, conventions and what the brain does not keep."
---
# Core model

The core is everything every brain has: the format, documents, lifecycles, generated views and work in git. A brain lives only in a code repository ([decision](../decisions/model/2026-11-05-code-repository-only.md)).

## Concepts

- **Brain:** the `.brain/` directory at the root of a code repository, the source of truth for the product, architecture, infrastructure and code of that repository. A repository has one brain ([decision](../decisions/model/2026-10-28-name-and-brain-directory.md)).
- **Document:** a markdown file in the brain with YAML frontmatter. One topic per file. The brain contains only documents; raw material (transcripts, emails, PDFs, contracts, images) stays at its source, and the brain contains the result with a link to it ([decision](../decisions/model/2026-10-28-brain-is-not-a-data-lake.md)).
- **Manifest:** the frontmatter of the index of the brain.
- **Owner of the brain:** the person or role responsible for the brain who by default decides decisions ([governance.md](governance.md)).
- **Generated view:** a file or block assembled from the frontmatter of other documents (e.g. the decision list); it is not edited by hand.

## Frontmatter

Frontmatter is a YAML block between `---` lines at the start of a file, as in Claude's skills. It serves machines (the agent, `lint`), and the content under it serves people. Values in the frontmatter are English keys, regardless of the language of the brain ([languages.md](languages.md)).

The single-source principle: a value in the frontmatter is not repeated by hand in the content (e.g. the status of a step is changed only in the frontmatter, and the status line in the content is a generated view).

**Manifest** (the frontmatter of `.brain/README.md`, [decision](../decisions/model/2026-10-28-manifest-in-index-frontmatter.md)):

```yaml
---
brain: billing                 # name of the brain (kebab-case)
lang: cs                       # BCP 47
spec: 1.0.0                    # version of the specification
owner: jan.novak               # person or role (informational text)
description: "Jedna věta o tom, čeho se brain týká."
sections:                      # optional: section key → heading in the language of the brain
  goal: Cíl
  scope: Rozsah
  acceptance: Kritéria přijetí
  proposed: Navrhované
  # no key = English label
---
```

The version of the specification is described by a [decision](../decisions/model/2026-10-28-spec-version-without-beta-migration.md); it is in semver, and the first published version is `1.0.0`, with a migration from the draft `0.1` ([decision](../decisions/model/2026-11-17-spec-version-in-semver.md)). Fields the specification does not know are allowed and ignored.

**Every document** ([decision](../decisions/model/2026-10-28-document-frontmatter.md)) has `description`: one sentence in the language of the brain, by which an agent decides whether to read on. Steps (`status`, `assignee`) and decisions (below) have additional fields. Every document may have `apply` (`always`, a glob or none), which says when it goes into the agent's context ([decision](../decisions/agents/2026-10-28-apply-scope-for-agent-rules.md)). The kind of a document follows from its path.

The full list of fields is set by the specification ([spec/brain.md](../../spec/brain.md), [spec/documents.md](../../spec/documents.md)).

## Sections and the heading map

Only the documents machines rely on have a fixed skeleton; an agent understands a knowledge area from its context ([decision](../decisions/model/2026-10-28-section-map-in-manifest.md)):

| Document kind | Required sections | Optional sections |
| --- | --- | --- |
| `proposed` decision | `context`, `options`, `decider` | `recommendation` |
| `accepted`, `rejected`, `superseded` decision | `decision` | `context`, `consequences` |
| Step | `goal`, `scope`, `acceptance` | `out-of-scope`, `decisions`, `stages`, `log`, `open-questions` |
| Knowledge area, roadmap, risks | none | — |

Additional sections are always allowed. Section keys are in English; the heading in the content is the label from the `sections` map in the manifest, and without a map the English label (e.g. `## Goal`). The specification and templates are in English, and a brain in another language is made by the agent translating the template and writing the map.

## Core document kinds

| Kind | Path | Role | Mandatory |
| --- | --- | --- | --- |
| `index` | `README.md` | Manifest, description of the brain, index of documents with one sentence per file, conventions | Yes |
| `decision` | `decisions/**/YYYY-MM-DD-slug.md` | One decision (ADR), in `decisions/` or its subdirectories | Yes (directory) |
| `decision-list` | `decisions/README.md` | Decision list generated from frontmatter | Yes (generated view) |
| `roadmap` | `roadmap.md` | Phases, gates with a passing condition | No |
| `risks` | `risks.md` | Table: risk, impact, mitigation | No |
| `area` | `architecture/*.md` or another directory described in the index | Knowledge area: one technical or product topic, decisions expanded with their rationale | No |
| `step` | `steps/NN-slug.md` or `steps/<ticket-key>-slug.md` | Unit of work: the spec the work is done by | No |

The minimal brain is the index and the decisions directory. File and directory names are in English. Areas are in `architecture/` by default (e.g. overview, domains, backend, frontend, infrastructure, security); a brain describes other area directories in its index.

## What the brain does not keep

- Run instructions and commands: they belong in the repository's `README.md` or the manual part of an instruction file.
- Personal notes and personal data.
- Raw material: it stays at its source, and the brain links to it.

## Decisions (ADR)

Every decision is a separate file in the ADR format (Architecture Decision Record, after Nygard and MADR), [decision](../decisions/model/2026-10-28-decisions-as-adr.md).

**The ID** is the file name without the extension: `YYYY-MM-DD-slug` (the creation date and a short description in English). It is unique without coordination, so two people on two branches will not take the same ID. Decision files are not renamed. The layout of the `decisions/` directory is free (flat, by domain, by year or a hybrid), and the ID is unique in the brain regardless of the path ([decision](../decisions/model/2026-10-28-decision-area-subdirectories.md)). Decisions that are too many for one directory are not split into several brains, but arranged in subdirectories.

**Frontmatter:**

```yaml
---
status: accepted          # proposed | accepted | rejected | superseded
decided: 2026-10-28       # date of acceptance or rejection
superseded-by: 2026-12-01-new-auth   # only with superseded
description: "One sentence: what we decided."
---
```

**Content:** sections according to the table in "Sections and the heading map", with headings from the map of the brain.

The minimal decision is the frontmatter, a title and one paragraph: a few lines, as much as an item on a list. A rationale longer than a few sentences lives in an area, and the decision links to it.

**The list** `decisions/README.md` is a generated view: groups by status (`proposed`, `accepted`, `rejected`, `superseded`, with headings from the map of the brain), one line per decision (title with a link, description, date), sorted by ID. It is generated by a tool or by an agent following the algorithm from the specification ([spec/generated-views.md](../../spec/generated-views.md), [tooling-and-distribution.md](tooling-and-distribution.md)).

## Lifecycles

**Decision:**

| Status | Meaning |
| --- | --- |
| `proposed` | To be decided: question, context, options, who decides and when |
| `accepted` | Made |
| `rejected` | Rejected, with the rationale (it stays, so the matter is not reopened without new context) |
| `superseded` | Replaced by the decision in `superseded-by`; the new decision names the old one in its context |

A `proposed` decision is resolved by the person named in the "Who decides and when" section (by default the owner of the brain). What an agent may do with an open decision, and the one `accepted` → `proposed` transition it makes when merging branches, are set by the [agent contract](../../spec/agent-contract.md) (rules 4 and 10, [decision](../decisions/collaboration/2026-11-01-contradictory-decisions-until-resolved.md)). A decision made in a step goes to `decisions/` like any other, and the step links to it.

**Step:**

| Status | Meaning |
| --- | --- |
| `draft` | Spec in preparation, open questions block the start |
| `agreed` | Scope and criteria accepted, the work can start |
| `in-progress` | The work is going on, the "Log" grows |
| `done` | Acceptance criteria met and checked |

The status and `assignee` are in the frontmatter of the step; a person also sees them in the generated status line under the title of the step and next to the step in the index ([decision](../decisions/model/2026-11-03-step-status-in-body.md)).

The plan first, then the work: a person agrees the plan of a step before the work on it starts ([agent contract](../../spec/agent-contract.md), rule 6, [decision](../decisions/collaboration/2026-11-03-plan-before-work.md)); in git the step, its `agreed` and the work may go in one PR as consecutive commits.

A step has a fixed structure (required `goal`, `scope`, `acceptance`; optional `out-of-scope`, `decisions`, `stages`, `log`, `open-questions`). A step is one result that can be reviewed and agreed as a whole: a giant step is split into several steps, and a large one is divided into stages (`stages`), agreed together with the step and carried out one at a time ([agent contract](../../spec/agent-contract.md), rules 6 and 7, [decision](../decisions/collaboration/2026-11-03-step-stages.md)). Example steps: a walking skeleton, a production deployment, a domain module. Steps are numbered within the brain (`01`, `02`…) or named by the key of a ticket from the tracker in lowercase (`rp-111` for `RP-111`); both forms may be in one brain, the ID of a step is unique in the brain, and only a number gives the order of the plan. A brain that wants ticket keys only records it with a decision with `apply: always` ([decision](../decisions/model/2026-11-05-step-ids-from-tracker.md)).

## Work in git

The brain lies in a code repository, so git is part of the core, not an adapter ([decision](../decisions/model/2026-11-05-code-repository-only.md)):

- The history of a document is the history of its file in commits; review is a PR.
- Who reads the brain, proposes changes and approves them is set by the repository and its host (access to the repository, PRs, branch protection, the team's CODEOWNERS). The brain does not declare permissions.
- The main branch is the default branch of the repository; when branches are merged, the rules for conflicts (below) and steps apply.
- The commits of the work on a step (its start and its stages) follow the [agent contract](../../spec/agent-contract.md) (rules 6 and 7).

## Generated views and conflicts

Generated views (the decision list, the index block in `README.md`, the status line of a step, the managed blocks of instruction files and the rule files) are not a source of truth; they only assemble frontmatter ([decision](../decisions/model/2026-10-28-generated-index-and-registry.md)). Thanks to that, a conflict in a view when merging branches costs nothing: the view is generated again, and only conflicts in documents need judgement. How an agent resolves both, and how it detects two parallel decisions on the same matter (different IDs, the same matter), which cannot be caught mechanically, is set by the conflict rules of the [agent contract](../../spec/agent-contract.md) (rules 9–13, [decision](../decisions/collaboration/2026-11-01-contradictory-decisions-until-resolved.md)).

## Core conventions

Fixed:

- Markdown with YAML frontmatter, relative links.
- File and directory names in English, kebab-case; values in the frontmatter and section keys as English keys.
- One topic per file; a file over a few hundred lines is split.
- Every document is in the generated index block (decisions through the decision list).
- Dates in the `YYYY-MM-DD` format.

Configurable in the brain (in the manifest or in the index):

- The language of documents and the `sections` heading map ([languages.md](languages.md)).
- Area directories other than `architecture/` and the layout of `decisions/`, described in the index.

A sign that the brain is badly arranged is the agent's context: if an agent has to read half of the brain to do a typical task, the index and the split of documents are wrong.
