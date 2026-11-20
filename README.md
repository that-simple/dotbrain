# dotbrain

An open framework for working with AI agents in a code repository.

Its core is the project's **brain**, a `.brain/` directory: the single source of truth for agents and people. Decisions are made in it before the work, knowledge about the project lives in it, and the work is planned in it as steps a person agrees. Agents and people work with it by one contract, and changes to the brain go through review together with the code.

> **Status:** dotbrain 1.0: the specification 1.0.0 (tag `spec-v1.0.0`) and the npm package `@that-simple/dotbrain@1.0.0`. Details in the [Status](#status) section.

## How it works

```text
.brain/
  README.md                 manifest (frontmatter) and index of documents
  decisions/
    README.md               decision list, generated
    process/2026-11-17-languages.md
  architecture/             knowledge areas (optional)
  steps/01-login.md         steps of the work (optional)
  roadmap.md, risks.md      (optional)
CLAUDE.md                   instruction files with a generated block:
AGENTS.md                   the agent contract and the rules of the brain
.github/copilot-instructions.md
```

- **Decisions as ADRs.** Every decision is a separate file with a status (`proposed`, `accepted`, `rejected`, `superseded`), context, options and consequences. Rejected and superseded decisions stay in the brain.
- **Steps.** Work starts with a step in `steps/` with a goal, scope and acceptance criteria. The work begins only when a person agrees the step.
- **The agent contract.** The brain binds: when the work contradicts the documents, the agent reports it, and a change that departs from the brain updates it. A decision is made in the brain before the work, and open decisions are resolved by a person.
- **Generated views.** The decision list, the index and the blocks in instruction files are built from the frontmatter of documents. Thanks to that, parallel branches rarely get in each other's way, and a conflict is resolved by generating again.
- **Plain files, views kept by the CLI or an agent.** A brain is plain files, readable on GitHub and in any editor. The `dotbrain` CLI keeps the generated views and instruction files and checks the brain; without it, an agent keeps them following the specification. No feature requires the CLI.
- **In any language.** A brain has its own language, and the structure is recognizable regardless of it.

The full description is in the [specification](spec/README.md).

## How a person works with a brain

dotbrain is run through an agent with a person in the loop ([decision](.brain/decisions/model/2026-11-17-agent-with-a-person-in-the-loop.md)). A person reads and agrees steps, and looks at a step again when it is carried out; reads the content of decisions; and possibly the risks. For anything else, the person asks the agent about the project: the agent answers from the brain, links the documents the answer rests on, and says when the brain does not cover the question.

## When it is worth it

dotbrain pays off in projects that live longer than a few weeks, have several people and work a lot with AI agents. The agent then knows the decisions and does not reinvent them, the documentation does not die, because it goes through review together with the code, and for every decision it is known why it was made and who made it.

Costs:

- **Process overhead.** For small changes, a decision and a step can be heavier than the change itself.
- **The contract is instructions, not a mechanism.** An agent may skip it. Protection against that comes from PR review, `lint` in CI or in a hook, and the review against the brain.
- **Only for work in git.** People without git work on the brain through someone else or through AI tools.

For a weekend prototype or a one-off script, dotbrain is usually too much. The other risks are described in [`.brain/risks.md`](.brain/risks.md).

## Quick start

A brain is set up in one of two ways:

- **Without the CLI:** an agent follows the procedure in [`templates/README.md`](templates/README.md).
- **With the `init` wizard:** requires Node 24 or newer. It runs from the npm package:

  ```sh
  npx --yes @that-simple/dotbrain init path/to/your-repo
  ```

  `init` asks questions in turn: the name of the brain, the language, the owner, a description of the project, the languages of the work, the order of work and whether steps are named by the keys of tickets. Then it builds the skeleton of the brain and leaves a `DOTBRAIN-SETUP.md` file with an instruction for the agent. The agent finishes the setup according to it (translation, code scan, architecture draft) and deletes this file.

## Tools

The `dotbrain` CLI comes in the npm package `@that-simple/dotbrain` and requires Node 24 or newer; it has no runtime dependencies. Its source is in [`tools/`](tools/).

```sh
npx --yes @that-simple/dotbrain init [<repo>]            # wizard of the skeleton of a brain; overwrites nothing
npx --yes @that-simple/dotbrain lint [<repo>]            # validity rules; exit code 1 on an error
npx --yes @that-simple/dotbrain index [<repo>]           # generates the views: the decision list, the index, the status lines of steps, the managed blocks, the rule files
npx --yes @that-simple/dotbrain index [<repo>] --check   # only reports stale views
```

`init` also takes the answers without questions, in options or in a JSON file. The `--yes` option takes the default values for questions without an answer:

```sh
npx --yes @that-simple/dotbrain init ../my-repo --answers answers.json
npx --yes @that-simple/dotbrain init ../my-repo --lang=en --description="One sentence about the project." --step-ids=yes --yes
```

Answer keys:

- `name`, `lang`, `owner`, `description`, `languages`;
- `order`: `with-the-work` or `before-the-work`;
- `step-ids`: `no` or `yes`;
- `date`: the date of the first decisions, today by default.

## Contents of the repository

| Directory | What it contains |
| --- | --- |
| [`spec/`](spec/README.md) | The specification (normative) and the [conformance suite](spec/conformance/README.md) for every implementation |
| [`templates/`](templates/README.md) | The starter template and the document templates |
| [`tools/`](tools/) | The `dotbrain` CLI, its tests and the script that builds the conformance cases |
| [`.brain/`](.brain/README.md) | The brain of this project: decisions, architecture, roadmap and steps. dotbrain is run according to dotbrain, so it is also an example of use |

## Contributing

A change starts in the brain. A decision goes to `.brain/decisions/`, and larger work to a step in `.brain/steps/`. Changes to the brain go in the same PR as the work that follows from them. Agents get the rules from the managed block in [`CLAUDE.md`](CLAUDE.md), and the rules of work on the brain from [`.claude/rules/dotbrain.md`](.claude/rules/dotbrain.md).

The repository's checks cover the format and the lint rules of [Biome](https://biomejs.dev) on the code of the tools (`npm run format` formats it), types, `lint` and `index --check` on this brain, the freshness of the conformance cases and the tests, including the test of the npm package:

```sh
npm install      # once: Biome and TypeScript for the checks
npm run check
```

In this repository the tools run from the `.ts` files, without building: `node tools/dotbrain.ts <subcommand>`, or `npm run lint` and `npm run index`. The npm package `@that-simple/dotbrain` is built only when it is packed: `npm pack` compiles `tools/dotbrain.ts` and `tools/src/` to `dist/` with [`tsconfig.build.json`](tsconfig.build.json) (`dist/` is not in git) and writes a tarball with `dist/`, `templates/`, `spec/`, `LICENSE`, `README.md` and `package.json`:

```sh
npm pack         # builds dist/ and writes that-simple-dotbrain-1.0.0.tgz
```

The test of the package ([`tools/test/package.test.ts`](tools/test/package.test.ts)) packs it, installs it from the tarball into a temporary directory and checks that `init`, `lint` and `index` from it work the same as from this repository.

In Claude Code the checks are run by the `Stop` hook from [`.claude/settings.json`](.claude/settings.json). A brain set up with the starter template gets its own `Stop` hook ([`templates/claude-settings.json`](templates/claude-settings.json)), which runs `npx --yes @that-simple/dotbrain@1.0.0 lint` when the brain has changed; `1.0.0` is the version of the package to write into it when the brain is set up without `init`. The [`brain-review`](.claude/agents/brain-review.md) subagent reviews a change against the brain before a step is closed, before a branch is merged into `main` and before a commit directly to `main`.

The conformance cases are built by [`tools/conformance/build-cases.ts`](tools/conformance/build-cases.ts). After changing a case, or a change of the specification that changes the views, the suite is built again (`npm run build-cases`) and the differences are reviewed. The suite itself does not depend on the script: every implementation is checked against the files in `spec/conformance/`.

## Status

dotbrain 1.0 is the MVP ([roadmap](.brain/roadmap.md)): the core specification, the agent contract with adapters, the rules for parallel work, the starter template, `init`, `lint` and `index`, and `dotbrain lint` run by the agent. The specification 1.0.0 is at the tag `spec-v1.0.0` of this repository, and the tools in the npm package `@that-simple/dotbrain@1.0.0`. This repository is not a template: it documents the framework, and a brain is set up with the starter procedure or `init` ([decision](.brain/decisions/tooling/2026-11-17-no-repository-template.md)).

The Simplicity gate has passed: a pilot in a project outside dotbrain keeps a brain in Polish, a language other than this brain, which is in English. So far the framework has been checked live only with Claude Code.

## License

MIT, for the whole repository including the specification and the templates ([decision](.brain/decisions/tooling/2026-10-28-license.md)). The text of the license is in [`LICENSE`](LICENSE).
