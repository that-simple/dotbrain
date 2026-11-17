import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, posix } from "node:path";
import { headings, splitFrontmatter } from "./markdown.ts";
import type { YamlMap, YamlValue } from "./yaml.ts";

export const DEFAULT_LABELS: Record<string, string> = {
  goal: "Goal",
  scope: "Scope",
  "out-of-scope": "Out of scope",
  decisions: "Decisions",
  acceptance: "Acceptance criteria",
  stages: "Stages",
  log: "Log",
  "open-questions": "Open questions",
  context: "Context",
  options: "Options",
  recommendation: "Recommendation",
  decider: "Who decides and when",
  decision: "Decision",
  consequences: "Consequences",
  proposed: "Proposed",
  accepted: "Accepted",
  rejected: "Rejected",
  superseded: "Superseded",
  status: "Status",
  assignee: "Assignee",
};

export const DECISION_NAME = /^(\d{4})-(\d{2})-(\d{2})-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;
export const INSTRUCTION_FILE_NAMES = new Set(["CLAUDE.md", "AGENTS.md"]);
export const ROOT_INSTRUCTION_FILES = ["CLAUDE.md", "AGENTS.md", ".github/copilot-instructions.md"];

export type DocumentKind = "index" | "decision-list" | "decision" | "roadmap" | "risks" | "step" | "area";

export interface Document {
  /** Path relative to the repository root. */
  path: string;
  /** Path relative to the brain directory. */
  rel: string;
  kind: DocumentKind;
  text: string;
  hasFrontmatter: boolean;
  frontmatterError: string | null;
  fm: YamlMap;
  body: string;
  title: string | null;
}

export const BRAIN_DIR = ".brain";

export interface Brain {
  /** Directory relative to the repository root: always `.brain`. */
  dir: string;
  readme: Document;
  manifest: YamlMap;
  name: string;
  docs: Document[];
  /** Every file of the brain (documents and other files), relative to the repository root. */
  files: string[];
  label: (key: string) => string;
}

export interface Repo {
  root: string;
  files: string[];
  /** The brain of the repository (`.brain/`), or null when there is none. */
  brain: Brain | null;
  read: (path: string) => string | null;
  exists: (path: string) => boolean;
}

export function str(v: YamlValue | undefined): string | undefined {
  return typeof v === "string" ? v : undefined;
}

export function strList(v: YamlValue | undefined): string[] | undefined {
  if (!Array.isArray(v)) return undefined;
  return v.every((x) => typeof x === "string") ? (v as string[]) : undefined;
}

export function joinPath(dir: string, rel: string): string {
  return dir === "" ? rel : `${dir}/${rel}`;
}

export function dirOf(path: string): string {
  const d = posix.dirname(path);
  return d === "." ? "" : d;
}

/** Relative link from a directory (repo-relative, "" for the root) to a repo-relative path. */
export function relLink(fromDir: string, to: string): string {
  const r = posix.relative(fromDir === "" ? "." : fromDir, to === "" ? "." : to);
  return r === "" ? "." : r;
}

export function compareCodePoints(a: string, b: string): number {
  const x = Array.from(a);
  const y = Array.from(b);
  for (let i = 0; i < Math.min(x.length, y.length); i++) {
    const d = x[i]!.codePointAt(0)! - y[i]!.codePointAt(0)!;
    if (d !== 0) return d;
  }
  return x.length - y.length;
}

function listFiles(root: string): string[] {
  try {
    const out = execFileSync("git", ["-C", root, "ls-files", "-z", "--cached", "--others", "--exclude-standard"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    // Only trust git when root is the top of the work tree.
    const top = execFileSync("git", ["-C", root, "rev-parse", "--show-prefix"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (top === "") {
      return out
        .split("\0")
        .filter((p) => p !== "" && existsSync(join(root, p)))
        .sort(compareCodePoints);
    }
  } catch {
    // Not a git repository, or git is not installed.
  }
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(join(root, dir), { withFileTypes: true })) {
      if (entry.name === ".git") continue;
      const rel = joinPath(dir, entry.name);
      if (entry.isDirectory()) walk(rel);
      else if (entry.isFile()) files.push(rel);
    }
  };
  walk("");
  return files.sort(compareCodePoints);
}

export function parseDocument(path: string, rel: string, text: string): Document {
  const fm = splitFrontmatter(text);
  const h1 = headings(fm.body).find((h) => h.level === 1);
  return {
    path,
    rel,
    kind: kindOf(rel),
    text,
    hasFrontmatter: fm.present,
    frontmatterError: fm.error,
    fm: fm.data,
    body: fm.body,
    title: h1 ? h1.text : null,
  };
}

export function kindOf(rel: string): DocumentKind {
  if (rel === "README.md") return "index";
  if (rel === "decisions/README.md") return "decision-list";
  if (rel.startsWith("decisions/") && DECISION_NAME.test(posix.basename(rel))) return "decision";
  if (rel === "roadmap.md") return "roadmap";
  if (rel === "risks.md") return "risks";
  if (rel.startsWith("steps/")) return "step";
  return "area";
}

/** True for files an adapter adds inside a brain directory (instruction files and adapter directories). */
export function isAdapterFile(rel: string): boolean {
  const parts = rel.split("/");
  if (INSTRUCTION_FILE_NAMES.has(parts[parts.length - 1]!)) return true;
  return parts.slice(0, -1).some((p) => p === ".github" || p === ".claude");
}

export function loadRepo(root: string): Repo {
  const files = listFiles(root);
  const fileSet = new Set(files);
  const cache = new Map<string, string>();
  const read = (path: string): string | null => {
    if (!fileSet.has(path)) return null;
    if (!cache.has(path)) cache.set(path, readFileSync(join(root, path), "utf8"));
    return cache.get(path)!;
  };
  const exists = (path: string): boolean => {
    if (path === "") return true;
    if (path.split("/").includes("..")) return false;
    try {
      statSync(join(root, path));
      return true;
    } catch {
      return false;
    }
  };

  const readmePath = `${BRAIN_DIR}/README.md`;
  const readmeText = read(readmePath);
  if (readmeText === null) return { root, files, brain: null, read, exists };
  const readme = parseDocument(readmePath, "README.md", readmeText);
  const manifest = readme.fm;
  const sections = manifest.sections;
  const map: Record<string, string> = {};
  if (sections && typeof sections === "object" && !Array.isArray(sections)) {
    for (const [k, v] of Object.entries(sections)) if (typeof v === "string") map[k] = v;
  }
  const label = (key: string) => map[key] ?? DEFAULT_LABELS[key] ?? key;
  const brainFiles: string[] = [];
  const docs: Document[] = [];
  for (const f of files) {
    if (!f.startsWith(BRAIN_DIR + "/")) continue;
    const rel = f.slice(BRAIN_DIR.length + 1);
    if (isAdapterFile(rel)) continue;
    brainFiles.push(f);
    if (f.endsWith(".md")) docs.push(rel === "README.md" ? readme : parseDocument(f, rel, read(f)!));
  }
  const brain: Brain = { dir: BRAIN_DIR, readme, manifest, name: str(manifest.brain) ?? "", docs, files: brainFiles, label };
  return { root, files, brain, read, exists };
}
