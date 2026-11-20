import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

export interface Case {
    description: string[];
    expected: { rule: string; path: string }[];
    files: { path: string; content: string }[];
}

const MARKER = /^-- (.+) --$/;
const EXPECTED = /^(V-[A-Z]+) (\S+)$/;

export function parseTxtar(text: string): Case {
    const lines = text.split("\n");
    if (lines[lines.length - 1] === "") lines.pop();
    const result: Case = { description: [], expected: [], files: [] };
    let current: { path: string; lines: string[] } | null = null;
    const close = () => {
        if (current) result.files.push({ path: current.path, content: current.lines.map((l) => l + "\n").join("") });
    };
    for (const line of lines) {
        const m = MARKER.exec(line);
        if (m) {
            close();
            const path = m[1]!;
            if (path.split("/").some((s) => s === "" || s === "." || s === ".."))
                throw new Error(`invalid path in case: ${path}`);
            current = { path, lines: [] };
        } else if (current) {
            current.lines.push(line);
        } else {
            const e = EXPECTED.exec(line);
            if (e) result.expected.push({ rule: e[1]!, path: e[2]! });
            else result.description.push(line);
        }
    }
    close();
    return result;
}

export function extract(c: Case, root: string): void {
    for (const f of c.files) {
        const file = join(root, f.path);
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, f.content);
    }
}
