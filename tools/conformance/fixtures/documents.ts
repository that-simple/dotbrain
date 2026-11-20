// Helpers that write the documents of the fixtures: accepted decisions and steps, in English or with labels.

export const INDEX_EMPTY = `<!-- BEGIN:dotbrain index -->
<!-- Generated from document frontmatter. Do not edit by hand; regenerate on conflict. -->
<!-- END:dotbrain index -->`;

export const DOMAINS_EN =
    "- Decisions are in subdirectories of `decisions/` by domain (`decisions/<domain>/`), such as `process/` for the rules of work. A domain is a short English name in kebab-case. A new domain is created when a decision fits none of the existing ones; a decision that concerns several domains goes to the one where it has the most effect.";

export interface AcceptedOptions {
    apply?: string;
    date?: string;
    context?: string;
    labels?: { context: string; decision: string };
}

export function accepted(title: string, desc: string, decision: string, o: AcceptedOptions = {}): string {
    const labels = o.labels ?? { context: "Context", decision: "Decision" };
    let fm = `---\nstatus: accepted\ndecided: ${o.date ?? "2026-11-01"}\n`;
    if (o.apply) fm += `apply: ${o.apply}\n`;
    fm += `description: "${desc}"\n---\n`;
    let body = `# ${title}\n\n`;
    if (o.context) body += `## ${labels.context}\n\n${o.context}\n\n`;
    return `${fm}${body}## ${labels.decision}\n\n${decision}\n`;
}

export const EN_LABELS = { goal: "Goal", scope: "Scope", acceptance: "Acceptance criteria", log: "Log", step: "Step" };
export const PL_LABELS = {
    goal: "Cel",
    scope: "Zakres",
    acceptance: "Kryteria akceptacji",
    log: "Przebieg",
    step: "Krok",
};

export interface StepOptions {
    log?: string[];
    assignee?: string;
    labels?: typeof EN_LABELS;
}

export function step(
    num: string,
    title: string,
    status: string,
    desc: string,
    goal: string,
    scope: string,
    criteria: string[],
    o: StepOptions = {},
): string {
    const L = o.labels ?? EN_LABELS;
    let fm = `---\nstatus: ${status}\n`;
    if (o.assignee) fm += `assignee: [${o.assignee}]\n`;
    fm += `description: "${desc}"\n---\n`;
    let body = `# ${L.step} ${num}: ${title}\n\n## ${L.goal}\n\n${goal}\n\n## ${L.scope}\n\n${scope}\n\n## ${L.acceptance}\n\n`;
    body += `${criteria.map((c, i) => `${i + 1}. ${c}`).join("\n")}\n`;
    if (o.log) body += `\n## ${L.log}\n\n${o.log.join("\n")}\n`;
    return fm + body;
}
