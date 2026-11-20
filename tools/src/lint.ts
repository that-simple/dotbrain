import { posix } from "node:path";
import { headings, isRelativeTarget, linkTargets, sectionContent, sectionCounts } from "./markdown.ts";
import {
    compareCodePoints,
    DECISION_NAME,
    dirOf,
    ROOT_INSTRUCTION_FILES,
    str,
    type Brain,
    type Document,
    type Repo,
} from "./repo.ts";
import { applyValue, effectiveRules, wordCount, ruleText } from "./rules.ts";
import { allViews, TAINTING_RULES, type View } from "./views.ts";

export type Severity = "error" | "warning";

export interface Violation {
    rule: string;
    path: string;
    message: string;
}

/** The version of the specification this implementation checks (spec/README.md). */
export const SPEC_VERSION = "1.0.0";

export const SEVERITY: Record<string, Severity> = {
    "V-CONTENT": "warning",
    "V-BUDGET": "warning",
};

export function severity(rule: string): Severity {
    return SEVERITY[rule] ?? "error";
}

const DECISION_STATUSES = ["proposed", "accepted", "rejected", "superseded"];
const STEP_STATUSES = ["draft", "agreed", "in-progress", "done"];
export const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const BCP47 = /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/;
// A step is named by its number (two digits or more) or by the key of its ticket in lowercase.
const STEP_NAME = /^(?:(\d{2,})|([a-z][a-z0-9]*-\d+))-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;

export function validDate(text: string | undefined): boolean {
    if (text === undefined) return false;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
    if (!m) return false;
    const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
    const date = new Date(Date.UTC(y, mo - 1, d));
    return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d;
}

export interface LintResult {
    violations: Violation[];
    notes: string[];
}

export function lint(repo: Repo): LintResult {
    const v: Violation[] = [];
    const notes: string[] = [];
    const add = (rule: string, path: string, message: string) => v.push({ rule, path, message });

    if (repo.brain === null) {
        notes.push("no brain found: the repository has no .brain/README.md");
    } else {
        checkManifest(repo.brain, add);
        checkBrain(repo, repo.brain, add);
        checkBudget(repo, repo.brain, add);
    }

    const result = checkViews(repo, v);
    v.push(...result.violations);
    notes.push(...result.notes);
    return { violations: dedupe(v), notes };
}

function dedupe(v: Violation[]): Violation[] {
    const seen = new Set<string>();
    return v
        .filter((x) => {
            const key = `${x.rule}\0${x.path}\0${x.message}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        })
        .sort((a, b) => compareCodePoints(a.path, b.path) || compareCodePoints(a.rule, b.rule));
}

type Add = (rule: string, path: string, message: string) => void;

function checkManifest(b: Brain, add: Add) {
    const m = b.manifest;
    const p = b.readme.path;
    if (b.readme.frontmatterError) add("V-MANIFEST", p, `manifest cannot be read: ${b.readme.frontmatterError}`);
    for (const field of ["brain", "lang", "spec", "description"]) {
        const value = str(m[field]);
        if (value === undefined || value.trim() === "") add("V-MANIFEST", p, `manifest has no \`${field}\``);
    }
    const name = str(m.brain);
    if (name !== undefined && name !== "" && !KEBAB.test(name))
        add("V-MANIFEST", p, `\`brain\` "${name}" is not lowercase kebab-case`);
    const lang = str(m.lang);
    if (lang && !BCP47.test(lang)) add("V-MANIFEST", p, `\`lang\` "${lang}" is not a BCP 47 tag`);
    const spec = str(m.spec);
    if (spec !== undefined && spec !== "" && spec !== SPEC_VERSION)
        add("V-MANIFEST", p, `\`spec\` "${spec}" is not ${SPEC_VERSION}`);
}

function checkBrain(repo: Repo, brain: Brain, add: Add) {
    // V-NAMES and V-CONTENT.
    const badDirs = new Set<string>();
    for (const f of brain.files) {
        const rel = f.slice(brain.dir.length + 1);
        const parts = rel.split("/");
        for (let i = 0; i < parts.length - 1; i++) {
            if (!/^[a-z0-9-]+$/.test(parts[i]!)) {
                const d = parts.slice(0, i + 1).join("/");
                if (!badDirs.has(d)) {
                    badDirs.add(d);
                    add("V-NAMES", `${brain.dir}/${d}`, `directory name "${parts[i]}" is not lowercase kebab-case`);
                }
            }
        }
        const name = parts[parts.length - 1]!;
        const ok =
            name === "README.md" ||
            (f.endsWith(".md") ? /^[a-z0-9-]+\.md$/.test(name) : /^[a-z0-9-]+(?:\.[a-z0-9]+)?$/.test(name));
        if (!ok) add("V-NAMES", f, `file name "${name}" is not lowercase kebab-case`);
        if (!f.endsWith(".md"))
            add("V-CONTENT", f, "the file is not a markdown document; keep raw material at its source and link to it");
    }

    // Per document.
    const decisionIds = new Map<string, Document[]>();
    const stepIds = new Map<string, Document[]>();
    for (const doc of brain.docs) {
        checkDocument(repo, doc, add);
        if (doc.rel.startsWith("decisions/") && doc.rel !== "decisions/README.md") {
            const name = posix.basename(doc.rel);
            const m = DECISION_NAME.exec(name);
            if (!m || !validDate(`${m[1]}-${m[2]}-${m[3]}`)) {
                add("V-DECISION", doc.path, `"${name}" is not named YYYY-MM-DD-slug.md with a valid date`);
            } else {
                const id = name.slice(0, -3);
                decisionIds.set(id, [...(decisionIds.get(id) ?? []), doc]);
            }
        }
        if (doc.rel.startsWith("steps/")) {
            const m = STEP_NAME.exec(posix.basename(doc.rel));
            if (!m)
                add("V-STEP", doc.path, `"${posix.basename(doc.rel)}" is not named NN-slug.md or <ticket-key>-slug.md`);
            else {
                const id = m[1] !== undefined ? `number ${Number(m[1])}` : `ticket key ${m[2]}`;
                stepIds.set(id, [...(stepIds.get(id) ?? []), doc]);
            }
        }
    }
    for (const [id, docs] of decisionIds) {
        if (docs.length > 1)
            for (const d of docs) add("V-DECISION", d.path, `the ID ${id} is used by ${docs.length} decisions`);
    }
    for (const [id, docs] of stepIds) {
        if (docs.length > 1)
            for (const d of docs) add("V-STEP", d.path, `the step ${id} is used by ${docs.length} steps`);
    }
    for (const doc of brain.docs) {
        if (doc.kind === "decision") checkDecision(brain, doc, new Set(decisionIds.keys()), add);
        if (doc.rel.startsWith("steps/")) checkStep(brain, doc, add);
    }
}

function checkDocument(repo: Repo, doc: Document, add: Add) {
    if (!doc.hasFrontmatter) add("V-FRONTMATTER", doc.path, "the document has no frontmatter");
    else if (doc.frontmatterError)
        add("V-FRONTMATTER", doc.path, `the frontmatter cannot be read: ${doc.frontmatterError}`);
    else {
        const d = doc.fm.description;
        if (typeof d !== "string" || d.trim() === "")
            add("V-FRONTMATTER", doc.path, "the frontmatter has no `description`");
    }

    const hs = headings(doc.body);
    const h1 = hs.filter((h) => h.level === 1);
    if (h1.length !== 1) add("V-TITLE", doc.path, `the document has ${h1.length} H1 headings`);
    else if (hs[0]!.level !== 1) add("V-TITLE", doc.path, "the first heading is not the H1 title");

    if (doc.fm.apply !== undefined && applyValue(doc) === null)
        add("V-APPLY", doc.path, "`apply` is not `always`, a glob or a non-empty list of globs");

    for (const target of linkTargets(doc.body)) {
        if (!isRelativeTarget(target)) continue;
        let path = target.split("#")[0]!.split("?")[0]!;
        if (path === "") continue;
        try {
            path = decodeURI(path);
        } catch {
            // keep as written
        }
        const resolved = posix.normalize(posix.join(dirOf(doc.path) || ".", path)).replace(/\/$/, "");
        if (resolved.startsWith("..") || !repo.exists(resolved === "." ? "" : resolved))
            add("V-LINKS", doc.path, `the link "${target}" points to a missing file`);
    }
}

function checkDecision(brain: Brain, doc: Document, ids: Set<string>, add: Add) {
    const status = doc.fm.status;
    if (typeof status !== "string" || !DECISION_STATUSES.includes(status)) {
        add("V-DECISION", doc.path, "`status` is not one of proposed, accepted, rejected, superseded");
        return;
    }
    if (status !== "proposed" && !validDate(str(doc.fm.decided)))
        add("V-DECISION", doc.path, "`decided` is missing or not a valid date");
    const by = doc.fm["superseded-by"];
    if (status === "superseded") {
        if (typeof by !== "string" || !ids.has(by))
            add("V-DECISION", doc.path, "`superseded-by` does not name an existing decision");
    } else if (by !== undefined) {
        add("V-DECISION", doc.path, "`superseded-by` appears without `status: superseded`");
    }
    const required = status === "proposed" ? ["context", "options", "decider"] : ["decision"];
    checkSections(brain, doc, required, add);
}

function checkStep(brain: Brain, doc: Document, add: Add) {
    const status = doc.fm.status;
    if (typeof status !== "string" || !STEP_STATUSES.includes(status))
        add("V-STEP", doc.path, "`status` is not one of draft, agreed, in-progress, done");
    checkSections(brain, doc, ["goal", "scope", "acceptance"], add);
    const log = sectionContent(doc.body, brain.label("log"));
    if (log === null) return;
    for (const line of log.split("\n")) {
        if (line.trim() === "" || /^\s/.test(line)) continue;
        const m = /^- (\d{4}-\d{2}-\d{2}): /.exec(line);
        if (!m || !validDate(m[1])) {
            add("V-STEP", doc.path, `the log entry "${line.slice(0, 40)}" does not start with "- YYYY-MM-DD: "`);
        }
    }
}

function checkSections(brain: Brain, doc: Document, keys: string[], add: Add) {
    const counts = sectionCounts(doc.body);
    for (const key of keys) {
        const n = counts.get(brain.label(key)) ?? 0;
        if (n !== 1) add("V-SECTIONS", doc.path, `the section "${brain.label(key)}" (${key}) appears ${n} times`);
    }
}

function checkBudget(repo: Repo, brain: Brain, add: Add) {
    if (!ROOT_INSTRUCTION_FILES.some((f) => repo.read(f) !== null)) return;
    const always = effectiveRules(brain).filter((r) => r.always);
    if (always.length > 10)
        add("V-BUDGET", brain.readme.path, `${always.length} rules with \`apply: always\` (at most 10)`);
    for (const r of always) {
        const words = wordCount(ruleText(r, ""));
        if (words > 150) add("V-BUDGET", r.doc.path, `the rule has ${words} words (at most 150)`);
    }
}

export interface ViewResult {
    view: View;
    status: "up-to-date" | "stale" | "tainted";
    reason?: string;
}

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

function checkViews(repo: Repo, violations: Violation[]): { violations: Violation[]; notes: string[] } {
    const out: Violation[] = [];
    const notes: string[] = [];
    for (const r of evaluateViews(repo, violations)) {
        if (r.status === "stale") {
            const missing = repo.read(r.view.path) === null;
            out.push({
                rule: "V-VIEWS",
                path: r.view.path,
                message: missing ? `the ${r.view.name} is missing` : `the ${r.view.name} is out of date`,
            });
        } else if (r.status === "tainted") {
            notes.push(`${r.view.path}: the ${r.view.name} is not checked until ${r.reason} is fixed`);
        }
    }
    return { violations: out, notes };
}
