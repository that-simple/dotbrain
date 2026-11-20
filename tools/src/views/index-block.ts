// The index block in the `README.md` of the brain: every document with its description, grouped by directory.
import { posix } from "node:path";
import { headings, splitFrontmatter } from "../markdown.ts";
import { type Brain, compareCodePoints, type Document, dirOf, str } from "../repo.ts";
import { decisionListDescription } from "./decision-list.ts";
import { description, findBlock, type View } from "./view.ts";

const INDEX_BEGIN = "<!-- BEGIN:dotbrain index -->";
const INDEX_END = "<!-- END:dotbrain index -->";

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

export function indexBlockView(brain: Brain): View {
    const block = generateIndexBlock(brain);
    return {
        path: brain.readme.path,
        name: "index block",
        inputs: [
            brain.readme.path,
            ...indexedDocs(brain)
                .filter((d) => d.kind !== "decision-list")
                .map((d) => d.path),
        ],
        upToDate: (actual) => {
            if (actual === null) return false;
            const lines = actual.split("\n");
            const f = findBlock(lines, (l) => l === INDEX_BEGIN, INDEX_END);
            return f !== null && lines.slice(f[0], f[1] + 1).join("\n") === block;
        },
        desired: (actual) => ({ content: actual === null ? null : spliceIndexBlock(actual, block), notes: [] }),
    };
}
