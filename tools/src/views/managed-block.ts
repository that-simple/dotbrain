// The managed block of a root instruction file: the core of the agent contract, the tool add-on, the rules of
// the brain with `apply: always` and the list of rules with a glob. `renderBlock` also renders the rule files.
import { compactForm, toolAddon } from "../contract.ts";
import { type Brain, dirOf, joinPath, type Repo, relLink, str } from "../repo.ts";
import { effectiveRules, type Rule, ruleText } from "../rules.ts";
import { findBlock, type View } from "./view.ts";

const MANAGED_COMMENT =
    "<!-- Managed block: generated from the agent contract and the brain. Do not edit by hand; change the brain and regenerate. Text outside this block must not contradict the brain. -->";
const MANAGED_BEGIN = /^<!-- BEGIN:dotbrain (?!index -->)(?!status -->)\S+ -->$/;
export const MANAGED_END = "<!-- END:dotbrain -->";

interface RuleEntry {
    title: string;
    text: string;
    source: string; // "[<path>](<link>)"
}

export interface BlockParts {
    prefix: string;
    rulesHeading: string | null;
    rules: RuleEntry[];
    globHeading: string | null;
    globs: string[];
    spec: string | null; // "[dotbrain <v>](<link>)"
}

export function renderBlock(version: string, p: BlockParts): string {
    const parts: string[] = [];
    if (p.prefix !== "") parts.push(p.prefix);
    if (p.rules.length) {
        if (p.rulesHeading !== null) parts.push(p.rulesHeading);
        for (const r of p.rules) parts.push(`### ${r.title}`, r.text, `Source: ${r.source}`);
    }
    if (p.globs.length) {
        if (p.globHeading !== null) parts.push(p.globHeading);
        parts.push(p.globs.join("\n"));
    }
    if (p.spec !== null) parts.push(`Specification: ${p.spec}`);
    return [
        `<!-- BEGIN:dotbrain ${version} -->`,
        MANAGED_COMMENT,
        "",
        parts.filter((x) => x !== "").join("\n\n"),
        MANAGED_END,
    ].join("\n");
}

export function containsManagedBlock(text: string | null): boolean {
    return (text ?? "").split("\n").some((line) => MANAGED_BEGIN.test(line));
}

function specLink(repo: Repo, fromDir: string, version: string): string {
    const spec = repo.read("spec/README.md");
    if (spec !== null && /^# dotbrain specification\b/m.test(spec)) return relLink(fromDir, "spec/README.md");
    return `https://github.com/that-simple/dotbrain/blob/spec-v${version}/spec/README.md`;
}

export function ruleEntry(rule: Rule, fromDir: string): RuleEntry {
    return {
        title: rule.doc.title ?? "",
        text: ruleText(rule, fromDir),
        source: `[${rule.doc.rel}](${relLink(fromDir, rule.doc.path)})`,
    };
}

function rootBlockParts(repo: Repo, served: Brain, file: string): BlockParts {
    const dir = dirOf(file);
    const version = str(served.manifest.spec) ?? "";
    const contract = compactForm({ brainPath: served.dir, description: str(served.manifest.description) ?? "" });
    const tool = toolAddon(file.slice(file.lastIndexOf("/") + 1));
    const rules = effectiveRules(served);
    const always = rules.filter((r) => r.always);
    const globs = rules
        .filter((r) => !r.always)
        .flatMap((r) => r.globs.map((glob) => `- \`${glob}\`: [${r.doc.title ?? ""}](${relLink(dir, r.doc.path)})`));
    if (file === "AGENTS.md") {
        globs.unshift(
            `- \`${served.dir}/**\`: [Work on the brain](${relLink(dir, joinPath(served.dir, "AGENTS.md"))})`,
        );
    }
    return {
        prefix: [contract, tool].filter((x) => x !== null).join("\n\n"),
        rulesHeading: "## Rules for this brain",
        rules: always.map((r) => ruleEntry(r, dir)),
        globHeading: "## Rules for specific files",
        globs,
        spec: `[dotbrain ${version}](${specLink(repo, dir, version)})`,
    };
}

export function managedBlockView(repo: Repo, served: Brain, file: string, inputs: string[]): View {
    const version = str(served.manifest.spec) ?? "";
    const expected = renderBlock(version, rootBlockParts(repo, served, file));
    const current = (actual: string | null) => {
        if (actual === null) return null;
        const lines = actual.split("\n");
        const found = findBlock(lines, (l) => MANAGED_BEGIN.test(l), MANAGED_END);
        return found
            ? { lines, found, block: lines.slice(found[0], found[1] + 1) }
            : { lines, found: null, block: null };
    };
    return {
        path: file,
        name: "managed block",
        inputs,
        upToDate: (actual) => {
            const c = current(actual);
            if (!c?.block) return false;
            return c.block.join("\n") === expected;
        },
        desired: (actual) => {
            const notes: string[] = [];
            const c = current(actual);
            if (!c) return { content: null, notes };
            const block = expected;
            const lines = c.lines;
            if (c.found) {
                lines.splice(c.found[0], c.found[1] - c.found[0] + 1, ...block.split("\n"));
            } else {
                const h = lines.findIndex((l) => /^#{1,6} /.test(l));
                const at = h === -1 ? 0 : h + 1;
                const insert = [...(h === -1 ? [] : [""]), ...block.split("\n")];
                if (lines[at] !== undefined && lines[at]!.trim() !== "") insert.push("");
                lines.splice(at, 0, ...insert);
            }
            return { content: lines.join("\n"), notes };
        },
    };
}
