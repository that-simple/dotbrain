---
paths:
  - ".brain/**"
---
<!-- BEGIN:dotbrain 1.0.0 -->
<!-- Managed block: generated from the agent contract and the brain. Do not edit by hand; change the brain and regenerate. Text outside this block must not contradict the brain. -->

## Work on the brain

These rules apply to every change in `.brain/`, in addition to the managed block of the root instruction file.

- A new decision is a new file `YYYY-MM-DD-slug.md` in `.brain/decisions/` (in the subdirectory the index's conventions name, if any) with frontmatter (`status`, `description`, and `decided` once resolved) and the sections its status requires, headed with labels from the `sections` map of the manifest. Before adding one, check the descriptions of existing decisions; if one already covers the matter, report it instead.
- After adding a decision or changing its frontmatter or title, regenerate `.brain/decisions/README.md`. After adding a document or changing its `description`, regenerate the index block in `.brain/README.md`. After changing the `status` or `assignee` of a step, regenerate its status line and the index block. Never edit generated views by hand.
- Resolve a conflict in a generated view by regenerating it. In the log of a step, keep the entries of both sides, sorted by date, with those already on the main branch first within a date. If a step added on your branch has the number of a step already on the main branch, give yours the first free number and fix the links to it. Resolve any other conflict in a document by reading both versions and the version before the change; merge what does not contradict, and record a contradiction as a `proposed` decision with both options. If a decision accepted on your branch contradicts one accepted on the main branch, turn yours back to `proposed` as that decision; until it is resolved, the main branch's version binds.
- When the work on a step starts, set its `status` to `in-progress` and its `assignee` to the people doing the work (in the first commit of the work). Do a step with `stages` one stage at a time, each leaving the work in a working state (one commit each). Record progress in its log, one list entry per change or finished stage, starting with the date (`- YYYY-MM-DD: …`).
- Keep raw material (recordings, transcripts, emails, PDFs, contracts, images) at its source: write to the brain what follows from it (decisions, knowledge, open questions) with a link to the source, never the material itself.
- Do not put run instructions, commands, personal notes or personal data into the brain; commands go to the repository's `README.md` or outside the managed blocks of instruction files.
- If the `dotbrain` CLI is available, run `dotbrain lint` before ending work that changed the brain, and fix what it reports.
<!-- END:dotbrain -->
