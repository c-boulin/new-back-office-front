// Defense against upstream tooling that periodically appends orphan close
// tokens (bare `)`, `}`, `);`, `)}` on their own lines) to certain source
// files. Babel refuses to parse those files and Vite serves the module as
// a 500, surfacing to the browser as "Failed to fetch dynamically imported
// module". The `transform` hook strips trailing close-only lines from every
// .ts/.tsx file if — and only if — doing so restores paren/brace balance.
// Runs on both dev-serve and build.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function balanceCounts(src) {
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

function isBalanced(src) {
  const { p, b, s } = balanceCounts(src);
  return p === 0 && b === 0 && s === 0;
}

function healSource(code) {
  if (isBalanced(code)) return null;
  const lines = code.split("\n");
  const isJunkTail = (l) => /^[\s)}\];,]*$/.test(l);
  let removed = 0;
  while (lines.length > 0 && removed < 30) {
    const last = lines[lines.length - 1];
    if (!isJunkTail(last)) break;
    lines.pop();
    removed++;
    const candidate = lines.join("\n") + "\n";
    if (isBalanced(candidate)) return { code: candidate, removed };
  }
  return null;
}

/** @returns {import('vite').Plugin} */
export function jsxTailGuard() {
  return {
    name: "jsx-tail-guard",
    enforce: "pre",

    configResolved(cfg) {
      const initialTarget = resolve(
        cfg.root,
        "src/features/superAdmin/pages/TenantsListPage.tsx",
      );
      if (!existsSync(initialTarget)) return;
      try {
        const src = readFileSync(initialTarget, "utf8");
        const healed = healSource(src);
        if (!healed) return;
        writeFileSync(initialTarget, healed.code);
      } catch {
        // best-effort
      }
    },

    transform(code, id) {
      if (!/\.(ts|tsx)$/.test(id)) return null;
      if (id.includes("/node_modules/")) return null;
      const healed = healSource(code);
      if (!healed) return null;
      this.warn(
        `[jsx-tail-guard] Stripped ${healed.removed} orphan tail line(s) from ${id} to restore parse.`,
      );
      return { code: healed.code, map: null };
    },
  };
}
