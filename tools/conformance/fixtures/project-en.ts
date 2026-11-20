// A brain in English set up with the starter: every document kind, decisions in domain subdirectories,
// a rule with two globs and all instruction files.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { type Files, REPO } from "../build.ts";
import { accepted, DOMAINS_EN, INDEX_EMPTY, step } from "./documents.ts";

export const EN_README = `---
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

export const LANGUAGES_EN = accepted(
    "Languages of the work",
    "Code, identifiers, comments, log and error messages, commits, branch names and pull requests are in English.",
    "Code, identifiers, comments, log and error messages, commits, branch names and pull requests are in English. Documentation in the brain is in English, the language of the brain.",
    { apply: "always" },
);

export const ORDER_EN = readFileSync(join(REPO, "templates/order-of-work.md"), "utf8").replace(
    "<YYYY-MM-DD>",
    "2026-11-01",
);

export const SOFT_DELETE = accepted(
    "Soft delete of notes",
    "Deleting a note sets `deleted_at` instead of removing the row.",
    "Deleting a note sets `deleted_at` instead of removing the row, and a deleted note answers `404`. Queries and migrations filter on `deleted_at` ([overview](../../architecture/overview.md#data)).",
    {
        apply: '["src/notes/**", "*.sql"]',
        date: "2026-11-02",
        context: "Users restore notes deleted by mistake, and support needs the history of a note.",
    },
);

export const HEROKU = `---
status: superseded
decided: 2026-10-30
superseded-by: 2026-11-02-hosting-on-fly-io
description: "The API runs on Heroku."
---
# Hosting on Heroku

## Decision

The API runs on one Heroku dyno with Heroku Postgres.
`;

export const FLY = accepted(
    "Hosting on Fly.io",
    "The API runs on Fly.io, in one region close to most users.",
    "The API runs on Fly.io in one region close to most users, with a managed Postgres.",
    {
        date: "2026-11-02",
        context: "Replaces [hosting on Heroku](2026-10-30-hosting-on-heroku.md): the free tier ended.",
    },
);

export const GRAPHQL = `---
status: rejected
decided: 2026-11-02
description: "The API does not offer GraphQL; it stays REST only."
---
# GraphQL endpoint

## Decision

Rejected: the apps need only a few fixed queries, and one style of API is enough.
`;

export const DATABASE = `---
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

export const OVERVIEW_EN = `---
description: "Architecture of the Notes API: components, data and hosting."
---
# Overview

The API is one service in front of one database.

## Data

Notes are rows with an owner, a body and the timestamps \`created_at\`, \`updated_at\` and \`deleted_at\`.
`;

export const ROADMAP_EN = `---
description: "Phases of the Notes API and the gates between them."
---
# Roadmap

| Phase | Scope | Gate |
| --- | --- | --- |
| MVP | Create, list and delete notes | The web app uses the API |
| Sharing | Shared notes | [Step 2](steps/02-sharing.md) done |
`;

export const RISKS_EN = `---
description: "Risks of the Notes API with their impact and mitigation."
---
# Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Data loss | High | Daily backups, soft delete |
`;

export const STEP1_EN = step(
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

export const STEP2_EN = step(
    "02",
    "sharing",
    "draft",
    "Notes shared with other users.",
    "Users share a note with other users.",
    "Sharing by email address.",
    ["A shared note is visible to the other user."],
);

export function enProject(): Files {
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
