// A brain after merging two branches that each added a decision and a step.
import type { Files } from "../build.ts";
import { accepted, step } from "./documents.ts";
import { EN_README, HEROKU, LANGUAGES_EN, ORDER_EN } from "./project-en.ts";

export function merged(): Files {
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
