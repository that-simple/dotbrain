// The decision list, `decisions/README.md`: decisions grouped by status, generated from their frontmatter.
import { posix } from "node:path";
import { type Brain, compareCodePoints, DECISION_NAME, type Document, joinPath, str } from "../repo.ts";
import { description, type View } from "./view.ts";

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
        const group = decisions.filter((d) => d.doc.fm.status === status).sort((a, b) => compareCodePoints(a.id, b.id));
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
    return `${out.join("\n")}\n`;
}

export function decisionListView(brain: Brain): View {
    const list = generateDecisionList(brain);
    return {
        path: joinPath(brain.dir, "decisions/README.md"),
        name: "decision list",
        inputs: [brain.readme.path, ...decisionDocs(brain).map((d) => d.path)],
        upToDate: (actual) => actual === list,
        desired: () => ({ content: list, notes: [] }),
    };
}
