// The error cases of the conformance suite in the documents themselves: the manifest, frontmatter, titles,
// names, decisions, steps, sections and `apply`. Each names the violations expected.
import { type CaseSpec, replaced } from "./build.ts";
import { accepted, step } from "./fixtures/documents.ts";
import { MINIMAL, MINIMAL_README } from "./fixtures/minimal.ts";
import {
    enProject,
    GRAPHQL,
    HEROKU,
    OVERVIEW_EN,
    RISKS_EN,
    ROADMAP_EN,
    STEP1_EN,
    STEP2_EN,
} from "./fixtures/project-en.ts";
import { plProject, STEP1_PL, STORAGE_PL } from "./fixtures/project-pl.ts";

export function documentErrorCases(): CaseSpec[] {
    return [
        {
            name: "error-manifest",
            description: "`brain` is not kebab-case, and `spec` is 0.1, the draft before 1.0.0.",
            files: MINIMAL,
            beforeIndex: {
                ".brain/README.md": replaced(
                    MINIMAL_README,
                    ["brain: example", "brain: Example"],
                    ["spec: 1.0.0", "spec: 0.1"],
                ),
            },
            expected: [["V-MANIFEST", ".brain/README.md"]],
        },
        {
            name: "error-frontmatter",
            description: `An area document without \`description\`, and one without frontmatter. The index block is
built from them, so it is not compared until they are fixed.`,
            files: enProject(),
            beforeIndex: {
                ".brain/architecture/overview.md": replaced(OVERVIEW_EN, [
                    'description: "Architecture of the Notes API: components, data and hosting."\n',
                    "owner: ana\n",
                ]),
                ".brain/architecture/security.md": "# Security\n\nTokens expire after one hour.\n",
            },
            expected: [
                ["V-FRONTMATTER", ".brain/architecture/overview.md"],
                ["V-FRONTMATTER", ".brain/architecture/security.md"],
            ],
        },
        {
            name: "error-title",
            description: "A document with two H1 headings, and one whose first heading is not the title.",
            files: enProject(),
            beforeIndex: {
                ".brain/risks.md": `${RISKS_EN}\n# More risks\n`,
                ".brain/roadmap.md": replaced(ROADMAP_EN, ["# Roadmap\n", "## Phases\n\n# Roadmap\n"]),
            },
            expected: [
                ["V-TITLE", ".brain/risks.md"],
                ["V-TITLE", ".brain/roadmap.md"],
            ],
        },
        {
            name: "error-names",
            description: "A file name with capitals and a directory name with an underscore.",
            files: enProject(),
            beforeIndex: {
                ".brain/architecture/overview.md": null,
                ".brain/architecture/Overview.md": OVERVIEW_EN,
                ".brain/data_model/notes.md": '---\ndescription: "Notes as stored."\n---\n# Notes\n',
            },
            expected: [
                ["V-NAMES", ".brain/architecture/Overview.md"],
                ["V-NAMES", ".brain/data_model"],
                ["V-LINKS", ".brain/decisions/api/2026-11-02-soft-delete.md"],
            ],
        },
        {
            name: "error-decision",
            description: `A decision file with an invalid date, an accepted decision without \`decided\`, a superseded
decision whose \`superseded-by\` names no decision, and an ID used twice.`,
            files: enProject(),
            beforeIndex: {
                ".brain/decisions/api/2026-02-30-limits.md": accepted("Limits", "Limits.", "Limits.", {
                    date: "2026-11-02",
                }),
                ".brain/decisions/api/2026-11-02-graphql-endpoint.md": replaced(GRAPHQL, ["decided: 2026-11-02\n", ""]),
                ".brain/decisions/infrastructure/2026-10-30-hosting-on-heroku.md": replaced(HEROKU, [
                    "superseded-by: 2026-11-02-hosting-on-fly-io",
                    "superseded-by: 2026-11-02-hosting-on-render",
                ]),
                ".brain/decisions/data/2026-11-02-soft-delete.md": accepted(
                    "Soft delete in the database",
                    "A trigger keeps deleted rows.",
                    "A trigger keeps deleted rows.",
                    {
                        date: "2026-11-02",
                    },
                ),
            },
            expected: [
                ["V-DECISION", ".brain/decisions/api/2026-02-30-limits.md"],
                ["V-DECISION", ".brain/decisions/api/2026-11-02-graphql-endpoint.md"],
                ["V-DECISION", ".brain/decisions/infrastructure/2026-10-30-hosting-on-heroku.md"],
                ["V-DECISION", ".brain/decisions/api/2026-11-02-soft-delete.md"],
                ["V-DECISION", ".brain/decisions/data/2026-11-02-soft-delete.md"],
            ],
        },
        {
            name: "error-step",
            description:
                "A log entry without a date, a step without a status, a misnamed step, a step number used twice and a ticket key used twice.",
            files: enProject(),
            beforeIndex: {
                ".brain/steps/01-walking-skeleton.md": replaced(STEP1_EN, ["- 2026-11-03: `DELETE", "- Then `DELETE"]),
                ".brain/steps/02-sharing.md": replaced(STEP2_EN, ["status: draft\n", ""]),
                ".brain/steps/2-search.md": step("2", "search", "draft", "Search.", "Search.", "Search.", [
                    "Search works.",
                ]),
                ".brain/steps/01-billing.md": step("01", "billing", "draft", "Billing.", "Billing.", "Billing.", [
                    "Billing works.",
                ]),
                ".brain/steps/np-12-search.md": step("NP-12", "search", "draft", "Search.", "Search.", "Search.", [
                    "Search works.",
                ]),
                ".brain/steps/np-12-full-text.md": step(
                    "NP-12",
                    "full text",
                    "draft",
                    "Full text.",
                    "Full text.",
                    "Full text.",
                    ["Full text works."],
                ),
            },
            expected: [
                ["V-STEP", ".brain/steps/01-walking-skeleton.md"],
                ["V-STEP", ".brain/steps/02-sharing.md"],
                ["V-STEP", ".brain/steps/2-search.md"],
                ["V-STEP", ".brain/steps/01-billing.md"],
                ["V-STEP", ".brain/steps/np-12-search.md"],
                ["V-STEP", ".brain/steps/np-12-full-text.md"],
            ],
        },
        {
            name: "error-sections",
            description: `An accepted decision without its \`decision\` section, a proposed decision with \`options\` twice,
and a Polish step whose scope is headed in English instead of with the label of the \`sections\` map.`,
            files: plProject(),
            beforeIndex: {
                ".brain/decisions/data/2026-11-03-invoice-pdf-storage.md": replaced(STORAGE_PL, [
                    "## Kto i kiedy",
                    "## Opcje\n\n3. **Na dysku.**\n\n## Kto i kiedy",
                ]),
                ".brain/decisions/domain/2026-11-03-currency.md":
                    '---\nstatus: accepted\ndecided: 2026-11-03\ndescription: "Faktury w PLN."\n---\n# Waluta\n\n## Decision\n\nFaktury wystawiamy w PLN.\n',
                ".brain/steps/01-walking-skeleton.md": replaced(STEP1_PL, ["## Zakres", "## Scope"]),
            },
            expected: [
                ["V-SECTIONS", ".brain/decisions/data/2026-11-03-invoice-pdf-storage.md"],
                ["V-SECTIONS", ".brain/decisions/domain/2026-11-03-currency.md"],
                ["V-SECTIONS", ".brain/steps/01-walking-skeleton.md"],
            ],
        },
        {
            name: "error-apply",
            description: "`apply` is an empty list.",
            files: enProject(),
            beforeIndex: {
                ".brain/architecture/overview.md": replaced(OVERVIEW_EN, [
                    "---\n# Overview",
                    "apply: []\n---\n# Overview",
                ]),
            },
            expected: [["V-APPLY", ".brain/architecture/overview.md"]],
        },
    ];
}
