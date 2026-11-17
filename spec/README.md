# dotbrain specification 1.0.0

This is the normative specification of dotbrain, a framework for keeping a **brain** in a code repository: a directory of markdown documents in which decisions are made, knowledge about the project lives and work is planned before it is done. People and AI agents work with the brain and the code under one agent contract.

The key words MUST, MUST NOT, SHOULD, SHOULD NOT and MAY are to be interpreted as described in RFC 2119.

A brain written to this specification is readable and editable without any tool. Generated views and instruction files are kept by a tool such as the `dotbrain` CLI; everything it does (generating views, checking validity, composing instruction files) is described here precisely enough for an agent to do it without the tool. Keeping generated views by hand is not a supported way of working; people read and write documents.

## Contents

The **core** describes the brain of a repository, its documents, generated views, work in git, the agent contract and the review against the brain. The **agents adapter** describes how the contract and the rules of the brain are delivered to AI agents.

| File | Topic |
| --- | --- |
| [brain.md](brain.md) | Concepts, the brain of a repository, the manifest, areas, what the brain does not keep, work in git |
| [documents.md](documents.md) | Document frontmatter, the effective rule set, document kinds, section keys and the section map, decisions (ADR), lifecycles, steps, conventions |
| [generated-views.md](generated-views.md) | Algorithms for the decision list, the index block and the status line of a step; conflicts in generated views |
| [agent-contract.md](agent-contract.md) | The agent contract: rules every agent follows when working with the brain and the code |
| [review.md](review.md) | The review of a change against the brain |
| [validity.md](validity.md) | The minimal valid brain and the validity rules that `lint` checks |
| [adapters/agents.md](adapters/agents.md) | Delivering the contract and the rules to agents: instruction files, the managed block and its compact form, the budget for `apply: always` |
| [conformance/](conformance/README.md) | The conformance suite: sample repositories with their expected views and violations, for checking any implementation |

Templates of documents and the starter that sets up a brain in a repository are in [templates/](../templates/README.md).

## Language

The specification, the agent contract and the templates are written in English, in a single version. A brain in any other language uses them as they are: its documents are written in its own language, and its manifest maps section keys to headings in that language ([documents.md](documents.md#section-keys-and-the-section-map)). Nothing in this specification assumes the language of a brain.

## Versioning

- The specification has a version `MAJOR.MINOR.PATCH`. This document is version `1.0.0`, the first published version.
- The version changes only with the text of the specification. The `dotbrain` package has its own version and says which version of the specification it implements: it carries the specification in that version. A release of the package that only fixes the tools leaves the version of the specification, so brains do not change `spec`.
- A brain declares the version it follows in the `spec` field of its manifest ([brain.md](brain.md#manifest)). A brain without `spec` is a **beta** brain: it predates the specification and follows no version of it.
- The managed block of an instruction file carries the same version in its start marker ([adapters/agents.md](adapters/agents.md#managed-block)).
- Tools and agents choose validity rules and migration paths by version. Every version after `1.0.0` describes how to migrate brains from the previous version. There is no migration path from beta brains.
- In the dotbrain repository, each released version is marked by the git tag `spec-v<version>` (for `1.0.0`: `spec-v1.0.0`).

### Migrating from 0.1

Version `0.1` was the draft of this specification before its publication; a brain with `spec: 0.1` is not valid under `1.0.0`. To migrate it:

1. Set `spec: 1.0.0` in the manifest.
2. Generate the views again ([generated-views.md](generated-views.md), [adapters/agents.md](adapters/agents.md)). This rewrites the start markers of the managed blocks and the link to the specification, and creates the rule files of the brain if the brain has none yet.

### Linking to an exact version

Instruction files link to the specification in the exact version the brain follows, so that an agent can look up rare cases (such as migration) without guessing which rules apply. The link has the form:

```
https://github.com/that-simple/dotbrain/blob/spec-v<version>/spec/README.md
```

`https://github.com/that-simple/dotbrain` is the published dotbrain repository, and `spec-v<version>` the tag of the released version of the specification. Inside the dotbrain repository itself, the link is the relative path to `spec/README.md`.

Agents MUST be able to work correctly without following this link: the managed block, together with the rule file of the brain read when the agent works in the brain directory, contains everything needed for everyday work ([adapters/agents.md](adapters/agents.md#compact-form)).
