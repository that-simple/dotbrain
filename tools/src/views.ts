import { posix } from "node:path";
import { brainWorkForm, compactForm, toolAddon } from "./contract.ts";
import { headings, splitFrontmatter } from "./markdown.ts";
import {
  compareCodePoints,
  DECISION_NAME,
  dirOf,
  joinPath,
  relLink,
  ROOT_INSTRUCTION_FILES,
  str,
  strList,
  type Brain,
  type Document,
  type Repo,
} from "./repo.ts";
import { effectiveRules, ruleText, type Rule } from "./rules.ts";

export const TAINTING_RULES = ["V-FRONTMATTER", "V-TITLE", "V-DECISION", "V-STEP", "V-SECTIONS", "V-APPLY"];

export interface Outcome {
  content: string | null;
  notes: string[];
}

export interface View {
  path: string;
  name: string;
  /** Paths of the documents the view is built from. */
  inputs: string[];
  upToDate: (actual: string | null) => boolean;
  desired: (actual: string | null) => Outcome;
}

const MANAGED_COMMENT =
  "<!-- Managed block: generated from the agent contract and the brain. Do not edit by hand; change the brain and regenerate. Text outside this block must not contradict the brain. -->";
const INDEX_BEGIN = "<!-- BEGIN:dotbrain index -->";
const INDEX_END = "<!-- END:dotbrain index -->";
const STATUS_BEGIN = "<!-- BEGIN:dotbrain status -->";
const STATUS_END = "<!-- END:dotbrain status -->";
const MANAGED_BEGIN = /^<!-- BEGIN:dotbrain (?!index -->)(?!status -->)\S+ -->$/;
const MANAGED_END = "<!-- END:dotbrain -->";

function description(doc: Document): string {
  return str(doc.fm.description) ?? "";
}

// ---------------------------------------------------------------- decision list

export function decisionDocs(brain: Brain): Document[] {
  return brain.docs.filter((d) => d.rel.startsWith("decisions/") && DECISION_NAME.test(posix.basename(d.rel)));
}

export function decisionListDescription(brain: Brain): string {
  const l = brain.label;
  return `${l("decisions")}: ${l("proposed")}, ${l("accepted")}, ${l("rejected")}, ${l("superseded")}`;
}

export function generateDecisionList(brain: Brain): string {
  const l = brain.label;
  const decisions = decisionDocs(brain).map((d) => ({
    doc: d,
    id: posix.basename(d.rel, ".md"),
    path: d.rel.slice("decisions/".length),
  }));
  const byId = new Map(decisions.map((d) => [d.id, d]));
  const out = [
    "---",
    `description: "${decisionListDescription(brain)}"`,
    "---",
    `# ${l("decisions")}`,
    "",
    "<!-- Generated from decision frontmatter. Do not edit by hand; regenerate on conflict. -->",
  ];
  for (const status of ["proposed", "accepted", "rejected", "superseded"]) {
    const group = decisions
      .filter((d) => d.doc.fm.status === status)
      .sort((a, b) => compareCodePoints(a.id, b.id));
    if (group.length === 0) continue;
    out.push("", `## ${l(status)}`, "");
    for (const d of group) {
      let line = `- [${d.doc.title ?? ""}](${d.path}): ${description(d.doc)}`;
      if (status !== "proposed") line += ` (${str(d.doc.fm.decided) ?? ""})`;
      if (status === "superseded") {
        const by = str(d.doc.fm["superseded-by"]) ?? "";
        line += ` → [${by}](${byId.get(by)?.path ?? ""})`;
      }
      out.push(line);
    }
  }
  return out.join("\n") + "\n";
}

// ---------------------------------------------------------------- index block

export function indexedDocs(brain: Brain): Document[] {
  return brain.docs.filter((d) => d.kind !== "index" && d.kind !== "decision");
}

export function generateIndexBlock(brain: Brain): string {
  const entries = indexedDocs(brain).map((d) => ({
    rel: d.rel,
    description:
      (d.rel === "decisions/README.md" ? decisionListDescription(brain) : description(d)) +
      (d.kind === "step" ? ` (\`${str(d.fm.status) ?? ""}\`)` : ""),
  }));
  if (!entries.some((e) => e.rel === "decisions/README.md")) {
    entries.push({ rel: "decisions/README.md", description: decisionListDescription(brain) });
  }
  const groups = new Map<string, typeof entries>();
  for (const e of entries) {
    const dir = dirOf(e.rel);
    groups.set(dir, [...(groups.get(dir) ?? []), e]);
  }
  const dirs = [...groups.keys()].sort((a, b) => (a === "" ? -1 : b === "" ? 1 : compareCodePoints(a, b)));
  const blocks: string[] = [];
  for (const dir of dirs) {
    const lines = groups
      .get(dir)!
      .sort((a, b) => compareCodePoints(posix.basename(a.rel), posix.basename(b.rel)))
      .map((e) => {
        const text = posix.basename(e.rel) === "README.md" ? e.rel : posix.basename(e.rel);
        return `- [${text}](${e.rel}): ${e.description}`;
      });
    blocks.push((dir === "" ? "" : `\`${dir}/\`:\n\n`) + lines.join("\n"));
  }
  return [
    INDEX_BEGIN,
    "<!-- Generated from document frontmatter. Do not edit by hand; regenerate on conflict. -->",
    ...(blocks.length ? ["", blocks.join("\n\n")] : []),
    INDEX_END,
  ].join("\n");
}

// ---------------------------------------------------------------- status line of a step

export function stepDocs(brain: Brain): Document[] {
  return brain.docs.filter((d) => d.kind === "step");
}

export function generateStatusBlock(brain: Brain, doc: Document): string {
  const l = brain.label;
  const who = strList(doc.fm.assignee) ?? [];
  let line = `${l("status")}: \`${str(doc.fm.status) ?? ""}\``;
  if (who.length) line += ` · ${l("assignee")}: ${who.join(", ")}`;
  return [STATUS_BEGIN, line, STATUS_END].join("\n");
}

function spliceStatusBlock(text: string, block: string): string {
  const lines = text.split("\n");
  const found = findBlock(lines, (l) => l === STATUS_BEGIN, STATUS_END);
  if (found) {
    lines.splice(found[0], found[1] - found[0] + 1, ...block.split("\n"));
    return lines.join("\n");
  }
  // Directly after the title, separated by a blank line.
  const body = splitFrontmatter(text);
  const bodyStart = text.slice(0, text.length - body.body.length).split("\n").length - 1;
  const h1 = headings(body.body).find((h) => h.level === 1);
  const at = h1 ? bodyStart + h1.line + 1 : bodyStart;
  const after = lines[at] === "" || at >= lines.length ? [] : [""];
  lines.splice(at, 0, "", ...block.split("\n"), ...after);
  return lines.join("\n");
}

function findBlock(lines: string[], isBegin: (l: string) => boolean, end: string): [number, number] | null {
  const a = lines.findIndex(isBegin);
  if (a === -1) return null;
  const b = lines.indexOf(end, a + 1);
  if (b === -1) return null;
  return [a, b];
}

function spliceIndexBlock(text: string, block: string): string {
  const lines = text.split("\n");
  const found = findBlock(lines, (l) => l === INDEX_BEGIN, INDEX_END);
  if (found) {
    lines.splice(found[0], found[1] - found[0] + 1, ...block.split("\n"));
    return lines.join("\n");
  }
  // After the hand-written description: before the first H2 after the title, or at the end.
  const body = splitFrontmatter(text);
  const offset = text.length - body.body.length;
  const bodyStart = text.slice(0, offset).split("\n").length - 1;
  const hs = headings(body.body);
  const h1 = hs.find((h) => h.level === 1);
  const h2 = hs.find((h) => h.level === 2 && (!h1 || h.line > h1.line));
  if (h2) {
    lines.splice(bodyStart + h2.line, 0, ...block.split("\n"), "");
    return lines.join("\n");
  }
  const trimmed = text.replace(/\n*$/, "");
  return `${trimmed}\n\n${block}\n`;
}

// ---------------------------------------------------------------- managed blocks

interface RuleEntry {
  title: string;
  text: string;
  source: string; // "[<path>](<link>)"
}

interface BlockParts {
  prefix: string;
  rulesHeading: string | null;
  rules: RuleEntry[];
  globHeading: string | null;
  globs: string[];
  spec: string | null; // "[dotbrain <v>](<link>)"
}

function renderBlock(version: string, p: BlockParts): string {
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
  return [`<!-- BEGIN:dotbrain ${version} -->`, MANAGED_COMMENT, "", parts.filter((x) => x !== "").join("\n\n"), MANAGED_END].join(
    "\n",
  );
}

function specLink(repo: Repo, fromDir: string, version: string): string {
  const spec = repo.read("spec/README.md");
  if (spec !== null && /^# dotbrain specification\b/m.test(spec)) return relLink(fromDir, "spec/README.md");
  return `https://github.com/that-simple/dotbrain/blob/spec-v${version}/spec/README.md`;
}

function ruleEntry(rule: Rule, fromDir: string): RuleEntry {
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
    globs.unshift(`- \`${served.dir}/**\`: [Work on the brain](${relLink(dir, joinPath(served.dir, "AGENTS.md"))})`);
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

function managedBlockView(repo: Repo, served: Brain, file: string, inputs: string[]): View {
  const version = str(served.manifest.spec) ?? "";
  const expected = renderBlock(version, rootBlockParts(repo, served, file));
  const current = (actual: string | null) => {
    if (actual === null) return null;
    const lines = actual.split("\n");
    const found = findBlock(lines, (l) => MANAGED_BEGIN.test(l), MANAGED_END);
    return found ? { lines, found, block: lines.slice(found[0], found[1] + 1) } : { lines, found: null, block: null };
  };
  return {
    path: file,
    name: "managed block",
    inputs,
    upToDate: (actual) => {
      const c = current(actual);
      if (!c || !c.block) return false;
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

function ruleFileView(
  served: Brain,
  path: string,
  frontmatter: string,
  rule: Rule,
  inputs: string[],
): View {
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

function containsManagedBlock(text: string | null): boolean {
  return text !== null && text.split("\n").some((l) => MANAGED_BEGIN.test(l));
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

// ---------------------------------------------------------------- all views

export function allViews(repo: Repo): View[] {
  const brain = repo.brain;
  if (!brain) return [];
  const views: View[] = [];
  const listPath = joinPath(brain.dir, "decisions/README.md");
  const list = generateDecisionList(brain);
  views.push({
    path: listPath,
    name: "decision list",
    inputs: [brain.readme.path, ...decisionDocs(brain).map((d) => d.path)],
    upToDate: (actual) => actual === list,
    desired: () => ({ content: list, notes: [] }),
  });
  const block = generateIndexBlock(brain);
  views.push({
    path: brain.readme.path,
    name: "index block",
    inputs: [brain.readme.path, ...indexedDocs(brain).filter((d) => d.kind !== "decision-list").map((d) => d.path)],
    upToDate: (actual) => {
      if (actual === null) return false;
      const lines = actual.split("\n");
      const f = findBlock(lines, (l) => l === INDEX_BEGIN, INDEX_END);
      return f !== null && lines.slice(f[0], f[1] + 1).join("\n") === block;
    },
    desired: (actual) => ({ content: actual === null ? null : spliceIndexBlock(actual, block), notes: [] }),
  });

  for (const doc of stepDocs(brain)) {
    const status = generateStatusBlock(brain, doc);
    views.push({
      path: doc.path,
      name: "status line",
      inputs: [brain.readme.path, doc.path],
      upToDate: (actual) => {
        if (actual === null) return false;
        const lines = actual.split("\n");
        const f = findBlock(lines, (l) => l === STATUS_BEGIN, STATUS_END);
        return f !== null && lines.slice(f[0], f[1] + 1).join("\n") === status;
      },
      desired: (actual) => ({ content: actual === null ? null : spliceStatusBlock(actual, status), notes: [] }),
    });
  }

  const rules = effectiveRules(brain);
  const globs = rules.filter((r) => !r.always);
  const inputs = [brain.readme.path, ...rules.map((r) => r.doc.path)];
  for (const file of ROOT_INSTRUCTION_FILES) {
    if (repo.read(file) !== null) views.push(managedBlockView(repo, brain, file, inputs));
  }
  const ruleDirs: {
    enabled: boolean;
    dir: string;
    brainFile: string;
    brainFm: string;
    name: (r: Rule) => string;
    fm: (globs: string[]) => string;
  }[] = [
    {
      enabled: repo.read("CLAUDE.md") !== null,
      dir: ".claude/rules",
      brainFile: `${brain.name}.md`,
      brainFm: `---\npaths:\n  - "${brain.dir}/**"\n---\n`,
      name: (r) => `${brain.name}-${posix.basename(r.doc.rel, ".md")}.md`,
      fm: (gs) => `---\npaths:\n${gs.map((x) => `  - "${x.includes("/") ? x : "/" + x}"`).join("\n")}\n---\n`,
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
  for (const rd of ruleDirs) {
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
