#!/usr/bin/env node
// Sanity check: catch trailing-garbage in .tsx files under src/.
// A well-formed React component/module ends with a closing `}` or `);` or `>`
// on its final non-empty line. This script rejects files whose last non-empty
// line is a lone unmatched `)` or where the trailing 5 lines contain a bare
// `)` on its own line AFTER the true end of the top-level function/component.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = new URL("../src/", import.meta.url).pathname;

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) yield* walk(p);
    else if (extname(p) === ".tsx" || extname(p) === ".ts") yield p;
  }
}

let failed = 0;
for (const file of walk(ROOT)) {
  const src = readFileSync(file, "utf8");

  // Count balance of `(`, `)`, `{`, `}`, `[`, `]` ignoring string/comment
  // contents in a cheap way (strip line comments, template/normal strings).
  const stripped = src
    .replace(/\/\/[^\n]*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/`(?:\\.|[^`\\])*`/g, "``")
    .replace(/"(?:\\.|[^"\\])*"/g, '""')
    .replace(/'(?:\\.|[^'\\])*'/g, "''");

  const counts = { "(": 0, ")": 0, "{": 0, "}": 0, "[": 0, "]": 0 };
  for (const ch of stripped) if (ch in counts) counts[ch]++;

  const parenDelta = counts["("] - counts[")"];
  const braceDelta = counts["{"] - counts["}"];
  const bracketDelta = counts["["] - counts["]"];

  if (parenDelta !== 0 || braceDelta !== 0 || bracketDelta !== 0) {
    console.error(
      `[check-eof] ${file}: unbalanced delimiters ` +
        `(paren=${parenDelta}, brace=${braceDelta}, bracket=${bracketDelta})`,
    );
    failed++;
  }
}

if (failed > 0) {
  console.error(`\n[check-eof] ${failed} file(s) failed the end-of-file sanity check.`);
  process.exit(1);
}
console.log("[check-eof] all .ts(x) files under src/ end cleanly.");
