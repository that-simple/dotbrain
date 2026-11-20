// The questions of `init`: what the wizard asks, the default answers and the check of each answer.
import { execFileSync } from "node:child_process";
import { basename, resolve } from "node:path";
import { BCP47, KEBAB, validDate } from "../lint.ts";

export class InitError extends Error {}

export type Answers = Record<string, string>;

export interface Question {
    key: string;
    prompt: string;
    /** Asked by the wizard; the others are only taken from options. */
    asked: boolean;
    choices?: string[];
    default: (root: string) => string | null;
    /** The reason the answer is not valid, or null. */
    check: (value: string) => string | null;
}

const singleLine = (what: string) => (v: string) =>
    v === "" ? `${what} must not be empty` : /[\r\n]/.test(v) ? `${what} must be one line` : null;

const oneOf = (choices: string[]) => (v: string) =>
    choices.includes(v) ? null : `answer one of: ${choices.join(", ")}`;

function today(): string {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function gitUserName(root: string): string | null {
    try {
        const name = execFileSync("git", ["-C", root, "config", "user.name"], {
            encoding: "utf8",
            stdio: ["ignore", "pipe", "ignore"],
        }).trim();
        return name === "" ? null : name;
    } catch {
        return null;
    }
}

export const QUESTIONS: Question[] = [
    {
        key: "name",
        prompt: "Name of the brain (kebab-case, usually the name of the repository)",
        asked: true,
        default: (root) => {
            const name = basename(resolve(root))
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");
            return name === "" ? null : name;
        },
        check: (v) => (KEBAB.test(v) ? null : `"${v}" is not lowercase kebab-case (for example my-project)`),
    },
    {
        key: "lang",
        prompt: "Language of the brain (BCP 47 tag, for example en or pl)",
        asked: true,
        default: () => "en",
        check: (v) => (BCP47.test(v) ? null : `"${v}" is not a BCP 47 tag (for example en, pl or pt-BR)`),
    },
    {
        key: "owner",
        prompt: "Owner of the brain (a person or a role)",
        asked: true,
        default: gitUserName,
        check: singleLine("the owner"),
    },
    {
        key: "description",
        prompt: "One sentence describing the project",
        asked: true,
        default: () => null,
        check: singleLine("the description"),
    },
    {
        key: "languages",
        prompt: "Language of code, comments, commits, branch names and pull requests",
        asked: true,
        default: () => "English",
        check: singleLine("the language"),
    },
    {
        key: "order",
        prompt: "Order of work: changes to the brain in the same pull request as the work, or to the main branch in a separate pull request before it",
        asked: true,
        choices: ["with-the-work", "before-the-work"],
        default: () => "with-the-work",
        check: oneOf(["with-the-work", "before-the-work"]),
    },
    {
        key: "step-ids",
        prompt: "Are steps named by the keys of their tickets in the issue tracker instead of numbers",
        asked: true,
        choices: ["no", "yes"],
        default: () => "no",
        check: oneOf(["no", "yes"]),
    },
    {
        key: "date",
        prompt: "Date of the first decisions (YYYY-MM-DD)",
        asked: false,
        default: () => today(),
        // The same rule `lint` applies to the `decided` date the answer goes into.
        check: (v) => (validDate(v) ? null : `"${v}" is not a date YYYY-MM-DD`),
    },
];

export const QUESTION_KEYS = new Set(QUESTIONS.map((q) => q.key));
