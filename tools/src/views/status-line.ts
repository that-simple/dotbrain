// The status line of a step, under its title: the status and the assignees from its frontmatter.
import { headings, splitFrontmatter } from "../markdown.ts";
import { type Brain, type Document, str, strList } from "../repo.ts";
import { findBlock, type View } from "./view.ts";

const STATUS_BEGIN = "<!-- BEGIN:dotbrain status -->";
const STATUS_END = "<!-- END:dotbrain status -->";

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

export function statusLineViews(brain: Brain): View[] {
    return stepDocs(brain).map((doc) => {
        const status = generateStatusBlock(brain, doc);
        return {
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
        };
    });
}
