// The `Stop` hook of the starter template (step 6): it runs `dotbrain lint` through `npx` only
// when the brain or the instruction files changed, or `HEAD` moved since the last successful check.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { chmodSync, existsSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, test } from "node:test";
import { removeTempDirs, repo, runHook, tempDir } from "./helpers.ts";

afterEach(removeTempDirs);

/** A directory with a fake `npx` that records its arguments and fails when `FAKE_LINT_FAIL` is set. */
function fakeNpx(): { bin: string; log: string } {
    const bin = tempDir();
    const log = join(bin, "calls.log");
    writeFileSync(
        join(bin, "npx"),
        `#!/bin/sh\nprintf '%s\\n' "$*" >> '${log}'\nif [ -n "$FAKE_LINT_FAIL" ]; then echo 'error V-FRONTMATTER .brain/x.md: no description'; exit 1; fi\nexit 0\n`,
    );
    chmodSync(join(bin, "npx"), 0o755);
    return { bin, log };
}

function calls(log: string): string[] {
    return existsSync(log) ? readFileSync(log, "utf8").trim().split("\n") : [];
}

function commit(root: string, message: string) {
    execFileSync("git", ["-C", root, "add", "-A"]);
    execFileSync("git", ["-C", root, "-c", "user.email=ana@example.com", "commit", "-q", "-m", message]);
}

function brainRepo(): string {
    const root = repo({ ".brain/README.md": "# Brain\n", "CLAUDE.md": "# Project\n", "src/app.js": "export {};\n" });
    commit(root, "Start");
    return root;
}

function hook(root: string, npx: { bin: string }, env: Record<string, string> = {}) {
    return runHook(root, { env: { PATH: `${npx.bin}:${process.env.PATH}`, ...env } });
}

test("the hook runs lint with the exact version once, then skips it while nothing changes", () => {
    const root = brainRepo();
    const npx = fakeNpx();
    const first = hook(root, npx);
    assert.equal(first.status, 0, first.stderr);
    assert.deepEqual(calls(npx.log), ["--yes @that-simple/dotbrain@1.0.0 lint"]);
    const second = hook(root, npx);
    assert.equal(second.status, 0, second.stderr);
    assert.equal(calls(npx.log).length, 1, "no lint without a change");
    writeFileSync(join(root, "src/app.js"), "export const a = 1;\n");
    assert.equal(hook(root, npx).status, 0);
    assert.equal(calls(npx.log).length, 1, "a change outside the brain does not run lint");
});

test("the hook runs lint after a change in the brain, in an instruction file and after a new commit", () => {
    const root = brainRepo();
    const npx = fakeNpx();
    hook(root, npx);
    writeFileSync(join(root, ".brain/notes.md"), "# Notes\n");
    assert.equal(hook(root, npx).status, 0);
    assert.equal(calls(npx.log).length, 2, "an untracked file in the brain");
    commit(root, "Notes");
    assert.equal(hook(root, npx).status, 0);
    assert.equal(calls(npx.log).length, 3, "the change committed in the same turn");
    assert.equal(hook(root, npx).status, 0);
    assert.equal(calls(npx.log).length, 3);
    writeFileSync(join(root, "CLAUDE.md"), "# Project\n\nMore.\n");
    assert.equal(hook(root, npx).status, 0);
    assert.equal(calls(npx.log).length, 4, "a change in an instruction file");
});

test("on a violation the hook ends with code 2 and the output of lint, and checks again next time", () => {
    const root = brainRepo();
    const npx = fakeNpx();
    const r = hook(root, npx, { FAKE_LINT_FAIL: "1" });
    assert.equal(r.status, 2);
    assert.match(r.stderr, /dotbrain lint found problems in the brain[\s\S]*error V-FRONTMATTER \.brain\/x\.md/);
    assert.equal(hook(root, npx).status, 0);
    assert.equal(calls(npx.log).length, 2, "a failed check is not remembered");
});

test("the hook ends with code 0 without lint when a hook already continued the agent", () => {
    const root = brainRepo();
    const npx = fakeNpx();
    const r = runHook(root, {
        input: { stop_hook_active: true },
        env: { PATH: `${npx.bin}:${process.env.PATH}`, FAKE_LINT_FAIL: "1" },
    });
    assert.equal(r.status, 0);
    assert.deepEqual(calls(npx.log), []);
});

test("without npx the hook ends with code 0", () => {
    const root = brainRepo();
    const bin = tempDir();
    for (const tool of ["git", "cat"])
        symlinkSync(
            execFileSync("/bin/sh", ["-c", `command -v ${tool}`], { encoding: "utf8" }).trim(),
            join(bin, tool),
        );
    writeFileSync(join(root, ".brain/notes.md"), "# Notes\n");
    const r = runHook(root, { env: { PATH: bin } });
    assert.equal(r.status, 0, r.stderr);
});

test("outside a git repository the hook ends with code 0", () => {
    const npx = fakeNpx();
    assert.equal(hook(tempDir(), npx).status, 0);
    assert.deepEqual(calls(npx.log), []);
});
