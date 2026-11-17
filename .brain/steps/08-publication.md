---
status: done
assignee: [user:dkowcun]
description: "dotbrain 1.0 is public: the `that-simple/dotbrain` repository on GitHub with a squashed history and the tag `spec-v1.0.0`, and the package `@that-simple/dotbrain@1.0.0` on npm, with managed blocks linking to the published specification."
---
# Step 8: publication

<!-- BEGIN:dotbrain status -->
Status: `done` · Assignee: user:dkowcun
<!-- END:dotbrain status -->

The last step before 1.0 ([roadmap.md](../roadmap.md)). It publishes what [step 4](04-npm-package.md) made ready and [step 6](06-lint-hook.md) completed; step 4 left the publication, the repository, the placeholder of the repository URL and the tag `spec-v1.0.0` to this step.

## Goal

Anyone can take dotbrain 1.0 without cloning anything private: the repository `that-simple/dotbrain` on GitHub documents the framework and holds the specification at the tag `spec-v1.0.0`, and `npx --yes @that-simple/dotbrain@1.0.0 init` sets up a brain in another repository. The managed blocks a brain gets link to the specification in its exact published version, so an agent can follow the link ([spec/README.md](../../spec/README.md)).

## Scope

- **The link to the specification.** The placeholder of the repository URL becomes `https://github.com/that-simple/dotbrain` in `tools/src/views.ts` (the link of the managed block), `templates/managed-block.md`, the starter procedure in `templates/README.md`, "Linking to an exact version" in `spec/README.md` and the tests; the conformance cases are built again and the views regenerated. Inside the dotbrain repository the link stays relative.
- **No repository template.** The repository is published without the template flag ([decision](../decisions/tooling/2026-11-17-no-repository-template.md)); the documents that describe the channels ([tooling-and-distribution.md](../architecture/tooling-and-distribution.md), `.brain/README.md`, `README.md`) say the same.
- **`README.md`:** the status after the publication, the installation with `npx`, and no list "Until 1.0".
- **The brain:** [roadmap.md](../roadmap.md) and [tooling-and-distribution.md](../architecture/tooling-and-distribution.md) describe the published state.
- **The history.** Before the first push, the history of this repository is squashed into one commit, `dotbrain 1.0.0`, and the local branches of the steps are deleted. This is a one-off before the publication, not a rule of work.
- **The publication**, each action on an explicit instruction of the owner, because it is outside the repository:
  - the remote `origin` is set to `git@github.com:that-simple/dotbrain.git` (the empty public repository is created by the owner), and `main` is pushed;
  - the tag `spec-v1.0.0` is set on the squashed commit and pushed;
  - the agent checks the package (`npm run check`, `npm pack --dry-run`), and the owner runs `npm publish` by hand, with their npm account;
  - from the registry, `npx --yes @that-simple/dotbrain@1.0.0 init` in an empty repository writes a valid skeleton, and the link to the specification in its `CLAUDE.md` opens.
- After the publication, the step is set to `done` in a commit on top of the squashed history.

## Out of scope

- Publishing from CI (GitHub Actions, provenance, trusted publishing).
- A repository template ([decision](../decisions/tooling/2026-11-17-no-repository-template.md)).
- Plugins and skills ([decision](../decisions/repository/2026-11-17-mvp-is-1-0.md)).
- Rules of later releases and versions.

## Decisions

- [No repository template on GitHub](../decisions/tooling/2026-11-17-no-repository-template.md), which supersedes the [decision on distribution channels](../decisions/tooling/2026-10-28-distribution-channels.md).
- [The specification version in semver](../decisions/model/2026-11-17-spec-version-in-semver.md): the tag `spec-v1.0.0` marks the released version.
- [The MVP is version 1.0](../decisions/repository/2026-11-17-mvp-is-1-0.md).
- [License](../decisions/tooling/2026-10-28-license.md).
- [Optional tools](../decisions/tooling/2026-10-28-tools-optional.md): a start without the CLI stays possible.

## Acceptance criteria

1. Neither the repository nor the package contains the placeholder of the repository URL; a managed block generated outside dotbrain links to `https://github.com/that-simple/dotbrain/blob/spec-v1.0.0/spec/README.md`.
2. The documents describing the channels agree with the decision without a repository template.
3. `main` of `that-simple/dotbrain` on GitHub is the squashed history, with the tag `spec-v1.0.0` on its commit.
4. `@that-simple/dotbrain@1.0.0` is on npm; with it, `init`, `lint` and `index --check` pass in an empty repository.
5. The repository's checks pass.

## Stages

1. **Ready for publication:** the link to the specification, `README.md` and the brain (criteria 1, 2 and 5).
2. **Publication:** the squash, the remote, the push, the tag, `npm publish` and the check from the registry (criteria 3 and 4).

## Log

- 2026-11-17: Work started.
- 2026-11-17: Stage 1, ready for publication. The link to the specification is `https://github.com/that-simple/dotbrain/blob/spec-v<version>/spec/README.md` in `tools/src/views.ts`, `templates/managed-block.md`, the starter procedure, `spec/README.md` and the tests; the conformance cases are built again. The documents describing the channels follow the [decision without a repository template](../decisions/tooling/2026-11-17-no-repository-template.md) ([tooling-and-distribution.md](../architecture/tooling-and-distribution.md), [roadmap.md](../roadmap.md), `README.md`), and `README.md` installs with `npx`, without the list "Until 1.0". On the instruction of the owner, outside the scope as written: dotbrain is described as an open framework for working with AI agents in a code repository, with the brain as the single source of truth for agents and people, in `README.md`, [overview.md](../architecture/overview.md) and the `description` of `package.json`; and the mentions of the placeholder in the text of [step 4](04-npm-package.md) and of this step are reworded, so that the repository does not contain it. Checked with `npm run check` (types, `lint`, `index --check`, freshness of the cases, 48 tests), a search of the repository for the placeholder (none), and the tarball from `npm pack`: no placeholder in it, and `init` from the installed tarball writes `CLAUDE.md` and `AGENTS.md` linking to the specification at `spec-v1.0.0`, with `lint` and `index --check` passing.
- 2026-11-17: Review against the brain before the merge into `main` (`brain-review` subagent): no contradiction with the decisions. `README.md` describes the publication already in the commit that is published. The done steps 3, 4 and 6 still link the superseded [decision on distribution channels](../decisions/tooling/2026-10-28-distribution-channels.md) as what they were built on; they are left as the record of their time, and the owner was told.
- 2026-11-17: Stage 2, publication. `main` was fast-forwarded to the branch of the step, the history squashed into one commit `dotbrain 1.0.0`, and all other local branches deleted, without a backup (instruction of the owner). The annotated tag `spec-v1.0.0` is on that commit. On the instruction of the owner, the remote `origin` is `git@github.com:that-simple/dotbrain.git`, empty before the push (`git ls-remote`), and `main` and the tag are pushed; `git ls-remote origin` shows both on the squashed commit, and the link to the specification at `spec-v1.0.0` on GitHub returns 200. Before the publication `npm run check` passed (48 tests) and `npm pack --dry-run` showed `@that-simple/dotbrain@1.0.0` with 61 files. The owner ran `npm publish`; npm first showed a placeholder version `0.0.0-stage` while the release was staged, then `1.0.0` as `latest`. From the registry, with an empty npm cache, in an empty git repository: `npx --yes @that-simple/dotbrain@1.0.0 init` writes the skeleton, `lint` and `index --check` pass, `CLAUDE.md` links to the specification at `spec-v1.0.0` (200), and `.claude/settings.json` runs `lint` from the package `1.0.0`. Before this commit on `main`, the review against the brain (`brain-review` subagent) found no contradiction, and `npm run check` passes on the final tree (48 tests). The stage and the status `done` share this commit, because the squash leaves no commit of the stage on top of which to close the step. Step done.

## Open questions

None. The shape of the squash (one commit `dotbrain 1.0.0`, the step branches deleted) and the address of the remote (`git@github.com:that-simple/dotbrain.git`) are confirmed by the owner, who also accepted the decision without a repository template (2026-11-17).
