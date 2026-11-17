---
status: accepted
decided: 2026-10-28
description: "Language is a property of the brain: every repository chooses the language of its brain, and the framework assumes none."
---
# A language-agnostic framework

## Context

An example that must work: a team keeps the brain of its repository in Polish, and the specification, contract and templates of the framework are in English.

## Decision

Every brain has one language, declared in the manifest and chosen by the team of the repository. The agent writes to the brain in its language, and talks to a person in the person's language ([languages.md](../../architecture/languages.md)).
