// The error cases of the conformance suite in generated views, in the content of the brain, in links and in the
// budget of `apply: always` rules. Each names the violations expected.
import { type CaseSpec, sub } from "./build.ts";
import { accepted, step } from "./fixtures/documents.ts";
import { MINIMAL } from "./fixtures/minimal.ts";
import { enProject, OVERVIEW_EN } from "./fixtures/project-en.ts";
import { plProject } from "./fixtures/project-pl.ts";

export function viewAndContentErrorCases(): CaseSpec[] {
    const budget = enProject();
    for (let i = 0; i < 10; i++) {
        const n = String(i).padStart(2, "0");
        budget[`.brain/decisions/process/2026-11-02-rule-${n}.md`] = accepted(
            `Rule ${i}`,
            `Rule number ${i}.`,
            `Rule number ${i}.`,
            {
                apply: "always",
                date: "2026-11-02",
            },
        );
    }
    budget[".brain/decisions/process/2026-11-02-rule-00.md"] = accepted(
        "Rule 0",
        "A long rule.",
        Array(151).fill("word").join(" "),
        {
            apply: "always",
            date: "2026-11-02",
        },
    );

    return [
        {
            name: "error-views",
            description: `Out-of-date views: a decision added without regenerating the decision list, a document added
without regenerating the index block, a changed rule without regenerating the managed blocks and the
rule files, a missing rule file for Copilot, a leftover rule file for Claude Code, a missing rule file of
the brain for Claude Code, a changed rule file of the brain for \`AGENTS.md\` and a step agreed without
regenerating its status line and the index block.`,
            files: enProject(),
            afterIndex: {
                ".brain/decisions/api/2026-11-03-rate-limits.md": accepted(
                    "Rate limits",
                    "100 requests per minute per user.",
                    "100 requests per minute per user.",
                    {
                        date: "2026-11-03",
                    },
                ),
                ".brain/architecture/security.md": '---\ndescription: "Authentication and secrets."\n---\n# Security\n',
                ".brain/decisions/process/2026-11-01-languages.md": sub(
                    "Documentation in the brain is in English",
                    "Documentation is in English",
                ),
                ".github/instructions/notes-api-2026-11-02-soft-delete.instructions.md": null,
                ".claude/rules/notes-api-2026-10-01-old-rule.md":
                    "<!-- BEGIN:dotbrain 1.0.0 -->\n<!-- END:dotbrain -->\n",
                ".claude/rules/team-notes.md": "Our own rule, not generated.\n",
                ".brain/steps/02-sharing.md": sub("status: draft\n", "status: agreed\n"),
                ".claude/rules/notes-api.md": null,
                ".brain/AGENTS.md": sub("## Work on the brain", "## Working on the brain"),
            },
            expected: [
                ["V-VIEWS", ".claude/rules/notes-api.md"],
                ["V-VIEWS", ".brain/AGENTS.md"],
                ["V-VIEWS", ".brain/decisions/README.md"],
                ["V-VIEWS", ".brain/README.md"],
                ["V-VIEWS", ".brain/steps/02-sharing.md"],
                ["V-VIEWS", "CLAUDE.md"],
                ["V-VIEWS", "AGENTS.md"],
                ["V-VIEWS", ".github/copilot-instructions.md"],
                ["V-VIEWS", ".github/instructions/notes-api-2026-11-02-soft-delete.instructions.md"],
                ["V-VIEWS", ".claude/rules/notes-api-2026-10-01-old-rule.md"],
            ],
        },
        {
            name: "error-views-missing",
            description: `The decision list, the index block and the status line of a step are missing, and a rule file of
the brain for \`AGENTS.md\` is left over in a repository without \`AGENTS.md\`.`,
            files: {
                ...MINIMAL,
                ".brain/steps/01-first.md": step(
                    "01",
                    "first",
                    "draft",
                    "The first step.",
                    "The first step.",
                    "The first step.",
                    ["Done."],
                ),
            },
            afterIndex: {
                ".brain/decisions/README.md": null,
                ".brain/README.md": (c) =>
                    c!.replace(/\n<!-- BEGIN:dotbrain index -->.*<!-- END:dotbrain index -->\n/s, ""),
                ".brain/steps/01-first.md": (c) =>
                    c!.replace(/\n<!-- BEGIN:dotbrain status -->.*<!-- END:dotbrain status -->\n/s, ""),
                ".brain/AGENTS.md": "<!-- BEGIN:dotbrain 1.0.0 -->\n<!-- END:dotbrain -->\n",
            },
            expected: [
                ["V-VIEWS", ".brain/AGENTS.md"],
                ["V-VIEWS", ".brain/decisions/README.md"],
                ["V-VIEWS", ".brain/README.md"],
                ["V-VIEWS", ".brain/steps/01-first.md"],
            ],
        },
        {
            name: "error-views-translated",
            description: `In a Polish brain, an agent translated a line of the contract in the managed block and the
word \`Source:\` in a rule file. The block is generated with the contract in English and compared as
a whole, so a translation is a violation.`,
            files: plProject(),
            afterIndex: {
                "CLAUDE.md": sub(
                    "- Start with `.brain/README.md`, the index of documents:",
                    "- Zacznij od `.brain/README.md`, indeksu dokumentów:",
                ),
                ".claude/rules/faktury-2026-11-02-invoice-numbering.md": sub("Source: ", "Źródło: "),
            },
            expected: [
                ["V-VIEWS", "CLAUDE.md"],
                ["V-VIEWS", ".claude/rules/faktury-2026-11-02-invoice-numbering.md"],
            ],
        },
        {
            name: "error-content",
            description: "Raw material in the brain: an image and a PDF.",
            files: MINIMAL,
            beforeIndex: {
                ".brain/architecture/diagram.png": "not really an image\n",
                ".brain/contracts/agreement.pdf": "not really a pdf\n",
            },
            expected: [
                ["V-CONTENT", ".brain/architecture/diagram.png"],
                ["V-CONTENT", ".brain/contracts/agreement.pdf"],
            ],
        },
        {
            name: "error-links",
            description: "Relative links to files that do not exist, inside and outside the brain.",
            files: enProject(),
            beforeIndex: {
                ".brain/architecture/overview.md":
                    OVERVIEW_EN +
                    "\nSee [the API](api.md), [the code](../../src/notes/create.ts) and [the docs](https://example.com/docs). `[not a link](missing.md)`\n",
            },
            expected: [["V-LINKS", ".brain/architecture/overview.md"]],
        },
        {
            name: "error-budget",
            description: "Twelve rules with `apply: always`, one of them longer than 150 words.",
            files: budget,
            expected: [
                ["V-BUDGET", ".brain/README.md"],
                ["V-BUDGET", ".brain/decisions/process/2026-11-02-rule-00.md"],
            ],
        },
    ];
}
