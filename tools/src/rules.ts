import { posix } from "node:path";
import { bodyWithoutTitle, isRelativeTarget, mapLinks, sectionContent } from "./markdown.ts";
import { compareCodePoints, dirOf, relLink, strList, type Brain, type Document } from "./repo.ts";

export interface Rule {
  doc: Document;
  brain: Brain;
  always: boolean;
  globs: string[];
}

export function applyValue(doc: Document): { always: boolean; globs: string[] } | null {
  const apply = doc.fm.apply;
  if (apply === undefined) return null;
  if (apply === "always") return { always: true, globs: [] };
  if (typeof apply === "string" && apply.trim() !== "") return { always: false, globs: [apply] };
  const list = strList(apply);
  if (list && list.length > 0 && list.every((g) => g.trim() !== "")) return { always: false, globs: list };
  return null;
}

/** The effective rule set: the documents of the brain with `apply`, accepted decisions only, by path. */
export function effectiveRules(brain: Brain): Rule[] {
  const rules: Rule[] = [];
  const docs = brain.docs
    .filter((d) => d.fm.apply !== undefined)
    .filter((d) => d.kind !== "decision" || d.fm.status === "accepted")
    .sort((x, y) => compareCodePoints(x.rel, y.rel));
  for (const doc of docs) {
    const a = applyValue(doc);
    if (a) rules.push({ doc, brain, ...a });
  }
  return rules;
}

/** The text of a rule, with relative links rewritten to work from `toDir`. */
export function ruleText(rule: Rule, toDir: string): string {
  const raw =
    rule.doc.kind === "decision"
      ? (sectionContent(rule.doc.body, rule.brain.label("decision")) ?? "")
      : bodyWithoutTitle(rule.doc.body);
  return rewriteLinks(raw, dirOf(rule.doc.path), toDir);
}

export function rewriteLinks(text: string, fromDir: string, toDir: string): string {
  return mapLinks(text, (target) => {
    if (!isRelativeTarget(target)) return target;
    const hash = target.indexOf("#");
    const path = hash === -1 ? target : target.slice(0, hash);
    const anchor = hash === -1 ? "" : target.slice(hash);
    if (path === "") return target;
    const resolved = posix.normalize(posix.join(fromDir === "" ? "." : fromDir, path)).replace(/\/$/, "");
    let link = relLink(toDir, resolved === "." ? "" : resolved);
    if (path.endsWith("/") && !link.endsWith("/")) link += "/";
    return link + anchor;
  });
}

export function wordCount(text: string): number {
  return text.split(/\s+/).filter((w) => w !== "").length;
}
