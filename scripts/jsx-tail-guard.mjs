// Defense against upstream tooling that periodically appends orphan close
// tokens (bare `)`, `}`, `);`, `)}` on their own lines) to certain source
// files. Babel refuses to parse those files and Vite serves the module as
// a 500, surfacing to the browser as "Failed to fetch dynamically imported
// module". This plugin:
//   1. `transform` hook: strips trailing close-only lines from every .ts/.tsx
//      file if — and only if — doing so restores paren/brace balance. Runs
//      on both dev-serve and build.
//   2. `configureServer` hook: attaches an fs.watch on src/ and re-heals the
//      file on disk within milliseconds of any modification, so tsc and other
//      external tooling also see a clean file.

import { readFileSync, writeFileSync, watch, existsSync } from "node:fs";
import { join, resolve } from "node:path";

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
  let srcDir = "";

  return {
    name: "jsx-tail-guard",
    enforce: "pre",

    configResolved(cfg) {
      srcDir = resolve(cfg.root, "src");
    },

    configureServer(server) {
      if (!existsSync(srcDir)) return;
      const healOnDisk = (fullPath) => {
        try {
          if (!/\.(ts|tsx)$/.test(fullPath)) return;
          const src = readFileSync(fullPath, "utf8");
          const healed = healSource(src);
          if (!healed) return;
          writeFileSync(fullPath, healed.code);
          server.config.logger.warn(
            `[jsx-tail-guard] healed on disk: ${fullPath} (removed ${healed.removed} orphan line(s))`,
          );
          const mod = server.moduleGraph.getModuleById(fullPath);
          if (mod) server.moduleGraph.invalidateModule(mod);
        } catch {
          // best-effort
        }
      };

      // Initial scan of known-fragile files.
      const initialTargets = [
        join(srcDir, "features/superAdmin/pages/TenantsListPage.tsx"),
      ];
      for (const p of initialTargets) if (existsSync(p)) healOnDisk(p);

      // Watch the whole src tree; recursive is supported on Linux since Node 20.
      try {
        watch(srcDir, { recursive: true }, (_event, filename) => {
          if (!filename) return;
          const full = join(srcDir, filename.toString());
          healOnDisk(full);
        });
      } catch {
        // recursive watch unsupported; fall back silently — transform hook still guards.
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
