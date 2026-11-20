// `init`: the wizard and the skeleton it writes (step 3, stage 1).
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, test } from "node:test";
import { fileURLToPath } from "node:url";
import { runIndex } from "../src/index.ts";
import {
    CLAUDE_SETTINGS,
    InitError,
    PACKAGE_VERSION,
    QUESTIONS,
    scaffold,
    SETUP_FILE,
    TEMPLATES_DIR,
    type Answers,
} from "../src/init.ts";
import { lint, severity } from "../src/lint.ts";
import { loadRepo } from "../src/repo.ts";
import { removeTempDirs, repo, snapshot, tempDir } from "./helpers.ts";

const CLI = fileURLToPath(new URL("../dotbrain.ts", import.meta.url));
const INSTRUCTION_FILES = ["CLAUDE.md", "AGENTS.md", ".github/copilot-instructions.md"];

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

afterEach(removeTempDirs);

function assertValid(root: string) {
    const errors = lint(loadRepo(root)).violations.filter((v) => severity(v.rule) === "error");
    assert.deepEqual(errors, [], "lint reports no errors");
    assert.deepEqual(runIndex(root, { check: true }).changed, [], "index --check finds no out-of-date views");
}

function cli(args: string[], input = "") {
    return spawnSync(process.execPath, [CLI, "init", ...args], { input, encoding: "utf8" });
}

test("in an empty repository the skeleton is valid and points the agent to the setup file", () => {
    const root = repo();
    const result = scaffold(root, ANSWERS);
    assertValid(root);
    const files = snapshot(root);
    for (const p of [
        ".brain/README.md",
        ".brain/decisions/README.md",
        ".brain/decisions/process/2026-11-12-languages.md",
        ".brain/decisions/process/2026-11-12-order-of-work.md",
        ".claude/agents/brain-review.md",
        CLAUDE_SETTINGS,
        SETUP_FILE,
        ...INSTRUCTION_FILES,
        ".claude/rules/notes-api.md",
        ".brain/AGENTS.md",
        ".github/instructions/notes-api.instructions.md",
    ])
        assert.ok(files.has(p), p);
    assert.match(
        files.get(".claude/rules/notes-api.md")!,
        /^---\npaths:\n  - "\.brain\/\*\*"\n---\n<!-- BEGIN:dotbrain 1\.0\.0 -->[\s\S]*## Work on the brain/,
    );
    assert.match(files.get(".brain/AGENTS.md")!, /^<!-- BEGIN:dotbrain 1\.0\.0 -->[\s\S]*## Work on the brain/);
    assert.match(files.get(".github/instructions/notes-api.instructions.md")!, /^---\napplyTo: "\.brain\/\*\*"\n---\n/);
    assert.match(files.get("AGENTS.md")!, /- `\.brain\/\*\*`: \[Work on the brain\]\(\.brain\/AGENTS\.md\)/);
    const readme = files.get(".brain/README.md")!;
    assert.match(
        readme,
        /^---\nbrain: notes-api\nlang: en\nspec: 1\.0\.0\nowner: Ana Example\ndescription: "A notes API for small teams\."\n---\n# notes-api\n/,
    );
    assert.doesNotMatch(readme, /sections:|^#.*map every section key/m);
    for (const f of INSTRUCTION_FILES) {
        const text = files.get(f)!;
        assert.match(text, /^# notes-api\n\n<!-- BEGIN:dotbrain 1\.0\.0 -->/);
        assert.match(text, /### Languages of the work[\s\S]*### Brain changes with the work/);
        assert.match(
            text,
            /<!-- END:dotbrain -->\n\nSetting up the brain is not finished: follow \[DOTBRAIN-SETUP\.md\]\((\.\.\/)?DOTBRAIN-SETUP\.md\)/,
        );
    }
    assert.match(files.get(".github/copilot-instructions.md")!, /\(\.\.\/DOTBRAIN-SETUP\.md\)/);
    const setup = files.get(SETUP_FILE)!;
    assert.match(setup, /## Steps\n\n1\. \*\*Translate\.\*\*/);
    assert.match(setup, /### area\.md\n\n````markdown\n---\n/);
    assert.match(setup, /\*\*Decisions from the code\.\*\*[^\n]*`status: proposed`/);
    assert.match(setup, /### decision-proposed\.md\n\n````markdown\n---\nstatus: proposed\n/);
    assert.doesNotMatch(setup, /\]\((\.\.\/|[a-z-]+\.md)/, "relative links of the procedure are reduced to their text");
    assert.doesNotMatch(setup, /<claude-hook>|dotbrain lint` hook/, "no step to add the hook when init wrote it");
    assert.equal(result.prompt, "Finish dotbrain.");
});

test("in a repository with code the code is left alone", () => {
    const code = { "package.json": '{ "name": "notes-api" }\n', "src/server.js": "export const port = 8080;\n" };
    const root = repo(code);
    scaffold(root, ANSWERS);
    assertValid(root);
    for (const [p, c] of Object.entries(code)) assert.equal(readFileSync(join(root, p), "utf8"), c);
});

test("ticket keys, the order of work before the work and a brain in Polish give a valid brain", () => {
    const root = repo();
    scaffold(root, { ...ANSWERS, lang: "pl", order: "before-the-work", "step-ids": "yes", owner: 'Zespół "API"' });
    assertValid(root);
    const decision = readFileSync(join(root, ".brain/decisions/process/2026-11-12-step-ids.md"), "utf8");
    assert.match(decision, /^---\nstatus: accepted\ndecided: 2026-11-12\napply: always\n/);
    const order = readFileSync(join(root, ".brain/decisions/process/2026-11-12-order-of-work.md"), "utf8");
    assert.match(order, /# Brain changes before the work/);
    const readme = readFileSync(join(root, ".brain/README.md"), "utf8");
    assert.match(readme, /^owner: "Zespół \\"API\\""$/m);
    assert.match(readme, /^sections:\n  goal: Goal\n/m);
    for (const f of INSTRUCTION_FILES)
        assert.match(readFileSync(join(root, f), "utf8"), /### Steps named by ticket keys/);
});

test("in a repository with a brain init fails and changes no file", () => {
    const root = repo({ ".brain/README.md": "---\nbrain: x\n---\n# X\n", "CLAUDE.md": "# X\n" });
    const before = snapshot(root);
    assert.throws(() => scaffold(root, ANSWERS), InitError);
    const r = cli([root, "--yes", "--description=A."]);
    assert.equal(r.status, 2);
    assert.match(r.stderr, /already has a brain/);
    assert.deepEqual(snapshot(root), before);
});

test("an existing file init would write stops it before any change", () => {
    const root = repo({ [SETUP_FILE]: "mine\n" });
    const before = snapshot(root);
    assert.throws(() => scaffold(root, ANSWERS), /DOTBRAIN-SETUP\.md already exists/);
    assert.deepEqual(snapshot(root), before);
});

test("in an existing CLAUDE.md the block goes after the first heading and the rest is unchanged", () => {
    const original = "# Notes API\n\nRun `npm start` to serve the API.\n\n## Deploy\n\nPush to main.\n";
    const root = repo({ "CLAUDE.md": original });
    scaffold(root, ANSWERS);
    assertValid(root);
    const text = readFileSync(join(root, "CLAUDE.md"), "utf8");
    const begin = text.indexOf("<!-- BEGIN:dotbrain");
    const end = text.indexOf("<!-- END:dotbrain -->") + "<!-- END:dotbrain -->".length;
    assert.equal(text.slice(0, begin), "# Notes API\n\n");
    const pointer =
        "\n\nSetting up the brain is not finished: follow [DOTBRAIN-SETUP.md](DOTBRAIN-SETUP.md), then delete that file and this line.";
    assert.ok(text.slice(end).startsWith(pointer));
    assert.equal(text.slice(0, begin - 2) + text.slice(end + pointer.length), original);
});

test("the wizard asks one question at a time, rejects a wrong answer with its reason and writes what the answers file writes", () => {
    const asked = repo();
    const input =
        ["Notes API", "notes-api", "", "", "A notes API for small teams.", "", "later", "with-the-work", "", "y"].join(
            "\n",
        ) + "\n";
    const r = cli([asked, "--date=2026-11-12"], input);
    assert.equal(r.status, 0, r.stderr);
    const prompts = QUESTIONS.filter((q) => q.asked).map((q) => q.prompt);
    let at = 0;
    for (const p of prompts) {
        const i = r.stdout.indexOf(p, at);
        assert.ok(i >= at, `asked in order: ${p}`);
        at = i;
    }
    assert.match(r.stdout, /"Notes API" is not lowercase kebab-case/);
    assert.match(r.stdout, /answer one of: with-the-work, before-the-work/);
    assert.match(r.stdout, /Summary:\n  name: notes-api\n  lang: en\n  owner: Ana Example\n/);
    assert.ok(r.stdout.indexOf("Summary:") < r.stdout.indexOf("wrote "), "the summary comes before writing");

    const given = repo();
    const answers = join(tempDir(), "answers.json");
    writeFileSync(answers, JSON.stringify(ANSWERS));
    const g = cli([given, "--answers", answers]);
    assert.equal(g.status, 0, g.stderr);
    assert.deepEqual(snapshot(asked), snapshot(given));
});

test("answers without questions are checked, and declining the summary writes nothing", () => {
    const root = repo();
    const bad = cli([root, "--lang=english", "--yes", "--description=A."]);
    assert.equal(bad.status, 2);
    assert.match(bad.stderr, /"english" is not a BCP 47 tag/);
    const noDescription = cli([root, "--yes"]);
    assert.equal(noDescription.status, 2);
    assert.match(noDescription.stderr, /no answer for description/);
    const declined = cli([root, "--date=2026-11-12"], "\n\n\nA.\n\n\n\nn\n");
    assert.equal(declined.status, 1);
    assert.deepEqual([...snapshot(root).keys()], []);
});

test("a change to a template changes what init writes, without a change to the code", () => {
    const templates = join(tempDir(), "templates");
    cpSync(TEMPLATES_DIR, templates, { recursive: true });
    const file = join(templates, "order-of-work.md");
    writeFileSync(
        file,
        readFileSync(file, "utf8").replaceAll("go in the same pull request", "always go in the same pull request"),
    );
    const root = repo();
    scaffold(root, ANSWERS, templates);
    assertValid(root);
    assert.match(
        readFileSync(join(root, ".brain/decisions/process/2026-11-12-order-of-work.md"), "utf8"),
        /always go in the same pull request/,
    );
    assert.match(readFileSync(join(root, "CLAUDE.md"), "utf8"), /always go in the same pull request/);
});

test("init warns when git ignores the directories of Claude Code", () => {
    const root = repo({ ".gitignore": ".claude/\n" });
    const result = scaffold(root, ANSWERS);
    assert.equal(result.warnings.length, 2);
    assert.match(result.warnings[0]!, /git ignores \.claude\/rules\//);
});

test("init writes the Claude Code hook with the exact version of its package", () => {
    const root = repo();
    scaffold(root, ANSWERS);
    const pkg = JSON.parse(readFileSync(fileURLToPath(new URL("../../package.json", import.meta.url)), "utf8"));
    assert.equal(PACKAGE_VERSION, pkg.version);
    const settings = JSON.parse(readFileSync(join(root, CLAUDE_SETTINGS), "utf8"));
    const [entry] = settings.hooks.Stop;
    assert.equal(entry.hooks[0].type, "command");
    assert.ok(
        entry.hooks[0].command.includes(`npx --yes @that-simple/dotbrain@${pkg.version} lint`),
        entry.hooks[0].command,
    );
    assert.doesNotMatch(entry.hooks[0].command, /<version>/);
});

test("an existing .claude/settings.json stays unchanged, and the setup file tells the agent to add the hook", () => {
    const own = '{\n  "permissions": { "allow": ["Bash(npm test)"] }\n}\n';
    const root = repo({ [CLAUDE_SETTINGS]: own });
    scaffold(root, ANSWERS);
    assertValid(root);
    assert.equal(readFileSync(join(root, CLAUDE_SETTINGS), "utf8"), own);
    const setup = readFileSync(join(root, SETUP_FILE), "utf8");
    const step = setup.match(
        /\*\*The `dotbrain lint` hook\.\*\*[^\n]*`hooks\.Stop`[^\n]*\n\n```json\n([\s\S]*?)\n```\n\n## When you are done/,
    );
    assert.ok(step, "the step to add the hook, after the steps");
    const entry = JSON.parse(step[1]!);
    assert.ok(entry.hooks[0].command.includes(`@that-simple/dotbrain@${PACKAGE_VERSION} lint`));
});
