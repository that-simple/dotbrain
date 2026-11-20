// The core of the compact form stays within its budget, and the two parts of the compact
// form carry every rule of the agent contract exactly once (spec/adapters/agents.md).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { compactFormParts } from "../src/contract.ts";
import { wordCount } from "../src/rules.ts";

const SPEC = fileURLToPath(new URL("../../spec/", import.meta.url));
const CORE_BUDGET = 400;

test("the core of the compact form has at most 400 words", () => {
    const words = wordCount(compactFormParts().core);
    assert.ok(words <= CORE_BUDGET, `the core has ${words} words, the budget is ${CORE_BUDGET}`);
});

function numbers(cell: string): number[] {
    return cell.split(",").flatMap((part) => {
        const [a, b] = part.trim().split(/[–-]/).map(Number);
        if (b === undefined) return [a!];
        return Array.from({ length: b - a! + 1 }, (_, i) => a! + i);
    });
}

test("every rule of the contract is in exactly one part of the compact form", () => {
    const contract = readFileSync(`${SPEC}agent-contract.md`, "utf8");
    const rules = [...contract.matchAll(/^(\d+)\. \*\*/gm)].map((m) => Number(m[1]));
    assert.deepEqual(
        rules,
        Array.from({ length: rules.length }, (_, i) => i + 1),
        "rules are numbered 1…N",
    );

    const agents = readFileSync(`${SPEC}adapters/agents.md`, "utf8");
    const parts = new Map<string, number[]>();
    for (const m of agents.matchAll(/^\| (Core|Work on the brain) \| ([\d,–\- ]+) \|$/gm))
        parts.set(m[1]!, numbers(m[2]!));
    assert.deepEqual([...parts.keys()].sort(), ["Core", "Work on the brain"]);

    const assigned = [...parts.values()].flat().sort((a, b) => a - b);
    assert.deepEqual(assigned, rules, "each rule is assigned once");
});
