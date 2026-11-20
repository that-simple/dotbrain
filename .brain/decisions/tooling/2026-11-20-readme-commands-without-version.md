---
status: proposed
description: "The `npx` commands in `README.md` run the latest version of the package, without a version; the `Stop` hook keeps the exact version, which `README.md` names for a setup without `init`."
---
# `README.md` commands without a version

## Context

After the publication ([step 8](../../steps/08-publication.md)), the `npx` commands in `README.md` named the exact version: `npx --yes @that-simple/dotbrain@1.0.0 init`. On the instruction of the owner, commit `8bc6d8c` (2026-11-20) dropped the version from the commands of the installation and of the CLI in `README.md`, outside any step or decision; the log of [step 9](../../steps/09-tools-code-quality.md) and a review against the brain of the branch of steps 9 and 10 report it as a change with no decision behind it.

The `Stop` hook of the starter template runs `lint` with the exact version of the package, so that it works offline and a new version does not come in by itself ([decision](../agents/2026-11-17-lint-before-end-of-work.md)). `init` writes the version it runs from; without the tool, the version is taken from `README.md`, which names it in the description of the checks, apart from the commands.

Source: the change of `README.md` on the instruction of the owner, and the conversation of the owner with the agent, 2026-11-20.

## Options

- **A. Commands without a version.** The commands in `README.md` run the latest published version, so a new release needs no change of `README.md`; `init` from the latest version writes its own version into the hook. `README.md` keeps naming the exact version for the hook of a setup without `init`.
- **B. Commands with the exact version.** The commands name the version, as after step 8: a reader runs exactly the version the documentation describes, and every release changes `README.md`.

## Recommendation

A: the pinning that matters is in the hook, which `init` writes with the exact version anyway, and the commands for a person stay correct across releases.

## Who decides and when

The owner of the project, before the branch of steps 9 and 10 goes to the main branch.
