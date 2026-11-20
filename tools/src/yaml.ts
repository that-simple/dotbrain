// A parser for the subset of YAML used in dotbrain frontmatter: block mappings,
// block sequences of scalars, flow sequences of scalars, plain and quoted scalars,
// and comments. Scalars stay text: `spec: 1.0.0` is "1.0.0", `decided: 2026-10-28` is
// "2026-10-28". Anything outside the subset is an error.

export type YamlValue = string | YamlValue[] | YamlMap;
export type YamlMap = { [key: string]: YamlValue };

export class YamlError extends Error {}

interface Line {
    indent: number;
    text: string;
    number: number;
}

export function parseYaml(source: string): YamlMap {
    const lines: Line[] = [];
    source.split("\n").forEach((raw, i) => {
        if (raw.includes("\t")) {
            if (raw.trim() !== "") throw new YamlError(`line ${i + 1}: tabs are not supported`);
        }
        const text = stripComment(raw).trimEnd();
        if (text.trim() === "") return;
        lines.push({ indent: text.length - text.trimStart().length, text: text.trimStart(), number: i + 1 });
    });
    if (lines.length === 0) return {};
    const state = { pos: 0 };
    const first = lines[0]!;
    if (first.indent !== 0) throw new YamlError(`line ${first.number}: unexpected indentation`);
    const value = parseBlock(lines, state, 0);
    if (state.pos < lines.length) {
        throw new YamlError(`line ${lines[state.pos]!.number}: unexpected indentation`);
    }
    if (typeof value === "string" || Array.isArray(value)) {
        throw new YamlError("frontmatter is not a mapping");
    }
    return value;
}

function stripComment(raw: string): string {
    let quote: string | null = null;
    for (let i = 0; i < raw.length; i++) {
        const c = raw[i];
        if (quote) {
            if (c === quote) {
                if (quote === "'" && raw[i + 1] === "'") i++;
                else quote = null;
            } else if (c === "\\" && quote === '"') {
                i++;
            }
        } else if (c === '"' || c === "'") {
            const before = raw.slice(0, i).trimEnd();
            if (before === "" || /[:\-\[,]$/.test(before)) quote = c;
        } else if (c === "#" && (i === 0 || raw[i - 1] === " ")) {
            return raw.slice(0, i);
        }
    }
    return raw;
}

function parseBlock(lines: Line[], state: { pos: number }, indent: number): YamlValue {
    const line = lines[state.pos]!;
    if (line.text === "-" || line.text.startsWith("- ")) return parseSequence(lines, state, indent);
    return parseMapping(lines, state, indent);
}

function parseSequence(lines: Line[], state: { pos: number }, indent: number): YamlValue[] {
    const items: YamlValue[] = [];
    while (state.pos < lines.length) {
        const line = lines[state.pos]!;
        if (line.indent < indent) break;
        if (line.indent > indent) throw new YamlError(`line ${line.number}: unexpected indentation`);
        if (!(line.text === "-" || line.text.startsWith("- "))) break;
        const rest = line.text.slice(1).trim();
        if (rest === "") throw new YamlError(`line ${line.number}: nested sequence items are not supported`);
        if (/^[^"'\[][^:]*:(\s|$)/.test(rest)) {
            throw new YamlError(`line ${line.number}: mappings in sequences are not supported`);
        }
        items.push(parseScalarOrFlow(rest, line.number));
        state.pos++;
    }
    return items;
}

function parseMapping(lines: Line[], state: { pos: number }, indent: number): YamlMap {
    const map: YamlMap = {};
    while (state.pos < lines.length) {
        const line = lines[state.pos]!;
        if (line.indent < indent) break;
        if (line.indent > indent) throw new YamlError(`line ${line.number}: unexpected indentation`);
        const m = /^([A-Za-z0-9_][A-Za-z0-9_.\-]*|"[^"]*"|'[^']*'):(?:\s+(.*))?$/.exec(line.text);
        if (!m) throw new YamlError(`line ${line.number}: expected "key: value"`);
        let key = m[1]!;
        if (key.startsWith('"') || key.startsWith("'")) key = key.slice(1, -1);
        if (Object.hasOwn(map, key)) throw new YamlError(`line ${line.number}: duplicate key "${key}"`);
        const rest = (m[2] ?? "").trim();
        state.pos++;
        if (rest !== "") {
            map[key] = parseScalarOrFlow(rest, line.number);
            continue;
        }
        const next = lines[state.pos];
        if (next && (next.indent > indent || (next.indent === indent && next.text.startsWith("- ")))) {
            map[key] = parseBlock(lines, state, next.indent);
        } else {
            map[key] = "";
        }
    }
    return map;
}

function parseScalarOrFlow(text: string, lineNumber: number): YamlValue {
    if (text.startsWith("[")) {
        if (!text.endsWith("]")) throw new YamlError(`line ${lineNumber}: unterminated flow sequence`);
        const inner = text.slice(1, -1).trim();
        if (inner === "") return [];
        return splitFlow(inner, lineNumber).map((item) => parseScalar(item.trim(), lineNumber));
    }
    return parseScalar(text, lineNumber);
}

function splitFlow(inner: string, lineNumber: number): string[] {
    const parts: string[] = [];
    let current = "";
    let quote: string | null = null;
    for (let i = 0; i < inner.length; i++) {
        const c = inner[i]!;
        if (quote) {
            current += c;
            if (c === "\\" && quote === '"') {
                current += inner[++i] ?? "";
            } else if (c === quote) {
                quote = null;
            }
        } else if (c === '"' || c === "'") {
            quote = c;
            current += c;
        } else if (c === ",") {
            parts.push(current);
            current = "";
        } else if (c === "[" || c === "{") {
            throw new YamlError(`line ${lineNumber}: nested flow collections are not supported`);
        } else {
            current += c;
        }
    }
    if (quote) throw new YamlError(`line ${lineNumber}: unterminated quoted scalar`);
    parts.push(current);
    return parts;
}

function parseScalar(text: string, lineNumber: number): string {
    if (text.startsWith('"')) {
        if (text.length < 2 || !text.endsWith('"'))
            throw new YamlError(`line ${lineNumber}: unterminated quoted scalar`);
        let out = "";
        const body = text.slice(1, -1);
        for (let i = 0; i < body.length; i++) {
            const c = body[i]!;
            if (c === '"') throw new YamlError(`line ${lineNumber}: unescaped quote`);
            if (c !== "\\") {
                out += c;
                continue;
            }
            const e = body[++i];
            const escapes: Record<string, string> = { '"': '"', "\\": "\\", "/": "/", n: "\n", t: "\t" };
            if (e === undefined || !(e in escapes)) throw new YamlError(`line ${lineNumber}: unsupported escape`);
            out += escapes[e];
        }
        return out;
    }
    if (text.startsWith("'")) {
        if (text.length < 2 || !text.endsWith("'"))
            throw new YamlError(`line ${lineNumber}: unterminated quoted scalar`);
        const body = text.slice(1, -1);
        if (/'(?!')/.test(body.replace(/''/g, ""))) throw new YamlError(`line ${lineNumber}: unescaped quote`);
        return body.replace(/''/g, "'");
    }
    if (/^[&*!|>{%@`]/.test(text)) {
        throw new YamlError(`line ${lineNumber}: unsupported YAML syntax "${text[0]}"`);
    }
    if (/:\s/.test(text) || text.endsWith(":")) {
        throw new YamlError(`line ${lineNumber}: plain scalar contains ": "`);
    }
    return text;
}
