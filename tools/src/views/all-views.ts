// Every generated view of a repository, in the order `index` writes them.
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
