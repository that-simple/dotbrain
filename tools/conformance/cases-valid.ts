// The valid cases of the conformance suite: brains that every implementation accepts.
import type { CaseSpec } from "./build.ts";
import { step } from "./fixtures/documents.ts";
import { merged } from "./fixtures/merged.ts";
import { MINIMAL } from "./fixtures/minimal.ts";
import { enProject } from "./fixtures/project-en.ts";
import { plProject } from "./fixtures/project-pl.ts";

export function validCases(): CaseSpec[] {
    return [
        { name: "valid-minimal", description: "The minimal valid brain from validity.md, in English.", files: MINIMAL },
        {
            name: "valid-project-en",
            description: `A brain in English set up with the starter, with every document kind, decisions in every
status in domain subdirectories, a rule with two globs and all instruction files.`,
            files: enProject(),
        },
        {
            name: "valid-project-pl",
            description: `A brain in Polish with a \`sections\` map. The managed block carries the contract in
English and the rules in Polish.`,
            files: plProject(),
        },
        {
            name: "valid-merged-branches",
            description: `A brain after merging two branches that each added a decision and a step and appended
to the log of step 1, and superseded the same decision in different directions: the step of the
branch merged second is renumbered, the log keeps both entries in date order, and the
contradicting decision of the second branch is back to \`proposed\`.`,
            files: merged(),
        },
        {
            name: "valid-ticket-steps",
            description: `A brain whose newer steps are named by the keys of their tickets in lowercase
(\`np-12\` for the ticket NP-12), next to the numbered steps written before.`,
            files: {
                ...enProject(),
                ".brain/README.md": enProject()[".brain/README.md"]!.replace(
                    "split into steps in `steps/NN-short-name.md`.",
                    "split into steps in `steps/NN-short-name.md`; steps written since the move to the issue tracker are named by the keys of their tickets in lowercase (`steps/np-12-short-name.md`).",
                ),
                ".brain/steps/np-12-search.md": step(
                    "NP-12",
                    "search",
                    "draft",
                    "Full-text search in notes.",
                    "Users find notes by words in them.",
                    "`GET /notes?q=`.",
                    ["A note is found by a word of its body."],
                ),
                ".brain/steps/np-7-export.md": step(
                    "NP-7",
                    "export",
                    "draft",
                    "Export of all notes of a user.",
                    "Users take their notes with them.",
                    "`GET /export` as a zip of markdown files.",
                    ["The export holds every note of the user."],
                ),
            },
        },
    ];
}
