# The brain of a repository

## Concepts

- **Repository:** a git repository with the code of a product, a system or a library. Paths and globs that are relative to "the repository root" are relative to its root.
- **Brain:** the directory `.brain/` at the repository root: the source of truth for the product, architecture, infrastructure and code of the repository. Work is spec-driven: a decision is made in the brain, then carried into the code. A repository has at most one brain.
- **Manifest:** the YAML frontmatter of `.brain/README.md`. It declares the brain's name, language and the other fields below.
- **Document:** a markdown file in the brain with YAML frontmatter ([documents.md](documents.md)). One topic per file. The brain holds only documents and instruction files. Raw material (recordings, transcripts, emails, PDFs, contracts, images) stays at its source; the brain holds what follows from it (decisions, knowledge, open questions) with a link to the source ([V-CONTENT](validity.md#rules)).
- **Owner:** the person or role responsible for the brain, who resolves open decisions unless a decision names someone else.
- **Generated view:** a file or a delimited block assembled from the frontmatter of other documents. It is never the source of truth and is never edited by hand ([generated-views.md](generated-views.md)).
- **Adapter:** a description of how the contract and the rules of the brain reach AI agents (instruction files: `CLAUDE.md`, `AGENTS.md` and others). Files an adapter adds are not documents of the brain ([adapters/agents.md](adapters/agents.md)).

The brain is `.brain/` at the repository root whenever `.brain/README.md` exists. A `README.md` elsewhere is never a brain, whatever its frontmatter. Tools SHOULD skip `.git/` and the files ignored by git when they read the repository.

## Manifest

The manifest is the frontmatter of `.brain/README.md`. Values are English keys regardless of the brain's language.

```yaml
---
brain: billing
lang: en
spec: 1.0.0
owner: jane.doe
description: "One sentence about what the brain covers."
sections:
  goal: Goal
---
```

| Field | Required | Value |
| --- | --- | --- |
| `brain` | MUST | Name of the brain, usually the name of the repository. Lowercase kebab-case (`[a-z0-9]` and `-`). Used in the names of generated rule files ([adapters/agents.md](adapters/agents.md#tools)). |
| `lang` | MUST | Language of the brain's documents, as a BCP 47 tag (e.g. `en`, `pl`, `pt-BR`). One language per brain. |
| `spec` | MUST | Version of this specification the brain follows (`1.0.0`). A brain without `spec` is a beta brain and is not valid under this version. Tools MUST compare the value as the text `MAJOR.MINOR.PATCH`, not as a number. A brain with `spec: 0.1` follows the draft before publication and is migrated as described in [README.md](README.md#migrating-from-01). |
| `owner` | SHOULD | Person or role responsible for the brain. Free text. |
| `description` | MUST | One sentence, in the brain's language, about what the brain covers. |
| `sections` | MAY | Map from section keys to headings in the brain's language ([documents.md](documents.md#section-keys-and-the-section-map)). |

Unknown fields are allowed. Tools MUST ignore fields they do not know.

## Areas

Areas of knowledge are documents grouped in area directories ([documents.md](documents.md#document-kinds)):

| Directory | Content |
| --- | --- |
| `architecture/` | One technical or product area per file (e.g. overview, domains, backend, frontend, infrastructure, security). Each area explains decisions with their reasoning and links to the decisions in `decisions/`. |

The brain MAY add other area directories; it names them in its index.

## What the brain does not keep

- Run instructions and commands: they belong to the repository's `README.md` or the hand-written part of instruction files.
- Personal notes and personal data.
- Raw material (transcripts, emails, PDFs, contracts, images): it stays at its source, and the brain links to it.

## Work in git

- The history of a document is the history of its file in commits. A change to the brain is reviewed in a pull request (or the host's equivalent), like a change to the code.
- Who may read the brain, propose changes to it and approve them is decided by the repository and its host (access to the repository, pull requests, branch protection, CODEOWNERS). The brain declares no permissions.
- The main branch is the default branch of the repository. Merging branches is where the [conflict rules](generated-views.md#conflicts) and the rules for [steps](documents.md#steps) apply.
- `status: in-progress` and `assignee` of a step go into the first commit of the work on the step. On the same branch, the commits that add the step and set it to `agreed` MAY come before it ([plan before work](documents.md#steps)).
- Every finished stage of a step ([size and stages](documents.md#steps)) is a separate commit, which includes its entry in the step's log.
