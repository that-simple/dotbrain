---
paths:
  - ".brain/decisions/**"
---
<!-- BEGIN:dotbrain 1.0.0 -->
<!-- Managed block: generated from the agent contract and the brain. Do not edit by hand; change the brain and regenerate. Text outside this block must not contradict the brain. -->

### Decisions as ADRs, a generated list

- A decision is a `YYYY-MM-DD-slug.md` file in `decisions/` or its subdirectories (any layout, [decision](../../.brain/decisions/model/2026-10-28-decision-area-subdirectories.md)). The file name without the extension is the ID, unique without coordination; decision files are not renamed.
- Frontmatter: `status`, `description`, `decided` (the date of acceptance or rejection), `superseded-by` (the ID of the new decision).
- The minimal content is the Decision section. Context and Consequences are added when the decision needs them. A `proposed` decision has Context, Options, optionally a Recommendation, and who decides and when.
- `decisions/README.md` is a list generated from the frontmatter: groups by status, one line per decision (title with a link, description, date of resolution), sorted by ID. It is made by a tool or by an agent according to the specification; it is not edited by hand.
- A conflict in the list is resolved by regeneration. A conflict in the content of a decision, or two parallel decisions on the same matter, is resolved by the agent: it reads both versions and the state before the changes, merges what does not contradict, and reports a contradiction to a person as a `proposed` decision.

Source: [decisions/model/2026-10-28-decisions-as-adr.md](../../.brain/decisions/model/2026-10-28-decisions-as-adr.md)
<!-- END:dotbrain -->
