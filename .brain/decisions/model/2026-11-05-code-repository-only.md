---
status: accepted
decided: 2026-11-05
description: "dotbrain works only in a code repository: one brain in `.brain/`, without permissions in the manifest; git, the `architecture/` area, the agent contract and the review against the brain are part of the core, and the only starter template is setting up a brain in a repository."
---
# dotbrain only in a code repository

## Context

The framework is to be the simplest thing that works ([decision](2026-10-28-simplest-thing-that-works.md)), and what has been proven in practice is a brain in a code repository. Every layer above one repository inflates the specification, the tools and the conformance tests, and makes the framework harder to understand.

## Decision

dotbrain works only in a code repository. A repository has one brain, in the `.brain/` directory in its root directory.

The brain declares no permissions: who reads, proposes and approves changes is set by the repository and its host.

The `architecture/` area, the agent contract and the review against the brain are part of the core, and the only starter template is setting up a brain in a code repository.

Git is part of the core. Only delivering the contract to agents (instruction files) is an adapter.

## Consequences

- The manifest has the fields `brain`, `lang`, `spec`, `owner`, `description` and `sections`; tools do not know other fields and ignore them.
- The document templates and the procedure for setting up a brain lie together in `templates/`.
- Decisions concerning several repositories are deliberately outside the scope of the framework: every repository has its own brain and may link to others as to any source.
