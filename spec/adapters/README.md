# Adapters

The core of this specification describes the brain of a repository, its documents, generated views, work in git and the agent contract. An **adapter** says how the contract and the rules of the brain reach a particular kind of consumer. Version `1.0.0` has one adapter:

| Adapter | Covers |
| --- | --- |
| [agents.md](agents.md) | Delivering the agent contract and the rules for agents: instruction files, the managed block, the budget for `apply: always` |

Other ways of delivering the contract (a context pack for chats, plugins and skills of AI tools) are not specified in version `1.0.0`.

## Rules for every adapter

1. **The format does not change.** An adapter adds at most files next to the brain (instruction files) and does not change the meaning of any document.
2. **Same views.** Generated views are the same whoever generates them, a tool or an agent. Views an adapter adds follow the [common rules](../generated-views.md#common-rules) and the [conflict rules](../generated-views.md#conflicts) of the core.
3. **Own validity rules.** The validity rules of the core apply always ([validity.md](../validity.md)); the rules of an adapter apply only when the repository uses it.
4. **Used, not declared.** Whether a repository uses an adapter follows from what is there (instruction files), not from a field in the manifest.
