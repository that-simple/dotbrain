// The managed block and the rule file of the brain of the starter are the two parts of the
// compact form of the contract in the specification.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { brainWorkForm, compactForm } from "../src/contract.ts";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));

test("the managed block of the starter follows the specification", () => {
    const template = readFileSync(`${ROOT}templates/managed-block.md`, "utf8");
    const expected = [
        "<!-- BEGIN:dotbrain 1.0.0 -->",
        "<!-- Managed block: generated from the agent contract and the brain. Do not edit by hand; change the brain and regenerate. Text outside this block must not contradict the brain. -->",
        "",
        compactForm({ brainPath: ".brain", description: "<brain-description>" }),
        "",
        "Specification: [dotbrain 1.0.0](https://github.com/that-simple/dotbrain/blob/spec-v1.0.0/spec/README.md)",
        "<!-- END:dotbrain -->",
        "",
    ].join("\n");
    assert.equal(template, expected);
});

test("the rule file of the brain of the starter follows the specification", () => {
    const template = readFileSync(`${ROOT}templates/brain-rules.md`, "utf8");
    const expected = [
        "<!-- BEGIN:dotbrain 1.0.0 -->",
        "<!-- Managed block: generated from the agent contract and the brain. Do not edit by hand; change the brain and regenerate. Text outside this block must not contradict the brain. -->",
        "",
        brainWorkForm({ brainPath: ".brain", description: "<brain-description>" }),
        "<!-- END:dotbrain -->",
        "",
    ].join("\n");
    assert.equal(template, expected);
});

test("the Claude Code settings of the starter are JSON with a Stop hook running lint from the package of an exact version", () => {
    const settings = JSON.parse(readFileSync(`${ROOT}templates/claude-settings.json`, "utf8"));
    const commands = settings.hooks.Stop.flatMap((e: { hooks: { command: string }[] }) =>
        e.hooks.map((h) => h.command),
    );
    assert.equal(commands.length, 1);
    assert.ok(commands[0].includes("npx --yes @that-simple/dotbrain@<version> lint"), commands[0]);
    assert.equal(
        commands[0].replace("<version>", "").includes("<"),
        false,
        "no other placeholder or input redirection",
    );
});
