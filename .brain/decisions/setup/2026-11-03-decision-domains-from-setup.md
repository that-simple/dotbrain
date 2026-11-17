---
status: accepted
decided: 2026-11-03
description: "The starter template puts decisions in subdirectories by domain from the start, created together with the first decision in the domain; the first decisions go to `decisions/process/`."
---
# Decision subdirectories from the setup of the brain

## Context

The specification allows any layout of `decisions/` ([free layout](../model/2026-10-28-decision-area-subdirectories.md)). A brain where decisions keep coming, in a flat layout, ends up with a directory where the decision list lies under dozens of files. Moving decisions later costs a change with fixing links and a change of habits, and starting with domains costs nothing if the directories are created only when they are needed. Domains cannot be foreseen when the brain is set up, because they differ in every project.

## Decision

The starter template puts decisions in subdirectories by domain from the start, created together with the first decision in the domain. The convention in the index says: decisions are in `decisions/<domain>/`, a domain is a short English name in kebab-case, a new one is created when a decision fits none of the existing ones, and a decision concerning several domains goes to the one where it has the most effect. The first decisions of the template (languages and order of work) go to `decisions/process/`. The list of domains is not set at the start.

## Consequences

This concerns the templates, not the specification, because the layout stays the choice of the owner of the brain: the procedure of setting up a brain ([templates/README.md](../../../templates/README.md)) and the conventions in the index template ([templates/index.md](../../../templates/index.md)). A brain with one or two decisions has one directory more; that is the price of a simple rule without a threshold.

## Who decides and when

The owner of the project.
