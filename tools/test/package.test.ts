// The npm package (step 4): packed with `npm pack`, installed from the tarball, it works
// in another repository the same as the tools from this repository.
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import type { Answers } from "../src/init.ts";
import { removeTempDirs, repo, runHook, snapshot, tempDir } from "./helpers.ts";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const CLI = join(ROOT, "tools/dotbrain.ts");
const NPM = process.platform === "win32" ? "npm.cmd" : "npm";

const ANSWERS: Answers = {
    name: "notes-api",
    lang: "en",
    owner: "Ana Example",
    description: "A notes API for small teams.",
    languages: "English",
    order: "with-the-work",
    "step-ids": "no",
    date: "2026-11-12",
};

let packed: string[] = [];
let tarball = "";
let version = "";
let installed = "";
let bin = "";

before(() => {
    const out = tempDir();
    const json = execFileSync(NPM, ["pack", "--json", "--pack-destination", out], {
        cwd: ROOT,
        encoding: "utf8",
        stdio: "pipe",
    });
    const [info] = JSON.parse(json.slice(json.indexOf("["))) as { filename: string; files: { path: string }[] }[];
    packed = info!.files.map((f) => f.path);
    tarball = join(out, info!.filename);
    version = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")).version;
    installed = tempDir();
    install(installed);
    bin = join(installed, "node_modules", ".bin", "dotbrain");
});

after(removeTempDirs);

function install(prefix: string) {
    execFileSync(
        NPM,
        ["install", "--offline", "--no-audit", "--no-fund", "--no-package-lock", "--prefix", prefix, tarball],
        {
            encoding: "utf8",
            stdio: "pipe",
        },
    );
}

function dotbrain(args: string[]) {
    return spawnSync(bin, args, { encoding: "utf8" });
}

test("the tarball holds only the built tools, the templates, the specification and the package files", () => {
    const top = new Set(["LICENSE", "README.md", "package.json"]);
    for (const p of packed)
        assert.ok(top.has(p) || /^(dist|templates|spec)\//.test(p), `unexpected file in the package: ${p}`);
    assert.deepEqual(
        packed.filter((p) => p.endsWith(".ts")),
        [],
        "no .ts files",
    );
    for (const p of [
        "dist/dotbrain.js",
        "dist/src/init.js",
        "templates/index.md",
        "spec/README.md",
        "LICENSE",
        "README.md",
    ])
        assert.ok(packed.includes(p), p);
    assert.ok(
        packed.some((p) => p.startsWith("spec/conformance/") && p.endsWith(".txtar")),
        "the conformance suite is in the package",
    );
});

test("the installed package has the dotbrain command and no runtime dependencies", () => {
    const pkg = JSON.parse(readFileSync(join(installed, "node_modules/@that-simple/dotbrain/package.json"), "utf8"));
    assert.equal(pkg.name, "@that-simple/dotbrain");
    assert.equal(pkg.dependencies, undefined);
    const r = dotbrain(["help"]);
    assert.match(r.stderr, /^Usage:\n {2}dotbrain lint/);
});

for (const [kind, code] of [
    ["an empty repository", {}],
    [
        "a repository with code",
        { "package.json": '{ "name": "notes-api" }\n', "src/server.js": "export const port = 8080;\n" },
    ],
] as const) {
    test(`in ${kind}, init from the package writes what init from this repository writes, and lint and index --check pass`, () => {
        const answers = join(tempDir(), "answers.json");
        writeFileSync(answers, JSON.stringify(ANSWERS));
        const fromRepo = repo(code);
        const fromPackage = repo(code);
        const a = spawnSync(process.execPath, [CLI, "init", fromRepo, "--answers", answers], { encoding: "utf8" });
        assert.equal(a.status, 0, a.stderr);
        const b = dotbrain(["init", fromPackage, "--answers", answers]);
        assert.equal(b.status, 0, b.stderr);
        assert.equal(b.stdout.replaceAll(fromPackage, "<root>"), a.stdout.replaceAll(fromRepo, "<root>"));
        assert.deepEqual(snapshot(fromPackage), snapshot(fromRepo));
        const lint = dotbrain(["lint", fromPackage]);
        assert.equal(lint.status, 0, lint.stdout + lint.stderr);
        const check = dotbrain(["index", fromPackage, "--check"]);
        assert.equal(check.status, 0, check.stdout + check.stderr);
    });
}

test("with the package installed from the tarball, the hook of init passes a valid brain and returns a violation with code 2", () => {
    const answers = join(tempDir(), "answers.json");
    writeFileSync(answers, JSON.stringify(ANSWERS));
    const root = repo({ ".gitignore": "node_modules/\n" });
    const r = dotbrain(["init", root, "--answers", answers]);
    assert.equal(r.status, 0, r.stderr);
    install(root);
    // npx finds the exact version in the repository; offline, it could not download it.
    const env = { npm_config_offline: "true" };
    const valid = runHook(root, { version, env });
    assert.equal(valid.status, 0, valid.stdout + valid.stderr);
    const decision = join(root, ".brain/decisions/process/2026-11-12-languages.md");
    writeFileSync(decision, readFileSync(decision, "utf8").replace(/^description: .*\n/m, ""));
    const broken = runHook(root, { version, env });
    assert.equal(broken.status, 2, broken.stdout + broken.stderr);
    assert.match(
        broken.stderr,
        /dotbrain lint found problems in the brain[\s\S]*error V-[A-Z]+ \.brain\/decisions\/process\/2026-11-12-languages\.md/,
    );
});
