#!/usr/bin/env node
// dotbrain tools: `lint` checks the validity rules of the specification,
// `index` generates the views (or, with --check, reports the out-of-date ones),
// `init` sets up the skeleton of a brain in a code repository.
import { resolve } from "node:path";
import { lint, severity } from "./src/lint.ts";
import { runIndex } from "./src/index.ts";
import { runInit } from "./src/init.ts";
import { loadRepo } from "./src/repo.ts";

const USAGE = `Usage:
  dotbrain lint [<repository>]           check the brain of a repository
  dotbrain index [<repository>] [--check] generate the views; with --check, only report out-of-date ones
  dotbrain init [<repository>] [--answers <file.json>] [--<question>=<answer>...] [--yes]
                                         set up the skeleton of a brain, asking the questions not answered`;

async function main(args: string[]): Promise<number> {
  const [command, ...rest] = args;
  if (command === "init") return runInit(rest);
  const check = rest.includes("--check");
  const positional = rest.filter((a) => !a.startsWith("--"));
  const unknown = rest.filter((a) => a.startsWith("--") && a !== "--check");
  if (unknown.length || positional.length > 1 || (command === "lint" && check)) {
    console.error(USAGE);
    return 2;
  }
  const root = resolve(positional[0] ?? ".");
  if (command === "lint") {
    const result = lint(loadRepo(root));
    for (const v of result.violations) console.log(`${severity(v.rule)} ${v.rule} ${v.path}: ${v.message}`);
    for (const n of result.notes) console.error(`note: ${n}`);
    return result.violations.some((v) => severity(v.rule) === "error") ? 1 : 0;
  }
  if (command === "index") {
    const result = runIndex(root, { check });
    for (const p of result.changed) console.log(check ? `error V-VIEWS ${p}: out of date` : `wrote ${p}`);
    for (const s of result.skipped) console.error(`skipped: ${s}`);
    for (const n of result.notes) console.error(`note: ${n}`);
    if (check && result.changed.length) return 1;
    return result.skipped.length ? 1 : 0;
  }
  console.error(USAGE);
  return 2;
}

process.exitCode = await main(process.argv.slice(2));
