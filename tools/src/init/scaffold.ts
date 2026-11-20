// Writing the skeleton into a repository: the checks before writing, the files, the views and the warnings.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { runIndex } from "../index.ts";
import { checkDocuments } from "../lint.ts";
import { evaluateViews } from "../views/all-views.ts";
import { dirOf, loadRepo, ROOT_INSTRUCTION_FILES, relLink } from "../repo.ts";
import { MANAGED_END } from "../views/managed-block.ts";
import { type Answers, InitError, QUESTIONS } from "./questions.ts";
import {
    CLAUDE_SETTINGS,
    claudeSettings,
    fill,
    plan,
    SETUP_FILE,
    setupFile,
    TEMPLATES_DIR,
    withPointer,
} from "./skeleton.ts";

function gitTop(root: string): void {
    let top: string;
    try {
        top = execFileSync("git", ["-C", root, "rev-parse", "--show-toplevel"], {
            encoding: "utf8",
            stdio: ["ignore", "pipe", "ignore"],
        }).trim();
    } catch {
        throw new InitError(`${root} is not a git repository; dotbrain sets up a brain in a code repository`);
    }
    if (realpathSync(top) !== realpathSync(root))
        throw new InitError(`${root} is not the top of its git repository (${top})`);
}

/** Checks that need no answers: a git repository without a brain. */
export function preflight(root: string): void {
    if (!existsSync(root)) throw new InitError(`${root} does not exist`);
    gitTop(root);
    if (existsSync(join(root, ".brain/README.md")))
        throw new InitError("the repository already has a brain (.brain/README.md); init changes nothing");
}

function ignored(root: string, path: string): boolean {
    try {
        execFileSync("git", ["-C", root, "check-ignore", "-q", "--no-index", path], { stdio: "ignore" });
        return true;
    } catch {
        return false;
    }
}

/**
 * The paths git ignores and does not track: the tools would not read them once written. When git cannot tell,
 * init stops, because it could not keep its promise to change nothing when a check fails.
 */
function ignoredByGit(root: string, paths: string[]): string[] {
    const r = spawnSync("git", ["-C", root, "check-ignore", "-z", "--stdin"], {
        input: paths.join("\0"),
        encoding: "utf8",
    });
    if (r.status === 0) return r.stdout.split("\0").filter((p) => p !== "");
    if (r.status === 1) return [];
    const reason = (r.stderr ?? "").split("\n")[0]?.trim() || (r.error?.message ?? `exit code ${r.status}`);
    throw new InitError(`git check-ignore failed: ${reason}; init changes nothing`);
}

export interface ScaffoldResult {
    written: string[];
    warnings: string[];
    notes: string[];
    prompt: string;
}

/** Writes the skeleton from complete, valid answers. Changes nothing when a check fails. */
export function scaffold(root: string, answers: Answers, templates = TEMPLATES_DIR): ScaffoldResult {
    for (const q of QUESTIONS) {
        const v = answers[q.key];
        if (v === undefined) throw new InitError(`no answer for ${q.key}`);
        const reason = q.check(v);
        if (reason) throw new InitError(`${q.key}: ${reason}`);
    }
    preflight(root);
    const p = plan(answers, templates);
    const settings = claudeSettings(templates);
    // An existing `.claude/settings.json` is the repository's own: init leaves it and tells the agent to add the hook.
    const settingsExist = existsSync(join(root, CLAUDE_SETTINGS));
    if (!settingsExist) p.created.set(CLAUDE_SETTINGS, settings);
    const setup = setupFile(templates, settingsExist ? settings : null);
    p.created.set(SETUP_FILE, setup.content);
    for (const path of p.created.keys()) {
        if (existsSync(join(root, path))) throw new InitError(`${path} already exists; init overwrites nothing`);
    }
    for (const file of ROOT_INSTRUCTION_FILES) {
        const full = join(root, file);
        if (existsSync(full) && readFileSync(full, "utf8").split("\n").includes(MANAGED_END))
            throw new InitError(`${file} already has a managed block; init overwrites nothing`);
    }

    // The files written before `index` runs. A template that makes them invalid would stop `index` from generating
    // the views after the files are written, so they are checked in memory first.
    const first = new Map([...p.created].filter(([path]) => path !== SETUP_FILE));
    for (const file of ROOT_INSTRUCTION_FILES) {
        if (!existsSync(join(root, file))) first.set(file, `# ${answers.name}\n`);
    }
    // The tools do not read the files git ignores, so `index` would not see such a file once written.
    const read = [...[...first.keys()].filter((p) => p.startsWith(".brain/")), ...ROOT_INSTRUCTION_FILES];
    const ignoredFiles = ignoredByGit(root, read);
    if (ignoredFiles.length) {
        throw new InitError(
            `git ignores ${ignoredFiles.join(", ")}; dotbrain does not read the files git ignores, so init would leave a brain without its views; change .gitignore`,
        );
    }
    const planned = loadRepo(root, first);
    const tainted = evaluateViews(planned, checkDocuments(planned).violations).filter((r) => r.status === "tainted");
    if (tainted.length) {
        const reasons = tainted.map((r) => `the ${r.view.name} of ${r.view.path} (${r.reason})`);
        throw new InitError(`the templates give a skeleton whose views cannot be generated: ${reasons.join("; ")}`);
    }

    const written = new Set<string>();
    const write = (path: string, content: string) => {
        mkdirSync(dirname(join(root, path)), { recursive: true });
        writeFileSync(join(root, path), content);
        written.add(path);
    };
    for (const [path, content] of first) write(path, content);
    const index = runIndex(root, { check: false });
    if (index.skipped.length) throw new InitError(`the views were not generated: ${index.skipped.join("; ")}`);
    for (const path of index.changed) written.add(path);
    write(SETUP_FILE, setup.content);
    for (const file of ROOT_INSTRUCTION_FILES) {
        const pointer = fill(setup.pointer, { "<setup-file>": relLink(dirOf(file), SETUP_FILE) });
        write(file, withPointer(readFileSync(join(root, file), "utf8"), pointer));
    }

    const warnings = [".claude/rules/", ".claude/agents/"]
        .filter((d) => ignored(root, `${d}x.md`))
        .map(
            (d) =>
                `git ignores ${d}; commit it anyway (git add -f) or change .gitignore, so that the team gets ${d === ".claude/rules/" ? "the rules with a glob" : "the review subagent"}`,
        );
    return { written: [...written].sort(), warnings, notes: index.notes, prompt: setup.prompt };
}
