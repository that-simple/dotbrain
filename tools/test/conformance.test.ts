// Runs the conformance suite of the specification (spec/conformance/*.txtar) against the tools.
import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { runIndex } from "../src/index.ts";
import { lint } from "../src/lint.ts";
import { loadRepo } from "../src/repo.ts";
import { extract, parseTxtar } from "../src/txtar.ts";

const SUITE = fileURLToPath(new URL("../../spec/conformance/", import.meta.url));

function snapshot(root: string): Map<string, string> {
    const files = new Map<string, string>();
    const walk = (dir: string) => {
        for (const e of readdirSync(join(root, dir), { withFileTypes: true })) {
            const rel = dir === "" ? e.name : `${dir}/${e.name}`;
            if (e.isDirectory()) walk(rel);
            else files.set(rel, readFileSync(join(root, rel), "utf8"));
        }
    };
    walk("");
    return files;
}

const cases = readdirSync(SUITE)
    .filter((f) => f.endsWith(".txtar"))
    .sort();

test("the suite has cases", () => assert.ok(cases.length > 0));

for (const name of cases) {
    test(name, () => {
        const c = parseTxtar(readFileSync(join(SUITE, name), "utf8"));
        const root = mkdtempSync(join(tmpdir(), "dotbrain-case-"));
        try {
            extract(c, root);
            const got = new Set(lint(loadRepo(root)).violations.map((v) => `${v.rule} ${v.path}`));
            const want = new Set(c.expected.map((e) => `${e.rule} ${e.path}`));
            assert.deepEqual([...got].sort(), [...want].sort(), "violations (rule, path)");
            if (c.expected.length === 0) {
                const before = snapshot(root);
                const result = runIndex(root, { check: false });
                assert.deepEqual(result.changed, [], "index changes no file of a valid case");
                assert.deepEqual(snapshot(root), before);
            }
        } finally {
            rmSync(root, { recursive: true, force: true });
        }
    });
}
