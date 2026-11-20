// The rule files next to the root instruction files: the rule file of the brain (the work on the brain of the
// compact form) and one file for each rule with a glob, in `.claude/rules/`, `.github/instructions/` and
// `<brain>/AGENTS.md`; and the removal of generated rule files that are no longer wanted.
import { posix } from "node:path";
import { brainWorkForm } from "../contract.ts";
import { type Brain, dirOf, joinPath, type Repo, str } from "../repo.ts";
import { effectiveRules, type Rule } from "../rules.ts";
import { type BlockParts, containsManagedBlock, renderBlock, ruleEntry } from "./managed-block.ts";
import type { View } from "./view.ts";

function ruleFileView(served: Brain, path: string, frontmatter: string, rule: Rule, inputs: string[]): View {
    const version = str(served.manifest.spec) ?? "";
    const generated: BlockParts = {
        prefix: "",
        rulesHeading: null,
        rules: [ruleEntry(rule, dirOf(path))],
        globHeading: null,
        globs: [],
        spec: null,
    };
    const expected = `${frontmatter}${renderBlock(version, generated)}\n`;
    return {
        path,
        name: "rule file",
        inputs,
        upToDate: (actual) => actual === expected,
        desired: () => ({ content: expected, notes: [] }),
    };
}

/** The rule file of the brain: the work on the brain of the compact form, read in the brain directory. */
function brainRuleFileView(served: Brain, path: string, frontmatter: string, inputs: string[]): View {
    const version = str(served.manifest.spec) ?? "";
    const generated: BlockParts = {
        prefix: brainWorkForm({ brainPath: served.dir, description: str(served.manifest.description) ?? "" }),
        rulesHeading: null,
        rules: [],
        globHeading: null,
        globs: [],
        spec: null,
    };
    const expected = `${frontmatter}${renderBlock(version, generated)}\n`;
    return {
        path,
        name: "rule file of the brain",
        inputs,
        upToDate: (actual) => actual === expected,
        desired: () => ({ content: expected, notes: [] }),
    };
}

function staleView(path: string): View {
    return {
        path,
        name: "out-of-date generated file",
        inputs: [],
        upToDate: (actual) => actual === null,
        desired: () => ({ content: null, notes: [] }),
    };
}

interface RuleDir {
    enabled: boolean;
    dir: string;
    brainFile: string;
    brainFm: string;
    name: (r: Rule) => string;
    fm: (globs: string[]) => string;
}

function ruleDirs(repo: Repo, brain: Brain): RuleDir[] {
    return [
        {
            enabled: repo.read("CLAUDE.md") !== null,
            dir: ".claude/rules",
            brainFile: `${brain.name}.md`,
            brainFm: `---\npaths:\n  - "${brain.dir}/**"\n---\n`,
            name: (r) => `${brain.name}-${posix.basename(r.doc.rel, ".md")}.md`,
            fm: (gs) => `---\npaths:\n${gs.map((x) => `  - "${x.includes("/") ? x : `/${x}`}"`).join("\n")}\n---\n`,
        },
        {
            enabled: repo.read(".github/copilot-instructions.md") !== null,
            dir: ".github/instructions",
            brainFile: `${brain.name}.instructions.md`,
            brainFm: `---\napplyTo: "${brain.dir}/**"\n---\n`,
            name: (r) => `${brain.name}-${posix.basename(r.doc.rel, ".md")}.instructions.md`,
            fm: (gs) => `---\napplyTo: "${gs.join(",")}"\n---\n`,
        },
    ];
}

export function ruleFileViews(repo: Repo, brain: Brain): View[] {
    const views: View[] = [];
    const globs = effectiveRules(brain).filter((r) => !r.always);
    for (const rd of ruleDirs(repo, brain)) {
        const wanted = new Set<string>();
        if (rd.enabled) {
            const path = `${rd.dir}/${rd.brainFile}`;
            wanted.add(path);
            views.push(brainRuleFileView(brain, path, rd.brainFm, [brain.readme.path]));
            for (const r of globs) {
                const path = `${rd.dir}/${rd.name(r)}`;
                wanted.add(path);
                views.push(ruleFileView(brain, path, rd.fm(r.globs), r, [brain.readme.path, r.doc.path]));
            }
        }
        for (const f of repo.files) {
            if (dirOf(f) === rd.dir && !wanted.has(f) && containsManagedBlock(repo.read(f))) views.push(staleView(f));
        }
    }
    const nested = joinPath(brain.dir, "AGENTS.md");
    if (repo.read("AGENTS.md") !== null) {
        views.push(brainRuleFileView(brain, nested, "", [brain.readme.path]));
    } else if (containsManagedBlock(repo.read(nested))) {
        views.push(staleView(nested));
    }
    return views;
}
