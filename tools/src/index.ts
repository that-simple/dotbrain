import { mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { evaluateViews, lint, type Violation } from "./lint.ts";
import { loadRepo } from "./repo.ts";

export interface IndexResult {
    /** Views that are out of date (in check mode) or were written. */
    changed: string[];
    /** Views that could not be generated, with the reason. */
    skipped: string[];
    notes: string[];
}

export function runIndex(root: string, options: { check: boolean }): IndexResult {
    const repo = loadRepo(root);
    const violations: Violation[] = lint(repo).violations.filter((v) => v.rule !== "V-VIEWS");
    const result: IndexResult = { changed: [], skipped: [], notes: [] };
    for (const r of evaluateViews(repo, violations)) {
        if (r.status === "tainted") {
            result.skipped.push(`${r.view.path}: the ${r.view.name} is not generated until ${r.reason} is fixed`);
            continue;
        }
        if (r.status === "up-to-date") continue;
        result.changed.push(r.view.path);
        if (options.check) continue;
        const file = join(root, r.view.path);
        const actual = existsSync(file) ? readFileSync(file, "utf8") : null;
        const outcome = r.view.desired(actual);
        result.notes.push(...outcome.notes);
        if (outcome.content === null) {
            if (actual !== null) rmSync(file);
        } else {
            mkdirSync(dirname(file), { recursive: true });
            writeFileSync(file, outcome.content);
        }
    }
    return result;
}
