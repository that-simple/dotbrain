# Validity

A brain is valid under version `1.0.0` when it satisfies every rule below marked as an error. Warnings point to things to fix but do not make a brain invalid. `lint` checks these rules; without the tool, an agent checks them, going through the list.

## Minimal valid brain

```
.brain/
  README.md             # manifest, H1 title, description, index block
  decisions/
    README.md           # generated decision list (may list no decisions)
```

```markdown
---
brain: example
lang: en
spec: 1.0.0
description: "One sentence about what the brain covers."
---
# Example

What this brain is about.

<!-- BEGIN:dotbrain index -->
<!-- Generated from document frontmatter. Do not edit by hand; regenerate on conflict. -->

`decisions/`:

- [decisions/README.md](decisions/README.md): Decisions: Proposed, Accepted, Rejected, Superseded
<!-- END:dotbrain index -->
```

```markdown
---
description: "Decisions: Proposed, Accepted, Rejected, Superseded"
---
# Decisions

<!-- Generated from decision frontmatter. Do not edit by hand; regenerate on conflict. -->
```

## Rules

| ID | Severity | Rule |
| --- | --- | --- |
| V-MANIFEST | error | `.brain/README.md` has a manifest with `brain`, `lang`, `spec` and `description` ([brain.md](brain.md#manifest)). `brain` is lowercase kebab-case. `lang` is a BCP 47 tag. `spec` is `1.0.0`. |
| V-FRONTMATTER | error | Every document has frontmatter with a non-empty one-sentence `description`. |
| V-TITLE | error | Every document has exactly one H1 heading, and it is the first heading after the frontmatter. |
| V-NAMES | error | File and directory names in the brain are lowercase kebab-case (`[a-z0-9-]`, with the extension `.md` for documents), except `README.md` and instruction files ([adapters/agents.md](adapters/agents.md#tools)). |
| V-DECISION | error | Every document in `decisions/` and its subdirectories, other than `decisions/README.md`, is named `YYYY-MM-DD-slug.md` with a valid date, has an ID unique in the brain, has `status` (`proposed`, `accepted`, `rejected`, `superseded`), has `decided` with a valid date unless `proposed`, and has `superseded-by` naming an existing decision exactly when `superseded`. |
| V-STEP | error | Every document in `steps/` is named `NN-slug.md` (at least two digits) or `<ticket-key>-slug.md` (a ticket key in lowercase, such as `rp-111`), with an ID unique in the brain ([documents.md](documents.md#steps)), and has `status` (`draft`, `agreed`, `in-progress`, `done`). Every entry of its `log` section is a list item starting with a date (`- YYYY-MM-DD: …`). |
| V-SECTIONS | error | Decisions and steps have the sections required for their kind and status, each exactly once, recognized through the `sections` map ([documents.md](documents.md#required-sections)). |
| V-APPLY | error | `apply`, when present, is `always`, a glob, or a non-empty list of globs. |
| V-VIEWS | error | Every generated view present in the repository (decision list, index block, status lines of steps, managed blocks of instruction files, rule files of the brain and files for rules with a glob) is identical to the result of generating it again ([generated-views.md](generated-views.md), [adapters/agents.md](adapters/agents.md)). The decision list, the index block and the status line of every step MUST be present. A view is not compared while a document it is built from breaks V-FRONTMATTER, V-TITLE, V-DECISION, V-STEP, V-SECTIONS or V-APPLY, or the manifest breaks V-MANIFEST; the violation of that rule is reported instead. |
| V-CONTENT | warning | Every file in the brain directory is a `.md` document or an instruction file; other files (images, PDFs, recordings, archives) are reported ([brain.md](brain.md#concepts)). |
| V-LINKS | error | Every relative link in a document points to an existing file or directory. |

The agents adapter adds [V-BUDGET](adapters/agents.md#validity-rules), which applies when the repository has instruction files.

The [conformance suite](conformance/README.md) gives, for sample repositories, the exact violations these rules report.

Rules that need judgment rather than a check, such as one language per brain, one topic per file, or decisions that duplicate each other, belong to the [review against the brain](review.md) and the periodic review of the brain, with an agent's help.
