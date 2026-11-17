import { parseYaml, YamlError, type YamlMap } from "./yaml.ts";

export interface Frontmatter {
  present: boolean;
  data: YamlMap;
  error: string | null;
  body: string;
}

export function splitFrontmatter(text: string): Frontmatter {
  if (!text.startsWith("---\n")) return { present: false, data: {}, error: null, body: text };
  const end = text.indexOf("\n---\n", 3);
  const endAtEof = text.endsWith("\n---") ? text.length - 4 : -1;
  const close = end !== -1 ? end : endAtEof;
  if (close === -1) return { present: false, data: {}, error: "frontmatter is not closed", body: text };
  const yaml = text.slice(4, close + 1);
  const body = text.slice(Math.min(close + 5, text.length));
  try {
    return { present: true, data: parseYaml(yaml), error: null, body };
  } catch (e) {
    if (e instanceof YamlError) return { present: true, data: {}, error: e.message, body };
    throw e;
  }
}

export interface Heading {
  level: number;
  text: string;
  line: number;
}

/** Marks every line of a markdown body that is inside a fenced code block (fences included). */
export function fencedLines(lines: string[]): boolean[] {
  const inside: boolean[] = [];
  let fence: string | null = null;
  for (const line of lines) {
    const m = /^ {0,3}(`{3,}|~{3,})/.exec(line);
    if (fence === null) {
      if (m) {
        fence = m[1]!;
        inside.push(true);
      } else {
        inside.push(false);
      }
    } else {
      inside.push(true);
      if (m && m[1]![0] === fence[0] && m[1]!.length >= fence.length && line.trim() === m[1]) fence = null;
    }
  }
  return inside;
}

export function headings(body: string): Heading[] {
  const lines = body.split("\n");
  const fenced = fencedLines(lines);
  const out: Heading[] = [];
  lines.forEach((line, i) => {
    if (fenced[i]) return;
    const m = /^ {0,3}(#{1,6})(?:[ \t]+(.*?))?[ \t]*$/.exec(line);
    if (!m) return;
    const text = (m[2] ?? "").replace(/[ \t]+#+$/, "").trim();
    out.push({ level: m[1]!.length, text, line: i });
  });
  return out;
}

/** Counts H2 headings by their text. */
export function sectionCounts(body: string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const h of headings(body)) {
    if (h.level === 2) counts.set(h.text, (counts.get(h.text) ?? 0) + 1);
  }
  return counts;
}

/** Content of the first H2 section with the given heading text, without leading and trailing blank lines. */
export function sectionContent(body: string, label: string): string | null {
  const lines = body.split("\n");
  const hs = headings(body);
  const start = hs.find((h) => h.level === 2 && h.text === label);
  if (!start) return null;
  const next = hs.find((h) => h.line > start.line && h.level <= 2);
  const content = lines.slice(start.line + 1, next ? next.line : lines.length);
  return trimBlankLines(content).join("\n");
}

export function trimBlankLines(lines: string[]): string[] {
  let a = 0;
  let b = lines.length;
  while (a < b && lines[a]!.trim() === "") a++;
  while (b > a && lines[b - 1]!.trim() === "") b--;
  return lines.slice(a, b);
}

/** Body without the H1 title line, without leading and trailing blank lines. */
export function bodyWithoutTitle(body: string): string {
  const lines = body.split("\n");
  const h1 = headings(body).find((h) => h.level === 1);
  const rest = h1 ? lines.slice(h1.line + 1) : lines;
  return trimBlankLines(rest).join("\n");
}

const INLINE_LINK = /(!?\[(?:[^\[\]\\]|\\.|\[[^\]]*\])*\]\()(<[^>]*>|[^()\s]*(?:\([^()\s]*\)[^()\s]*)*)((?:\s+(?:"[^"]*"|'[^']*'))?\))/g;

/**
 * Applies `fn` to the target of every inline link outside code (fenced blocks, code spans)
 * and HTML comments, and returns the rewritten text.
 */
export function mapLinks(text: string, fn: (target: string) => string): string {
  const lines = text.split("\n");
  const fenced = fencedLines(lines);
  let inComment = false;
  return lines
    .map((line, i) => {
      if (fenced[i]) return line;
      return mapLine(line, fn, (v) => (inComment = v), () => inComment);
    })
    .join("\n");
}

function mapLine(
  line: string,
  fn: (target: string) => string,
  setComment: (v: boolean) => void,
  getComment: () => boolean,
): string {
  let out = "";
  let i = 0;
  let plain = "";
  const flush = () => {
    out += plain.replace(INLINE_LINK, (_all, open: string, target: string, close: string) => {
      const bare = target.startsWith("<") ? target.slice(1, -1) : target;
      const mapped = fn(bare);
      return open + (target.startsWith("<") ? `<${mapped}>` : mapped) + close;
    });
    plain = "";
  };
  while (i < line.length) {
    if (getComment()) {
      const end = line.indexOf("-->", i);
      if (end === -1) {
        out += line.slice(i);
        return out;
      }
      out += line.slice(i, end + 3);
      i = end + 3;
      setComment(false);
      continue;
    }
    if (line.startsWith("<!--", i)) {
      flush();
      setComment(true);
      continue;
    }
    if (line[i] === "`") {
      const ticks = /^`+/.exec(line.slice(i))![0];
      const end = line.indexOf(ticks, i + ticks.length);
      if (end !== -1) {
        flush();
        out += line.slice(i, end + ticks.length);
        i = end + ticks.length;
        continue;
      }
      plain += ticks;
      i += ticks.length;
      continue;
    }
    plain += line[i];
    i++;
  }
  flush();
  return out;
}

/** Targets of inline links and reference definitions outside code and comments. */
export function linkTargets(text: string): string[] {
  const targets: string[] = [];
  mapLinks(text, (t) => {
    targets.push(t);
    return t;
  });
  const lines = text.split("\n");
  const fenced = fencedLines(lines);
  lines.forEach((line, i) => {
    if (fenced[i]) return;
    const m = /^ {0,3}\[[^\]]+\]:\s+(<[^>]*>|\S+)/.exec(line);
    if (m) targets.push(m[1]!.replace(/^<|>$/g, ""));
  });
  return targets;
}

export function isRelativeTarget(target: string): boolean {
  if (target === "" || target.startsWith("#") || target.startsWith("/")) return false;
  if (/^[a-zA-Z][a-zA-Z0-9+.\-]*:/.test(target)) return false;
  return true;
}
