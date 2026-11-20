// The compact form of the agent contract (its core and the work on the brain)
// and the tool add-ons are read from the specification itself, so that the tools
// and the specification have one source.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SPEC_DIR = fileURLToPath(new URL("../../spec/", import.meta.url));

function fences(markdown: string, afterHeading: string): string[] {
    const lines = markdown.split("\n");
    const start = lines.indexOf(afterHeading);
    if (start === -1) throw new Error(`specification: heading "${afterHeading}" not found`);
    const out: string[] = [];
    let current: string[] | null = null;
    for (const line of lines.slice(start + 1)) {
        if (current) {
            if (line === "```") {
                out.push(current.join("\n"));
                current = null;
            } else {
                current.push(line);
            }
        } else if (line === "```markdown") {
            current = [];
        } else if (line.startsWith("## ")) {
            break;
        }
    }
    return out;
}

let cache: { core: string; brainWork: string; tools: Record<string, string> } | null = null;

function load() {
    if (cache) return cache;
    const agents = readFileSync(SPEC_DIR + "adapters/agents.md", "utf8");
    const [core, brainWork] = fences(agents, "## Compact form");
    if (!core || !brainWork) throw new Error("specification: the two parts of the compact form not found");
    const [claude] = fences(agents, "## Tool add-ons");
    if (!claude) throw new Error("specification: Claude Code add-on not found");
    cache = { core, brainWork, tools: { "CLAUDE.md": claude } };
    return cache;
}

export interface ContractInput {
    brainPath: string;
    description: string;
}

function fill(text: string, input: ContractInput): string {
    return text.split("<brain-path>").join(input.brainPath).split("<brain-description>").join(input.description);
}

/** The core of the compact form, for the managed block of a root instruction file. */
export function compactForm(input: ContractInput): string {
    return fill(load().core, input);
}

/** The work on the brain of the compact form, for the rule file of the brain. */
export function brainWorkForm(input: ContractInput): string {
    return fill(load().brainWork, input);
}

/** Both parts of the compact form as written in the specification, placeholders unfilled. */
export function compactFormParts(): { core: string; brainWork: string } {
    const { core, brainWork } = load();
    return { core, brainWork };
}

/** The tool add-on for a root instruction file, by its file name. */
export function toolAddon(fileName: string): string | null {
    return load().tools[fileName] ?? null;
}
