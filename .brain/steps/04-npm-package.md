---
status: done
assignee: [user:dkowcun]
description: "The npm package `@that-simple/dotbrain` ready for publication, with the specification at version 1.0.0 like the package: from the tarball, `init`, `lint` and `index` work in another repository the same as from a clone of dotbrain."
---
# Step 4: npm package

<!-- BEGIN:dotbrain status -->
Status: `done` · Assignee: user:dkowcun
<!-- END:dotbrain status -->

The first step towards publishing the framework ([roadmap.md](../roadmap.md)). The channel and the name of the package are set by the [decision on distribution channels](../decisions/tooling/2026-10-28-distribution-channels.md), which announces this step. It builds on the ready `lint`, `index` and `init` ([step 3](03-init.md), [tooling-and-distribution.md](../architecture/tooling-and-distribution.md)).

## Goal

The `@that-simple/dotbrain` package with the `dotbrain` command is ready for publication: `npm pack` gives a tarball from which `init`, `lint` and `index` work in a repository outside dotbrain the same as today from a clone, offline, on Node 24 or newer, without runtime dependencies. The specification has the version of the package, `1.0.0`, in full semver (instruction of the owner, 2026-11-17). Thanks to that, the publication step only releases a checked package, and a project outside dotbrain sets up a brain without cloning the framework's repository. In this repository the tools still work directly from the `.ts` files, without building ([decision](../decisions/tooling/2026-10-28-tooling-technology.md)).

## Scope

- **The specification at version 1.0.0.** The first published version of the specification is `1.0.0`, the version of the package; the version of the specification in `spec/README.md` becomes `MAJOR.MINOR.PATCH`. Later the versions may part: a release of the package that only fixes the tools (e.g. `1.0.1`) does not change the version of the specification, so brains do not change `spec`; the version of the specification changes only with its text, and the package says which version of the specification it implements. Version `0.1` was a draft before the publication, but existing brains use it (this one and the pilot), so the specification describes the migration from `0.1`: set `spec: 1.0.0` and generate the views again, which rewrites the markers of the blocks and creates the rule files of the brain. The change covers:
  - the specification: `spec/README.md` (title, versioning, migration), `spec/brain.md` (the `spec` field, compared as the text `MAJOR.MINOR.PATCH`), `spec/validity.md` (`V-MANIFEST`: `spec` is `1.0.0`; the example), `spec/adapters/README.md`, `spec/adapters/agents.md` and `spec/generated-views.md` ("in version 0.1"), `spec/conformance/README.md`;
  - the tools: the check of `spec` in `tools/src/lint.ts`, the manifests and the `error-manifest` case in `tools/conformance/build-cases.ts` with the rebuilt cases, `tools/test/templates.test.ts`;
  - the templates: `templates/index.md`, `templates/managed-block.md`, `templates/brain-rules.md`;
  - this brain: its manifest, the regenerated `CLAUDE.md` and `.claude/rules/`, [core-model.md](../architecture/core-model.md) and the status in `README.md`; decisions and done steps stay as history;
  - a decision in `decisions/model/` on the version of the specification in semver, the first published version `1.0.0` and the migration from `0.1`, written in the work on the step as `accepted`, because it carries out an explicit instruction of the owner; if in the work it were to bring anything beyond this scope, it is written as `proposed`. It complements the [decision on the version in the manifest](../decisions/model/2026-10-28-spec-version-without-beta-migration.md): the `spec` field, the marker and no migration from the beta version stay.
- **A build to JavaScript** only for the package: a separate TypeScript configuration emitting to `dist/`, with `tools/` as the source directory and rewriting of `.ts` extensions in imports, covering `tools/dotbrain.ts` and `tools/src/` (without the tests and the conformance cases script). With this layout, the paths to `templates/` and `spec/`, which the tools compute relative to their file, point to the root directory of the package, so the code of the tools stays unchanged. The build runs when packing, and `dist/` does not go into git.
- **`package.json`:** the name `@that-simple/dotbrain`, version `1.0.0` ([decision](../decisions/repository/2026-11-17-mvp-is-1-0.md)), without `private`, the MIT license, `bin` with the `dotbrain` command pointing to the built file, `files` with `dist/`, `templates/` and `spec/`, `repository` pointing to `github.com/that-simple/dotbrain`, public access when publishing the scoped package, `engines` unchanged.
- **`LICENSE`** with the MIT license in the root directory ([decision](../decisions/tooling/2026-10-28-license.md)).
- **A test of the package** in `tools/test/`: packing, installing from the tarball into a temporary directory, `init` with an answers file in an empty repository and in a repository with code, then `lint` and `index --check`, and a check of the content of the tarball. The test becomes part of the repository's checks.
- **Documentation:** in the repository's `README.md`, how to build and check the package; in [tooling-and-distribution.md](../architecture/tooling-and-distribution.md), the build and the content of the package.

## Out of scope

- Publishing on npm, the `that-simple/dotbrain` repository on GitHub, replacing the placeholder of the repository URL in the link to the specification and the `spec-v1.0.0` tag: the placeholder stays until the repository is published ([spec/README.md](../../spec/README.md)). A separate step.
- The README in English: it came with [step 5](05-brain-in-english.md) before this step ([decision on the language of documents at publication](../decisions/repository/2026-10-28-dotbrain-docs-language-at-publication.md)), so the tarball carries the `README.md` in English. The instructions for installing from npm go to the publication step.
- A hook in the starter template that runs `lint` from the package ([decision on the review](../decisions/agents/2026-11-03-brain-review-procedure.md)): [step 6](06-lint-hook.md).
- The repository template on GitHub, and plugins and skills ([decision on channels](../decisions/tooling/2026-10-28-distribution-channels.md)).

## Decisions

- [Distribution channels](../decisions/tooling/2026-10-28-distribution-channels.md): the repository template and the npm package `@that-simple/dotbrain`, without a binary.
- [License](../decisions/tooling/2026-10-28-license.md): MIT for the whole repository.
- [Technology of the tools](../decisions/tooling/2026-10-28-tooling-technology.md): TypeScript on Node.js, the build step comes back at publication.
- [The CLI keeps the generated views](../decisions/tooling/2026-11-17-cli-keeps-generated-views.md): the CLI is the recommended way to keep a brain, so the package is the main way the framework reaches a project.
- [The specification version in the manifest](../decisions/model/2026-10-28-spec-version-without-beta-migration.md): complemented by the [decision on version 1.0.0](../decisions/model/2026-11-17-spec-version-in-semver.md), made in this step.
- Architecture: [tooling-and-distribution.md](../architecture/tooling-and-distribution.md).

## Acceptance criteria

1. The tarball from `npm pack` contains only `dist/`, `templates/`, `spec/`, `LICENSE`, `README.md` and `package.json`; it has no tests of the tools (`tools/test/`), no `.brain/` and no `.ts` files. The conformance suite in `spec/conformance/` is part of the specification and goes into the package.
2. From the package installed from the tarball, `dotbrain init` with the same answers gives, in an empty repository and in a repository with code, a result identical to the character with `node tools/dotbrain.ts init`, and `dotbrain lint` and `dotbrain index --check` on the result pass. It works offline, on Node 24 or newer, without runtime dependencies.
3. In this repository the tools work from the `.ts` files without building, and the repository's checks pass and include the test of the package.
4. `package.json` has the name, version, license, command, `files`, `repository` and public access as in the scope, and the root directory has a `LICENSE` with MIT.
5. The specification, the templates, `lint`, the conformance cases and this brain have version `1.0.0`; `lint` reports `spec: 0.1` as `V-MANIFEST`; `spec/README.md` describes the migration from `0.1`; the decision on the version is in `decisions/model/` and the decision list is regenerated.

## Stages

1. The specification at version 1.0.0 and the migration of this brain (criterion 5).
2. The package: the build, `package.json`, `LICENSE`, the test of the package and the documentation (criteria 1–4).

## Log

- 2026-11-17: Work started.
- 2026-11-17: Stage 1 done. The specification, the templates, `lint` (an exported `SPEC_VERSION`), the conformance cases and this brain have version `1.0.0`; `spec/README.md` describes the migration from `0.1`; the `error-manifest` case now has `spec: 0.1`, so the suite checks that `lint` reports it as `V-MANIFEST`. The [decision on the version](../decisions/model/2026-11-17-spec-version-in-semver.md) is `accepted` (instruction of the owner). Checked with `npm run check` (types, `lint`, `index --check`, `build-cases --check`, tests).
- 2026-11-17: Stage 2 done. `tsconfig.build.json` compiles `tools/dotbrain.ts` and `tools/src/` to `dist/` when packing (`prepack`), with the options of `tsconfig.json` and `rewriteRelativeImportExtensions`; `dist/` is in `.gitignore`. `package.json` and `LICENSE` (MIT, copyright holder That Simple, instruction of the owner) as in the scope. The test of the package (`tools/test/package.test.ts`) packs it, checks the content of the tarball, installs it offline into a temporary directory and compares `init` from the package with `init` from this repository in an empty repository and in a repository with code, then runs `lint` and `index --check` from the package; the helpers for temporary repositories moved from `tools/test/init.test.ts` to `tools/test/helpers.ts`. Outside the scope, on the instruction of the owner: step 7, already `done`, removed from "Until 1.0" in `README.md`. Checked with `npm run check` (38 tests, including the 4 of the package) on Node 24.21.0 and npm 11.19.0, and by listing the tarball.
- 2026-11-17: Done. The review against the brain before `done` found no contradiction with the decisions and no unmet acceptance criterion; the change in `roadmap.md` it pointed to comes from a commit before this step was agreed, and the wording "the format may still change" in the Status of `README.md` stays until the publication. Checked: `npm run check`.

## Open questions

None. The version of the specification with the `1.0.0` package is `1.0.0` too, in full semver (instruction of the owner, 2026-11-17).
