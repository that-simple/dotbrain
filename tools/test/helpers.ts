// Helpers shared by the tests: temporary git repositories and snapshots of their files.
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const dirs: string[] = [];

/** Removes the directories made by `tempDir`; register it with `afterEach` or `after`. */
export function removeTempDirs() {
    for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true });
}

export function tempDir(): string {
    const d = mkdtempSync(join(tmpdir(), "dotbrain-test-"));
    dirs.push(d);
    return d;
}

/** A new git repository in a temporary directory with the given files. */
export function repo(files: Record<string, string> = {}): string {
    const root = tempDir();
    execFileSync("git", ["init", "-q", root]);
    execFileSync("git", ["-C", root, "config", "user.name", "Ana Example"]);
    for (const [p, c] of Object.entries(files)) {
        mkdirSync(join(root, p, ".."), { recursive: true });
        writeFileSync(join(root, p), c);
    }
    return root;
}

/** The files of a directory without `.git`, by path relative to it. */
export function snapshot(root: string, dir = ""): Map<string, string> {
    const out = new Map<string, string>();
    for (const e of readdirSync(join(root, dir), { withFileTypes: true })) {
        if (e.name === ".git") continue;
        const rel = dir === "" ? e.name : `${dir}/${e.name}`;
        if (e.isDirectory()) for (const [k, v] of snapshot(root, rel)) out.set(k, v);
        else out.set(rel, readFileSync(join(root, rel), "utf8"));
    }
    return out;
}

/** The command of the `Stop` hook of the starter template, with the given package version. */
export function hookCommand(version: string): string {
    const template = readFileSync(new URL("../../templates/claude-settings.json", import.meta.url), "utf8");
    const settings = JSON.parse(template) as { hooks: { Stop: { hooks: { command: string }[] }[] } };
    return settings.hooks.Stop[0]!.hooks[0]!.command.split("<version>").join(version);
}

/** Runs the hook as Claude Code does: in a shell, with the project directory and the hook input on standard input. */
export function runHook(
    root: string,
    options: { version?: string; env?: Record<string, string>; input?: object } = {},
) {
    return spawnSync("/bin/sh", ["-c", hookCommand(options.version ?? "1.0.0")], {
        input: JSON.stringify(options.input ?? { hook_event_name: "Stop", stop_hook_active: false }),
        encoding: "utf8",
        env: { ...process.env, CLAUDE_PROJECT_DIR: root, ...options.env },
    });
}
