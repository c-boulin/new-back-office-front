#!/usr/bin/env node
// Auto-heal orphan JSX tail tokens (bare `)`, `}`, `);`, `)}` etc. appended
// to a file's end) that occasionally slip in via upstream tooling. Strips
// trailing close-only lines from each unbalanced .ts/.tsx file under src/
// until delimiter balance is restored. Exits 0 whether or not any file
// needed healing; exits 1 only if a file is still unbalanced after healing.
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
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

function delimBalance(src) {
  const stripped = src
    .replace(/\/\/[^\n]*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/`(?:\\.|[^`\\])*`/g, "``")
    .replace(/"(?:\\.|[^"\\])*"/g, '""')
    .replace(/'(?:\\.|[^'\\])*'/g, "''");
  let p = 0;
  let b = 0;
  let s = 0;
  for (const ch of stripped) {
    if (ch === "(") p++;
    else if (ch === ")") p--;
    else if (ch === "{") b++;
    else if (ch === "}") b--;
    else if (ch === "[") s++;
    else if (ch === "]") s--;
  }
  return { p, b, s };
}

const JUNK_TAIL = /^[\s)}\];,]*$/;

let healed = 0;
let broken = 0;

for (const file of walk(ROOT)) {
  const src = readFileSync(file, "utf8");
  let { p, b, s } = delimBalance(src);
  if (p === 0 && b === 0 && s === 0) continue;

  const lines = src.split("\n");
  let removed = 0;
  while (lines.length > 0 && removed < 20) {
    const last = lines[lines.length - 1];
    if (!JUNK_TAIL.test(last)) break;
    lines.pop();
    removed++;
    const candidate = lines.join("\n") + "\n";
    const bal = delimBalance(candidate);
    if (bal.p === 0 && bal.b === 0 && bal.s === 0) {
      writeFileSync(file, candidate);
      console.log(`[check-eof] healed ${file} (removed ${removed} orphan tail line(s))`);
      healed++;
      p = 0;
      b = 0;
      s = 0;
      break;
    }
  }

  if (p !== 0 || b !== 0 || s !== 0) {
    console.error(
      `[check-eof] ${file}: unbalanced delimiters (paren=${p}, brace=${b}, bracket=${s}) — cannot auto-heal.`,
    );
    broken++;
  }
}

if (broken > 0) {
  console.error(`[check-eof] ${broken} file(s) still unbalanced after heal attempts.`);
  process.exit(1);
}
if (healed > 0) {
  console.log(`[check-eof] healed ${healed} file(s).`);
} else {
  console.log("[check-eof] all .ts(x) files under src/ end cleanly.");
}
