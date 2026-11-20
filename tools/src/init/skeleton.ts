// The skeleton of a brain from the templates, read at run time: the brain index, the first decisions, the
// review subagent, the Claude Code settings and the setup file with the instruction for the agent.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { isRelativeTarget, splitFrontmatter } from "../markdown.ts";
import { str } from "../repo.ts";
import { MANAGED_END } from "../views/managed-block.ts";
import { type Answers, InitError } from "./questions.ts";

export const TEMPLATES_DIR = fileURLToPath(new URL("../../../templates/", import.meta.url));
export const SETUP_FILE = "DOTBRAIN-SETUP.md";
export const CLAUDE_SETTINGS = ".claude/settings.json";
/** The version of the package init runs from, written into the hook so that it runs the same `lint`. */
export const PACKAGE_VERSION: string = JSON.parse(
    readFileSync(fileURLToPath(new URL("../../../package.json", import.meta.url)), "utf8"),
).version;

interface Plan {
    /** Files written by init, which must not exist yet. */
    created: Map<string, string>;
    decisions: string[];
}

function readTemplate(dir: string, name: string): string {
    const file = join(dir, name);
    if (!existsSync(file)) throw new InitError(`template ${name} not found in ${dir}`);
    return readFileSync(file, "utf8");
}

export function fill(text: string, values: Record<string, string>): string {
    return text.replace(/<[^<>\n]+>/g, (m) => values[m] ?? m);
}

function yamlQuoted(value: string): string {
    return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function yamlScalar(value: string): string {
    return /^[A-Za-z0-9][A-Za-z0-9 ._@/-]*$/.test(value) && !value.endsWith(" ") ? value : `"${yamlQuoted(value)}"`;
}

function isEnglish(lang: string): boolean {
    return lang.split("-")[0]!.toLowerCase() === "en";
}

/** `.brain/README.md` from the index template: the manifest filled in, its comments removed, and the map removed for English. */
function brainReadme(template: string, a: Answers): string {
    const filled = fill(template, {
        "<brain-name>": a.name!,
        "<language-tag>": a.lang!,
        "<person-or-role>": yamlScalar(a.owner!),
        "<One sentence: what this brain is the source of truth for.>": yamlQuoted(a.description!),
        "<Project name>": a.name!,
    });
    const fm = splitFrontmatter(filled);
    if (!fm.present) throw new InitError("template index.md has no frontmatter");
    const head = filled.slice(0, filled.length - fm.body.length).split("\n");
    const out: string[] = [];
    let inSections = false;
    for (const line of head) {
        if (/^\s*#/.test(line)) continue;
        if (inSections && /^\s+\S/.test(line)) continue;
        inSections = false;
        if (line === "sections:" && isEnglish(a.lang!)) {
            inSections = true;
            continue;
        }
        out.push(line);
    }
    return out.join("\n") + fm.body;
}

export function plan(a: Answers, templates: string): Plan {
    const created = new Map<string, string>();
    const date = a.date!;
    const decision = (slug: string, template: string, values: Record<string, string> = {}) => {
        const path = `.brain/decisions/process/${date}-${slug}.md`;
        created.set(path, fill(readTemplate(templates, template), { "<YYYY-MM-DD>": date, ...values }));
        return path;
    };
    created.set(".brain/README.md", brainReadme(readTemplate(templates, "index.md"), a));
    const decisions = [
        decision("languages", "languages.md", { "<language>": a.languages! }),
        decision("order-of-work", a.order === "before-the-work" ? "order-of-work-before.md" : "order-of-work.md"),
    ];
    if (a["step-ids"] === "yes") decisions.push(decision("step-ids", "step-ids.md"));
    created.set(".claude/agents/brain-review.md", readTemplate(templates, "brain-review.md"));
    return { created, decisions };
}

/** The part "Finishing the setup" of the procedure, with relative links reduced to their text, and the templates it links to. */
function finishingSteps(templates: string): { steps: string; linked: string[] } {
    const lines = readTemplate(templates, "README.md").split("\n");
    const start = lines.indexOf("## Finishing the setup");
    if (start === -1) throw new InitError('templates/README.md has no section "## Finishing the setup"');
    let end = lines.findIndex((l, i) => i > start && l.startsWith("## "));
    if (end === -1) end = lines.length;
    const linked: string[] = [];
    const unlink = (prose: string) =>
        prose.replace(/\[([^\]]*)\]\(([^()\s]+)\)/g, (link, text: string, target: string) => {
            if (!isRelativeTarget(target)) return link;
            const path = target.split("#")[0]!;
            if (
                !path.includes("/") &&
                path.endsWith(".md") &&
                existsSync(join(templates, path)) &&
                !linked.includes(path)
            )
                linked.push(path);
            return text;
        });
    // Code spans (between backticks) are kept as they are.
    const steps = lines
        .slice(start + 1, end)
        .join("\n")
        .trim()
        .split(/(`[^`]*`)/)
        .map((part, i) => (i % 2 === 1 ? part : unlink(part)))
        .join("");
    return { steps, linked };
}

/** `.claude/settings.json` from the template, with the version of the package in the hook. */
export function claudeSettings(templates: string): string {
    const text = readTemplate(templates, "claude-settings.json").split("<version>").join(PACKAGE_VERSION);
    try {
        JSON.parse(text);
    } catch (e) {
        throw new InitError(`template claude-settings.json is not valid JSON: ${(e as Error).message}`);
    }
    return text;
}

/** The entries of `hooks.Stop` of the settings, for an agent adding them to an existing file. */
function stopEntries(settings: string): string {
    const stop = (JSON.parse(settings) as { hooks?: { Stop?: unknown[] } }).hooks?.Stop;
    if (!Array.isArray(stop) || stop.length === 0)
        throw new InitError("template claude-settings.json has no `hooks.Stop` entry");
    return stop.map((entry) => JSON.stringify(entry, null, 2)).join("\n");
}

export function setupFile(
    templates: string,
    settings: string | null,
): { content: string; pointer: string; prompt: string } {
    const fm = splitFrontmatter(readTemplate(templates, "agent-setup.md"));
    const pointer = str(fm.data.pointer);
    const prompt = str(fm.data.prompt);
    const hook = str(fm.data.hook);
    if (!fm.present || fm.error || !pointer || !prompt || !hook)
        throw new InitError("template agent-setup.md needs `pointer`, `prompt` and `hook` in its frontmatter");
    const { steps, linked } = finishingSteps(templates);
    const appendix = linked
        .map(
            (name) => `### ${name}\n\n\`\`\`\`markdown\n${readTemplate(templates, name).replace(/\n*$/, "\n")}\`\`\`\``,
        )
        .join("\n\n");
    // Only when init did not write `.claude/settings.json`: the agent adds the hook to the existing file.
    const hookStep = settings === null ? "" : `\n${hook}\n\n\`\`\`json\n${stopEntries(settings)}\n\`\`\`\n`;
    const parts: Record<string, string> = { "<finishing-steps>": steps, "<templates>": appendix };
    const content = fm.body
        .replace(/^\n+/, "")
        .replace(/\n<claude-hook>\n/, () => `\n${hookStep}`)
        .replace(/<finishing-steps>|<templates>/g, (m) => parts[m]!)
        .replace(/\n*$/, "\n");
    return { content, pointer, prompt };
}

/** Inserts the line pointing to the setup file directly after the managed block, outside it. */
export function withPointer(text: string, pointer: string): string {
    const lines = text.split("\n");
    const end = lines.indexOf(MANAGED_END);
    if (end === -1) throw new InitError("managed block not found after index");
    const insert = ["", pointer];
    if (lines[end + 1] !== undefined && lines[end + 1]!.trim() !== "") insert.push("");
    lines.splice(end + 1, 0, ...insert);
    return lines.join("\n");
}
