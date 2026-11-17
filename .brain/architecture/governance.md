---
description: "Governance of the brain: the owner, the decision process, superseding decisions and the periodic review."
---
# Governance of the brain

How the team of a repository runs its brain.

## Owner

- The brain has an owner (a person or a role) in the manifest (`owner`). By default the owner resolves `proposed` decisions, unless a decision names another person.
- Who reads the brain, proposes changes and approves them is set by the repository and its host: access to the repository, PRs, branch protection and the team's CODEOWNERS ([decision](../decisions/model/2026-11-05-code-repository-only.md)).

## Decision process

1. **Proposal:** a new ADR file in `decisions/` with status `proposed`: context, options, recommendation and the person who decides ([core-model.md](core-model.md)). Anyone may prepare a proposal, an agent too.
2. **Review:** through a PR. The people the decision concerns comment.
3. **Resolution:** the person named in the decision changes the status to `accepted` (with the date in `decided`) or `rejected` with the rationale.
4. **Superseding:** the new decision names in its context the one it supersedes; the old one gets status `superseded` and the `superseded-by` field, and stays in the history.

What an agent may do in this process is set by the [agent contract](../../spec/agent-contract.md) (rules 4 and 15).

In a small team the process may take five minutes and do without a separate PR; what matters is that the decision reaches `decisions/` before the work. ADR files with an ID from the date and slug keep parallel proposals from colliding; the decision list is generated after every change.

## Periodic review

A review of the brain (its frequency is set by the owner):

- open decisions without a person who decides, or past their deadline;
- decisions made that do not match practice (a discrepancy);
- steps without progress in their "Log";
- risks without a current mitigation;
- documents outside the index and dead links.

The first four are checked by a person with the help of an agent, the last can be checked automatically (`lint`, [tooling-and-distribution.md](tooling-and-distribution.md)).
