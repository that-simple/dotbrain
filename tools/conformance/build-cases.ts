// Builds the cases of the conformance suite (spec/conformance/*.txtar).
//
// Each case is written from its source documents: the views are generated with `index`
// on a valid base, then the mutations of an error case are applied (before or after
// generating the views again), and the tree is packed as txtar with the expected
// violations in its header. The suite itself does not depend on this script or on the
// tools: any implementation is checked against the files it produces.
//
// Usage: node tools/conformance/build-cases.ts [--check]
//   --check  build into memory and report cases that differ from spec/conformance/
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runIndex } from "../src/index.ts";
import { compareCodePoints } from "../src/repo.ts";

const REPO = fileURLToPath(new URL("../../", import.meta.url));
const OUT = join(REPO, "spec/conformance");

type Files = Record<string, string | null>;
type Mutation = string | null | ((current: string | null) => string | null);

interface CaseSpec {
    name: string;
    description: string;
    files: Files;
    /** Changes to documents; the views are generated again after them. */
    beforeIndex?: Files;
    /** Changes made after the views are generated, so that views are out of date. */
    afterIndex?: Record<string, Mutation>;
    expected?: [string, string][];
}

function writeTree(root: string, files: Files) {
    for (const [path, content] of Object.entries(files)) {
        const file = join(root, path);
        if (content === null) {
            rmSync(file, { force: true });
            continue;
        }
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, content);
    }
}

function readTree(root: string, dir = ""): Map<string, string> {
    const out = new Map<string, string>();
    for (const e of readdirSync(join(root, dir), { withFileTypes: true })) {
        const rel = dir === "" ? e.name : `${dir}/${e.name}`;
        if (e.isDirectory()) for (const [k, v] of readTree(root, rel)) out.set(k, v);
        else out.set(rel, readFileSync(join(root, rel), "utf8"));
    }
    return out;
}

function build(c: CaseSpec): string {
    const root = mkdtempSync(join(tmpdir(), "dotbrain-build-"));
    try {
        writeTree(root, c.files);
        runIndex(root, { check: false });
        if (c.beforeIndex) {
            writeTree(root, c.beforeIndex);
            runIndex(root, { check: false });
        }
        for (const [path, m] of Object.entries(c.afterIndex ?? {})) {
            const file = join(root, path);
            const current = existsSync(file) ? readFileSync(file, "utf8") : null;
            writeTree(root, { [path]: typeof m === "function" ? m(current) : m });
        }
        const tree = readTree(root);
        const expected = [...(c.expected ?? [])]
            .sort((a, b) => compareCodePoints(a[0], b[0]) || compareCodePoints(a[1], b[1]))
            .map(([rule, path]) => `${rule} ${path}`);
        let text = [...c.description.trim().split("\n"), ...expected].join("\n") + "\n";
        for (const path of [...tree.keys()].sort(compareCodePoints)) {
            const content = tree.get(path)!;
            if (content !== "" && !content.endsWith("\n"))
                throw new Error(`${c.name}: ${path} does not end with a newline`);
            if (/^-- .+ --$/m.test(content)) throw new Error(`${c.name}: ${path} contains a txtar marker`);
            text += `-- ${path} --\n${content}`;
        }
        return text;
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
}

function sub(old: string, replacement: string): Mutation {
    return (current) => {
        if (current === null || !current.includes(old)) throw new Error(`text not found: ${old}`);
        return current.replace(old, replacement);
    };
}

function replaced(text: string, ...pairs: [string, string][]): string {
    for (const [old, replacement] of pairs) {
        if (!text.includes(old)) throw new Error(`text not found: ${old}`);
        text = text.replace(old, replacement);
    }
    return text;
}

const INDEX_EMPTY = `<!-- BEGIN:dotbrain index -->
<!-- Generated from document frontmatter. Do not edit by hand; regenerate on conflict. -->
<!-- END:dotbrain index -->`;

const DOMAINS_EN =
    "- Decisions are in subdirectories of `decisions/` by domain (`decisions/<domain>/`), such as `process/` for the rules of work. A domain is a short English name in kebab-case. A new domain is created when a decision fits none of the existing ones; a decision that concerns several domains goes to the one where it has the most effect.";

// ------------------------------------------------------------------ minimal

const MINIMAL: Files = {
    ".brain/README.md": `---
brain: example
lang: en
spec: 1.0.0
description: "One sentence about what the brain covers."
---
# Example

What this brain is about.

${INDEX_EMPTY}
`,
};
const MINIMAL_README = MINIMAL[".brain/README.md"]!;

// ------------------------------------------------------------------ project in English

const EN_README = `---
brain: notes-api
lang: en
spec: 1.0.0
owner: ana
description: "Source of truth for the Notes API: the service that stores notes for the Notes apps."
---
# Notes API

The Notes API stores the notes of the Notes web and mobile apps. The brain is the source of truth for its product, architecture, infrastructure and code: a decision is made here first, then carried into the code, and a change that departs from a document updates it in the same pull request.

${INDEX_EMPTY}

## Steps

Phases of the [roadmap](roadmap.md) are split into steps in \`steps/NN-short-name.md\`. A step is the spec the work is done by; its status is in the frontmatter (\`draft\`, \`agreed\`, \`in-progress\`, \`done\`).

## Conventions

${DOMAINS_EN}
`;

interface AcceptedOptions {
    apply?: string;
    date?: string;
    context?: string;
    labels?: { context: string; decision: string };
}

function accepted(title: string, desc: string, decision: string, o: AcceptedOptions = {}): string {
    const labels = o.labels ?? { context: "Context", decision: "Decision" };
    let fm = `---\nstatus: accepted\ndecided: ${o.date ?? "2026-11-01"}\n`;
    if (o.apply) fm += `apply: ${o.apply}\n`;
    fm += `description: "${desc}"\n---\n`;
    let body = `# ${title}\n\n`;
    if (o.context) body += `## ${labels.context}\n\n${o.context}\n\n`;
    return fm + body + `## ${labels.decision}\n\n${decision}\n`;
}

const LANGUAGES_EN = accepted(
    "Languages of the work",
    "Code, identifiers, comments, log and error messages, commits, branch names and pull requests are in English.",
    "Code, identifiers, comments, log and error messages, commits, branch names and pull requests are in English. Documentation in the brain is in English, the language of the brain.",
    { apply: "always" },
);

const ORDER_EN = readFileSync(join(REPO, "templates/order-of-work.md"), "utf8").replace("<YYYY-MM-DD>", "2026-11-01");

const SOFT_DELETE = accepted(
    "Soft delete of notes",
    "Deleting a note sets `deleted_at` instead of removing the row.",
    "Deleting a note sets `deleted_at` instead of removing the row, and a deleted note answers `404`. Queries and migrations filter on `deleted_at` ([overview](../../architecture/overview.md#data)).",
    {
        apply: '["src/notes/**", "*.sql"]',
        date: "2026-11-02",
        context: "Users restore notes deleted by mistake, and support needs the history of a note.",
    },
);

const HEROKU = `---
status: superseded
decided: 2026-10-30
superseded-by: 2026-11-02-hosting-on-fly-io
description: "The API runs on Heroku."
---
# Hosting on Heroku

## Decision

The API runs on one Heroku dyno with Heroku Postgres.
`;

const FLY = accepted(
    "Hosting on Fly.io",
    "The API runs on Fly.io, in one region close to most users.",
    "The API runs on Fly.io in one region close to most users, with a managed Postgres.",
    {
        date: "2026-11-02",
        context: "Replaces [hosting on Heroku](2026-10-30-hosting-on-heroku.md): the free tier ended.",
    },
);

const GRAPHQL = `---
status: rejected
decided: 2026-11-02
description: "The API does not offer GraphQL; it stays REST only."
---
# GraphQL endpoint

## Decision

Rejected: the apps need only a few fixed queries, and one style of API is enough.
`;

const DATABASE = `---
status: proposed
description: "Whether notes are stored in SQLite or in PostgreSQL."
---
# Database for notes

## Context

The first release needs a database. The team has used both.

## Options

1. **SQLite:** one file, no server, easy backups; limited concurrent writes.
2. **PostgreSQL:** a managed service on the host; one more service to run.

## Recommendation

PostgreSQL, because the host offers it managed.

## Who decides and when

Ana, before step 1 is done.
`;

const OVERVIEW_EN = `---
description: "Architecture of the Notes API: components, data and hosting."
---
# Overview

The API is one service in front of one database.

## Data

Notes are rows with an owner, a body and the timestamps \`created_at\`, \`updated_at\` and \`deleted_at\`.
`;

const ROADMAP_EN = `---
description: "Phases of the Notes API and the gates between them."
---
# Roadmap

| Phase | Scope | Gate |
| --- | --- | --- |
| MVP | Create, list and delete notes | The web app uses the API |
| Sharing | Shared notes | [Step 2](steps/02-sharing.md) done |
`;

const RISKS_EN = `---
description: "Risks of the Notes API with their impact and mitigation."
---
# Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Data loss | High | Daily backups, soft delete |
`;

const EN_LABELS = { goal: "Goal", scope: "Scope", acceptance: "Acceptance criteria", log: "Log", step: "Step" };
const PL_LABELS = { goal: "Cel", scope: "Zakres", acceptance: "Kryteria akceptacji", log: "Przebieg", step: "Krok" };

interface StepOptions {
    log?: string[];
    assignee?: string;
    labels?: typeof EN_LABELS;
}

function step(
    num: string,
    title: string,
    status: string,
    desc: string,
    goal: string,
    scope: string,
    criteria: string[],
    o: StepOptions = {},
): string {
    const L = o.labels ?? EN_LABELS;
    let fm = `---\nstatus: ${status}\n`;
    if (o.assignee) fm += `assignee: [${o.assignee}]\n`;
    fm += `description: "${desc}"\n---\n`;
    let body = `# ${L.step} ${num}: ${title}\n\n## ${L.goal}\n\n${goal}\n\n## ${L.scope}\n\n${scope}\n\n## ${L.acceptance}\n\n`;
    body += criteria.map((c, i) => `${i + 1}. ${c}`).join("\n") + "\n";
    if (o.log) body += `\n## ${L.log}\n\n` + o.log.join("\n") + "\n";
    return fm + body;
}

const STEP1_EN = step(
    "01",
    "walking skeleton",
    "in-progress",
    "A deployed API that creates, lists and deletes notes.",
    "A deployed API with the three basic endpoints, so that the web app can start using it.",
    "- `POST /notes`, `GET /notes`, `DELETE /notes/{id}`.\n- Deployment on the host from [the hosting decision](../decisions/infrastructure/2026-11-02-hosting-on-fly-io.md).",
    [
        "The three endpoints answer on the deployed URL.",
        "Deleting a note follows the [soft delete decision](../decisions/api/2026-11-02-soft-delete.md).",
    ],
    {
        log: [
            "- 2026-11-02: Started; endpoints sketched.",
            "- 2026-11-03: `DELETE /notes/{id}` with soft delete; checked with the tests of the endpoint.\n  - Deployment still open.",
        ],
        assignee: "user:ana, user:ben",
    },
);

const STEP2_EN = step(
    "02",
    "sharing",
    "draft",
    "Notes shared with other users.",
    "Users share a note with other users.",
    "Sharing by email address.",
    ["A shared note is visible to the other user."],
);

function enProject(): Files {
    return {
        ".brain/README.md": EN_README,
        ".brain/decisions/process/2026-11-01-languages.md": LANGUAGES_EN,
        ".brain/decisions/process/2026-11-01-order-of-work.md": ORDER_EN,
        ".brain/decisions/api/2026-11-02-soft-delete.md": SOFT_DELETE,
        ".brain/decisions/api/2026-11-02-graphql-endpoint.md": GRAPHQL,
        ".brain/decisions/infrastructure/2026-10-30-hosting-on-heroku.md": HEROKU,
        ".brain/decisions/infrastructure/2026-11-02-hosting-on-fly-io.md": FLY,
        ".brain/decisions/data/2026-11-03-database.md": DATABASE,
        ".brain/architecture/overview.md": OVERVIEW_EN,
        ".brain/roadmap.md": ROADMAP_EN,
        ".brain/risks.md": RISKS_EN,
        ".brain/steps/01-walking-skeleton.md": STEP1_EN,
        ".brain/steps/02-sharing.md": STEP2_EN,
        "CLAUDE.md": "# Notes API\n\n## Commands\n\n- `npm test` runs the tests.\n",
        "AGENTS.md": "# Notes API\n",
        ".github/copilot-instructions.md": "# Notes API\n",
        "src/notes/delete.ts": "export function deleteNote(id: string): void {\n  // sets deleted_at\n}\n",
    };
}

// ------------------------------------------------------------------ project in Polish

const PL_SECTIONS = `sections:
  goal: Cel
  scope: Zakres
  out-of-scope: Poza zakresem
  decisions: Decyzje
  acceptance: Kryteria akceptacji
  stages: Etapy
  log: Przebieg
  open-questions: Otwarte pytania
  context: Kontekst
  options: Opcje
  recommendation: Rekomendacja
  decider: Kto i kiedy rozstrzyga
  decision: Decyzja
  consequences: Konsekwencje
  proposed: Do podjęcia
  accepted: Podjęte
  rejected: Odrzucone
  superseded: Zastąpione
  status: Status
  assignee: Wykonawcy
`;

const PL_DESCRIPTION = "Źródło prawdy serwisu Faktury: wystawianie i numeracja faktur dla klientów sklepu.";

const PL_README = `---
brain: faktury
lang: pl
spec: 1.0.0
owner: ola
description: "${PL_DESCRIPTION}"
${PL_SECTIONS}---
# Faktury

Serwis Faktury wystawia faktury dla zamówień sklepu i nadaje im numery. Brain jest źródłem prawdy produktu, architektury, infrastruktury i kodu: decyzja zapada najpierw tutaj, potem trafia do kodu, a zmiana, która odchodzi od dokumentu, aktualizuje go w tym samym PR.

${INDEX_EMPTY}

## Kroki

Fazy rozbijamy na kroki w \`steps/NN-krotka-nazwa.md\`. Krok to spec, według którego powstaje praca; jego status jest we frontmatterze.

## Konwencje

- Decyzje leżą w podkatalogach \`decisions/\` per domena (\`decisions/<domena>/\`), np. \`process/\` dla zasad pracy. Domena to krótka angielska nazwa w kebab-case. Nową zakładamy, gdy decyzja nie pasuje do żadnej istniejącej; decyzja dotycząca kilku domen idzie do tej, w której ma największy skutek.
`;

const PL_DECISION = { context: "Kontekst", decision: "Decyzja" };

const LANGUAGES_PL = accepted(
    "Języki pracy",
    "Kod, identyfikatory, komentarze, komunikaty, commity, gałęzie i PR po angielsku; dokumentacja po polsku.",
    "Kod, identyfikatory, komentarze, komunikaty logów i błędów, commity, nazwy gałęzi i PR są po angielsku. Dokumentacja w brainie jest po polsku.",
    { apply: "always", labels: PL_DECISION },
);

const ORDER_PL = accepted(
    "Brain razem z pracą",
    "Zmiany w brainie idą w tym samym PR co praca, która z nich wynika.",
    "Zmiany w brainie (decyzje, także `proposed`, kroki, dokumenty) idą w tym samym PR co praca, która z nich wynika, w dowolnych jego commitach, także w tym samym commicie co praca. Wyjątkiem jest krok: commit, który ustawia mu `agreed`, jest przed pracą nad nim, a każdy skończony etap to osobny commit. W tym PR są też widoki generowane i bloki zarządzane plików instrukcji. Decyzja `proposed` albo nowy krok, które dotyczą pracy innych osób, mogą trafić na główną gałąź wcześniej osobnym małym PR.",
    {
        apply: "always",
        labels: PL_DECISION,
        context: "Kolejność pracy to decyzja zespołu; to domyślne ustawienie szablonu startowego dotbrain.",
    },
);

const NUMBERING_PL = accepted(
    "Numeracja faktur",
    "Faktury mają numery `FV/RRRR/MM/NNNN`, nadawane w transakcji razem z zapisem faktury.",
    "Numer faktury ma postać `FV/RRRR/MM/NNNN` i jest nadawany w tej samej transakcji, w której zapisujemy fakturę. Numeracja zaczyna się od `0001` w każdym miesiącu ([model danych](../../architecture/overview.md)).",
    { apply: '"src/invoices/**"', date: "2026-11-02", labels: PL_DECISION },
);

const STORAGE_PL = `---
status: proposed
description: "Czy PDF-y faktur przechowujemy w bazie, czy w object storage."
---
# Przechowywanie PDF-ów faktur

## Kontekst

Każda faktura ma PDF, który klient pobiera przez lata.

## Opcje

1. **W bazie:** jedna kopia zapasowa, ale baza rośnie.
2. **W object storage:** tanio i bez limitu, ale druga usługa.

## Kto i kiedy rozstrzyga

Ola, przed krokiem 2.
`;

const OVERVIEW_PL = `---
description: "Architektura serwisu Faktury: komponenty i model danych."
---
# Przegląd

Serwis to jedno API z bazą PostgreSQL. Faktura ma numer, klienta, pozycje i PDF.
`;

const STEP1_PL = step(
    "01",
    "szkielet",
    "in-progress",
    "Wdrożone API, które wystawia fakturę z numerem.",
    "Sklep wystawia fakturę dla zamówienia przez API.",
    "- `POST /invoices` z numeracją według [decyzji](../decisions/domain/2026-11-02-invoice-numbering.md).",
    ["Faktura wystawiona przez API ma numer `FV/RRRR/MM/NNNN`."],
    {
        log: ["- 2026-11-02: Start; endpoint i numeracja w transakcji, sprawdzone testem równoległego wystawiania."],
        assignee: "user:ola",
        labels: PL_LABELS,
    },
);

const PL_CLAUDE = "# Faktury\n\n## Komendy\n\n- `npm test` uruchamia testy.\n";

function plProject(): Files {
    return {
        ".brain/README.md": PL_README,
        ".brain/decisions/process/2026-11-01-languages.md": LANGUAGES_PL,
        ".brain/decisions/process/2026-11-01-order-of-work.md": ORDER_PL,
        ".brain/decisions/domain/2026-11-02-invoice-numbering.md": NUMBERING_PL,
        ".brain/decisions/data/2026-11-03-invoice-pdf-storage.md": STORAGE_PL,
        ".brain/architecture/overview.md": OVERVIEW_PL,
        ".brain/steps/01-walking-skeleton.md": STEP1_PL,
        "CLAUDE.md": PL_CLAUDE,
        "src/invoices/number.ts": 'export function nextNumber(): string {\n  return "FV/2026/11/0001";\n}\n',
    };
}

// ------------------------------------------------------------------ after merging two branches

function merged(): Files {
    return {
        ".brain/README.md": EN_README.replace("[roadmap](roadmap.md)", "roadmap"),
        ".brain/decisions/process/2026-11-01-languages.md": LANGUAGES_EN,
        ".brain/decisions/process/2026-11-01-order-of-work.md": ORDER_EN,
        ".brain/decisions/infrastructure/2026-10-30-hosting-on-heroku.md": HEROKU.replace(
            "2026-11-02-hosting-on-fly-io",
            "2026-11-03-hosting-on-aws-ecs",
        ),
        ".brain/decisions/infrastructure/2026-11-03-hosting-on-aws-ecs.md": accepted(
            "Hosting on AWS ECS",
            "The API runs on AWS ECS Fargate in eu-central-1.",
            "The API runs on AWS ECS Fargate in eu-central-1, with RDS PostgreSQL.",
            {
                date: "2026-11-03",
                context: "Replaces [hosting on Heroku](2026-10-30-hosting-on-heroku.md): the free tier ended.",
            },
        ),
        ".brain/decisions/infrastructure/2026-11-03-hosting-on-fly-io.md": `---
status: proposed
description: "Whether the API moves from Heroku to AWS ECS or to Fly.io: two branches decided differently."
---
# Hosting on Fly.io or AWS ECS

## Context

This branch accepted hosting on Fly.io to replace [hosting on Heroku](2026-10-30-hosting-on-heroku.md), while the main branch accepted [hosting on AWS ECS](2026-11-03-hosting-on-aws-ecs.md) for the same purpose. The two contradict each other. Until this is resolved, the decision on the main branch binds, and \`superseded-by\` of the Heroku decision names it.

## Options

1. **AWS ECS:** keep the decision of the main branch.
2. **Fly.io:** accept this decision and supersede the AWS ECS decision.

## Who decides and when

Ana, before the deployment of step 1.
`,
        ".brain/decisions/api/2026-11-03-pagination.md": accepted(
            "Cursor pagination",
            "Lists are paginated with an opaque cursor, 50 items per page.",
            "Lists are paginated with an opaque cursor and 50 items per page.",
            { date: "2026-11-03" },
        ),
        ".brain/decisions/api/2026-11-03-rate-limits.md": accepted(
            "Rate limits",
            "Each user may make 100 requests per minute.",
            "Each user may make 100 requests per minute; above that the API answers `429`.",
            { date: "2026-11-03" },
        ),
        ".brain/steps/01-walking-skeleton.md": step(
            "01",
            "walking skeleton",
            "in-progress",
            "A deployed API that creates, lists and deletes notes.",
            "A deployed API with the three basic endpoints.",
            "- `POST /notes`, `GET /notes`, `DELETE /notes/{id}`.",
            ["The three endpoints answer on the deployed URL."],
            {
                log: [
                    "- 2026-11-02: Started; endpoints sketched.",
                    "- 2026-11-03: Pagination of `GET /notes` ([decision](../decisions/api/2026-11-03-pagination.md)).",
                    "- 2026-11-03: Rate limits ([decision](../decisions/api/2026-11-03-rate-limits.md)); export planned in [step 3](03-export.md).",
                ],
                assignee: "user:ana",
            },
        ),
        ".brain/steps/02-search.md": step(
            "02",
            "search",
            "draft",
            "Full-text search in notes.",
            "Users find notes by words in them.",
            "`GET /notes?q=`.",
            ["A note is found by a word of its body."],
        ),
        ".brain/steps/03-export.md": step(
            "03",
            "export",
            "draft",
            "Export of all notes of a user.",
            "Users take their notes with them.",
            "`GET /export` as a zip of markdown files.",
            ["The export holds every note of the user."],
        ),
        "CLAUDE.md": "# Notes API\n",
    };
}

// ------------------------------------------------------------------ cases

function cases(): CaseSpec[] {
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
                ".brain/risks.md": RISKS_EN + "\n# More risks\n",
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

function main(args: string[]): number {
    const check = args.includes("--check");
    const built = new Map(cases().map((c) => [`${c.name}.txtar`, build(c)]));
    const existing = readdirSync(OUT).filter((f) => f.endsWith(".txtar"));
    if (check) {
        const differ = [...built]
            .filter(([f, text]) => !existsSync(join(OUT, f)) || readFileSync(join(OUT, f), "utf8") !== text)
            .map(([f]) => f);
        const extra = existing.filter((f) => !built.has(f));
        for (const f of differ) console.log(`differs: spec/conformance/${f}`);
        for (const f of extra) console.log(`not built by this script: spec/conformance/${f}`);
        return differ.length || extra.length ? 1 : 0;
    }
    for (const f of existing) if (!built.has(f)) rmSync(join(OUT, f));
    for (const [f, text] of built) writeFileSync(join(OUT, f), text);
    console.log(`wrote ${built.size} cases to spec/conformance/`);
    return 0;
}

process.exitCode = main(process.argv.slice(2));
