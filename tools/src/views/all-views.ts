// Every generated view of a repository, in the order `index` writes them.
import type { Violation } from "../lint.ts";
import { ROOT_INSTRUCTION_FILES, type Repo } from "../repo.ts";
import { effectiveRules } from "../rules.ts";
import { decisionListView } from "./decision-list.ts";
import { indexBlockView } from "./index-block.ts";
import { managedBlockView } from "./managed-block.ts";
import { ruleFileViews } from "./rule-files.ts";
import { statusLineViews } from "./status-line.ts";
import type { View } from "./view.ts";

/** Violations of these rules in an input of a view stop the view from being generated or checked. */
export const TAINTING_RULES = ["V-FRONTMATTER", "V-TITLE", "V-DECISION", "V-STEP", "V-SECTIONS", "V-APPLY"];

export function allViews(repo: Repo): View[] {
    const brain = repo.brain;
    if (!brain) return [];
    const views: View[] = [decisionListView(brain), indexBlockView(brain), ...statusLineViews(brain)];
    const inputs = [brain.readme.path, ...effectiveRules(brain).map((r) => r.doc.path)];
    for (const file of ROOT_INSTRUCTION_FILES) {
        if (repo.read(file) !== null) views.push(managedBlockView(repo, brain, file, inputs));
    }
    views.push(...ruleFileViews(repo, brain));
    return views;
}

export interface ViewResult {
    view: View;
    status: "up-to-date" | "stale" | "tainted";
    reason?: string;
}

/** Each view, up to date, stale, or tainted: not generated or checked while an input breaks a tainting rule. */
export function evaluateViews(repo: Repo, violations: Violation[]): ViewResult[] {
    const readme = repo.brain?.readme.path;
    const tainted = (view: View): string | null => {
        for (const input of view.inputs) {
            const rules = input === readme ? ["V-MANIFEST"] : TAINTING_RULES;
            const hit = violations.find((x) => x.path === input && rules.includes(x.rule));
            if (hit) return `${hit.rule} ${hit.path}`;
        }
        return null;
    };
    return allViews(repo).map((view) => {
        const t = tainted(view);
        if (t) return { view, status: "tainted", reason: t };
        return { view, status: view.upToDate(repo.read(view.path)) ? "up-to-date" : "stale" };
    });
}
