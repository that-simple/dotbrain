// A generated view: a file, or a block in a file, that `index` writes and `lint` checks.
import { type Document, str } from "../repo.ts";

export interface Outcome {
    content: string | null;
    notes: string[];
}

export interface View {
    path: string;
    name: string;
    /** Paths of the documents the view is built from. */
    inputs: string[];
    upToDate: (actual: string | null) => boolean;
    desired: (actual: string | null) => Outcome;
}

/** The first block of lines from a line matching `isBegin` to the next line equal to `end`, as line indexes. */
export function findBlock(lines: string[], isBegin: (l: string) => boolean, end: string): [number, number] | null {
    const a = lines.findIndex(isBegin);
    if (a === -1) return null;
    const b = lines.indexOf(end, a + 1);
    if (b === -1) return null;
    return [a, b];
}

export function description(doc: Document): string {
    return str(doc.fm.description) ?? "";
}
