// The minimal valid brain from validity.md.
import type { Files } from "../build.ts";
import { INDEX_EMPTY } from "./documents.ts";

export const MINIMAL: Files = {
    ".brain/README.md": `---
brain: example
lang: en
spec: 1.0.0
description: "One sentence about what the brain covers."
---
# Example

What this brain is about.

${INDEX_EMPTY}
`,
};
export const MINIMAL_README = MINIMAL[".brain/README.md"]!;
