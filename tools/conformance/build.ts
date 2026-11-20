// Building one case of the conformance suite: the tree of a case is written to a temporary directory, the views
// are generated with `index`, the mutations of the case are applied, and the tree is packed as txtar.
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runIndex } from "../src/index.ts";
import { compareCodePoints } from "../src/repo.ts";

export const REPO = fileURLToPath(new URL("../../", import.meta.url));

export type Files = Record<string, string | null>;
export type Mutation = string | null | ((current: string | null) => string | null);

export interface CaseSpec {
    name: string;
    description: string;
    files: Files;
    /** Changes to documents; the views are generated again after them. */
    beforeIndex?: Files;
    /** Changes made after the views are generated, so that views are out of date. */
    afterIndex?: Record<string, Mutation>;
    expected?: [string, string][];
}

export function writeTree(root: string, files: Files) {
    for (const [path, content] of Object.entries(files)) {
        const file = join(root, path);
        if (content === null) {
            rmSync(file, { force: true });
            continue;
        }
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, content);
    }
}

export function readTree(root: string, dir = ""): Map<string, string> {
    const out = new Map<string, string>();
    for (const e of readdirSync(join(root, dir), { withFileTypes: true })) {
        const rel = dir === "" ? e.name : `${dir}/${e.name}`;
        if (e.isDirectory()) for (const [k, v] of readTree(root, rel)) out.set(k, v);
        else out.set(rel, readFileSync(join(root, rel), "utf8"));
    }
    return out;
}

export function build(c: CaseSpec): string {
    const root = mkdtempSync(join(tmpdir(), "dotbrain-build-"));
    try {
        writeTree(root, c.files);
        runIndex(root, { check: false });
        if (c.beforeIndex) {
            writeTree(root, c.beforeIndex);
            runIndex(root, { check: false });
        }
        for (const [path, m] of Object.entries(c.afterIndex ?? {})) {
            const file = join(root, path);
            const current = existsSync(file) ? readFileSync(file, "utf8") : null;
            writeTree(root, { [path]: typeof m === "function" ? m(current) : m });
        }
        const tree = readTree(root);
        const expected = [...(c.expected ?? [])]
            .sort((a, b) => compareCodePoints(a[0], b[0]) || compareCodePoints(a[1], b[1]))
            .map(([rule, path]) => `${rule} ${path}`);
        let text = [...c.description.trim().split("\n"), ...expected, ""].join("\n");
        for (const path of [...tree.keys()].sort(compareCodePoints)) {
            const content = tree.get(path)!;
            if (content !== "" && !content.endsWith("\n"))
                throw new Error(`${c.name}: ${path} does not end with a newline`);
            if (/^-- .+ --$/m.test(content)) throw new Error(`${c.name}: ${path} contains a txtar marker`);
            text += `-- ${path} --\n${content}`;
        }
        return text;
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
}

export function sub(old: string, replacement: string): Mutation {
    return (current) => {
        if (current === null || !current.includes(old)) throw new Error(`text not found: ${old}`);
        return current.replace(old, replacement);
    };
}

export function replaced(text: string, ...pairs: [string, string][]): string {
    for (const [old, replacement] of pairs) {
        if (!text.includes(old)) throw new Error(`text not found: ${old}`);
        text = text.replace(old, replacement);
    }
    return text;
}
