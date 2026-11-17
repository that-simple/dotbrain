# Conformance suite

The conformance suite is a set of sample repositories with the views and the violations this specification gives for them. Any implementation (a tool, or an agent generating views without one) is checked against it: `lint` reports exactly the expected violations, and generating the views of a valid case changes nothing. The suite is part of the specification and is versioned with it.

## Cases

Every case is one file `spec/conformance/<case>.txtar`, where `<case>` is a kebab-case name. A case holds the whole tree of one [repository](../brain.md#concepts) in the txtar format, so that its brain is not taken for the brain of the dotbrain repository and its instruction files are not read while working in it, and its paths and views are exactly those of a real repository.

### Format

```
<description>
<rule ID> <path>
-- <path> --
<content of the file>
-- <path> --
<content of the file>
```

- The **header** is every line before the first file marker. A header line of the form `<rule ID> <path>` (an ID such as `V-LINKS`, one space, a path) is an expected violation; every other header line is description.
- A **file marker** is a line `-- <path> --`. The content of the file is every line after the marker, up to the next marker or the end of the case, each ending with a newline. A file with no lines is empty.
- **Paths** are relative to the repository root, separated by `/`, without `.` or `..` segments. Directories exist through the files in them.

To extract a case, create an empty directory as the repository root and write every file at its path. The extracted directory is not a git repository, so no file in it is ignored.

### Valid cases and error cases

A case without expected violations is **valid**: `lint` reports nothing for it, and its generated views are up to date, so generating them again changes no file, character for character. A case with expected violations is an **error case**: it is valid except for the expected violations.

## What is compared

`lint` on the extracted repository gives a set of pairs (rule ID, path), compared with the set of expected violations. Messages, line numbers, order, repeated reports and other notes are not compared. The severity follows from the rule ([validity.md](../validity.md#rules)): an implementation exits with an error exactly when an expected violation has the severity `error`.

The path of a violation, relative to the repository root:

| Rule | Path |
| --- | --- |
| V-MANIFEST | `.brain/README.md` |
| V-FRONTMATTER, V-TITLE, V-SECTIONS, V-APPLY, V-STEP, V-DECISION, V-LINKS | The document; for an ID of a decision or a step used twice, every document that uses it |
| V-NAMES, V-CONTENT | The file or directory (a directory without a trailing `/`) |
| V-VIEWS | The file that holds the view; for a missing file, the path where it belongs; for an out-of-date generated file, its path |
| V-BUDGET | `.brain/README.md` for too many rules; the rule's document for a rule that is too long |

## Checking an agent

A valid case also tests an agent that generates views without a tool ([README.md](../README.md)):

1. Extract the case and remove its generated views: the decision lists, the index blocks (from marker to marker) and the managed blocks of instruction files (also the rule files of the brain and the files for rules with a glob).
2. Ask the agent, in a session without other context, to generate them following this specification.
3. Check the result with an implementation that passes the suite, in its mode that checks views without writing them: no view is out of date.

## Coverage

Version `1.0.0` of the suite has at least one error case for every rule of the core and of the agents adapter, a brain in a language other than English with a `sections` map and rules in that language, and the state of a repository after merging two branches with conflicts resolved as the specification describes.
