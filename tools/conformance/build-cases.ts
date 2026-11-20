// Builds the cases of the conformance suite (spec/conformance/*.txtar).
//
// Each case is written from its source documents: the views are generated with `index`
// on a valid base, then the mutations of an error case are applied (before or after
// generating the views again), and the tree is packed as txtar with the expected
// violations in its header. The suite itself does not depend on this script or on the
// tools: any implementation is checked against the files it produces.
//
// Usage: node tools/conformance/build-cases.ts [--check]
//   --check  build into memory and report cases that differ from spec/conformance/
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { build, REPO } from "./build.ts";
import { documentErrorCases } from "./cases-error-documents.ts";
import { viewAndContentErrorCases } from "./cases-error-views.ts";
import { validCases } from "./cases-valid.ts";

const OUT = join(REPO, "spec/conformance");

function main(args: string[]): number {
    const check = args.includes("--check");
    const built = new Map(
        [...validCases(), ...documentErrorCases(), ...viewAndContentErrorCases()].map((c) => [
            `${c.name}.txtar`,
            build(c),
        ]),
    );
    const existing = readdirSync(OUT).filter((f) => f.endsWith(".txtar"));
    if (check) {
        const differ = [...built]
            .filter(([f, text]) => !existsSync(join(OUT, f)) || readFileSync(join(OUT, f), "utf8") !== text)
            .map(([f]) => f);
        const extra = existing.filter((f) => !built.has(f));
        for (const f of differ) console.log(`differs: spec/conformance/${f}`);
        for (const f of extra) console.log(`not built by this script: spec/conformance/${f}`);
        return differ.length || extra.length ? 1 : 0;
    }
    for (const f of existing) if (!built.has(f)) rmSync(join(OUT, f));
    for (const [f, text] of built) writeFileSync(join(OUT, f), text);
    console.log(`wrote ${built.size} cases to spec/conformance/`);
    return 0;
}

process.exitCode = main(process.argv.slice(2));
