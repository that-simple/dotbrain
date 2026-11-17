# Generated views

A generated view is assembled from the frontmatter of documents. It is never the source of truth and is never edited by hand. A tool or an agent generates it by following the algorithms below exactly, so that every generator produces the same text from the same brain.

Generated views in version `1.0.0`:

| View | Where | Algorithm |
| --- | --- | --- |
| Decision list | `.brain/decisions/README.md` | [Decision list](#decision-list) |
| Index block | `.brain/README.md`, between markers | [Index block](#index-block) |
| Status line of a step | Every step, under its title, between markers | [Status line of a step](#status-line-of-a-step) |

The [agents adapter](adapters/agents.md#managed-block) adds views of its own, which follow the common rules and the conflict rules below: the managed blocks of instruction files, the rule files of the brain and the files for rules with a glob.

## Common rules

- Generate a view again after every change to what it is built from: after adding a decision or changing its frontmatter or title, after adding or removing a document or changing its `description`, after changing the `status` or `assignee` of a step, after changing the manifest.
- A view that is a block between markers is replaced as a whole, from the start marker to the end marker inclusive. Text outside the markers is never changed by a generator.
- Labels come from the `sections` map of the brain's manifest, or the default English labels ([documents.md](documents.md#section-keys-and-the-section-map)). Below, `label(key)` means the label for a key.
- Descriptions and titles are copied verbatim, including inline markdown such as backticks.
- Sorting is by plain lexicographic order of the characters (code points), never by locale.
- Lines end with a single newline; the file ends with a single newline; there is exactly one blank line between blocks of text and no trailing whitespace.

## Conflicts

- A conflict in a generated view when merging branches is resolved by generating the view again from the merged documents, never by merging the view by hand.
- A conflict in a document is resolved by reading both versions and the version before the change, combining what does not contradict, and recording a contradiction as a new `proposed` decision with both options ([agent-contract.md](agent-contract.md), rule 10). Two conflicts in documents are resolved mechanically instead: in the log of a step, and between steps with the same number ([documents.md](documents.md#steps)). The views are generated after the documents are resolved.

## Decision list

Input: the brain's manifest and every file in `decisions/` or any of its subdirectories whose name matches `YYYY-MM-DD-slug.md`. The list is the same for every layout of `decisions/`.

1. For each decision, read the ID (file name without `.md`), its path relative to `decisions/` (`<path>`; for a flat layout, `<ID>.md`), the title (text of the H1 heading), `status`, `description`, `decided` and `superseded-by`.
2. Group the decisions by status in the order `proposed`, `accepted`, `rejected`, `superseded`. Skip groups with no decisions.
3. Within each group, sort by ID.
4. Write `decisions/README.md`:

   ```markdown
   ---
   description: "<label(decisions)>: <label(proposed)>, <label(accepted)>, <label(rejected)>, <label(superseded)>"
   ---
   # <label(decisions)>

   <!-- Generated from decision frontmatter. Do not edit by hand; regenerate on conflict. -->

   ## <label(group)>

   <one line per decision>
   ```

   with one `## <label(group)>` section per non-empty group, where `group` is the status of the group (`proposed`, `accepted`, `rejected`, `superseded`), and one line per decision:

   | Status | Line |
   | --- | --- |
   | `proposed` | `- [<title>](<path>): <description>` |
   | `accepted`, `rejected` | `- [<title>](<path>): <description> (<decided>)` |
   | `superseded` | `- [<title>](<path>): <description> (<decided>) → [<superseded-by>](<path of superseded-by>)` |

The `description` of the list itself always names all four groups, whether they are empty or not.

## Index block

Input: the documents of the brain ([brain.md](brain.md#concepts)).

1. Collect every `.md` file of the brain except: the index (`README.md` at the brain root), decision files (`YYYY-MM-DD-slug.md` in `decisions/` and its subdirectories), and files added by adapters, such as instruction files ([adapters/agents.md](adapters/agents.md#tools)).
2. Group the files by directory (path relative to the brain root). The root group comes first; the other groups follow, sorted by directory path.
3. Within each group, sort by file name.
4. For each file, write the line `- [<text>](<path>): <description>`, where `<path>` is the path relative to the brain root and `<text>` is the file name, or the path relative to the brain root when the file is named `README.md`. For a step (a file in `steps/`), the line is ``- [<text>](<path>): <description> (`<status>`)``, with its `status` after a space.
5. Write the block:

   ```markdown
   <!-- BEGIN:dotbrain index -->
   <!-- Generated from document frontmatter. Do not edit by hand; regenerate on conflict. -->

   <lines of the root group>

   `<directory>/`:

   <lines of the group>
   <!-- END:dotbrain index -->
   ```

   The root group has no heading and is skipped when empty. Every other group starts with the line `` `<directory>/`: `` followed by a blank line. The end marker follows the last line directly.

The block is placed in `README.md` after the hand-written description of the brain. When the block is missing, add it there.

## Status line of a step

Input: one step (a document in `steps/`) and the manifest of its brain.

1. When `assignee` is missing or an empty list, the line is ``<label(status)>: `<status>` ``, with the `status` of the step.
2. Otherwise the line is ``<label(status)>: `<status>` · <label(assignee)>: <identities>``, where `<identities>` are the identities of `assignee` in their order, separated by a comma and a space. The middle dot (`·`, U+00B7) has one space on each side.
3. Write the block:

   ```markdown
   <!-- BEGIN:dotbrain status -->
   <line>
   <!-- END:dotbrain status -->
   ```

The block is placed directly under the H1 title of the step, with one blank line before and after it. When the block is missing, add it there. Every step has the block, so that a person sees the status of the step in its text and not only in the frontmatter; the status and the people are changed only in the frontmatter.
