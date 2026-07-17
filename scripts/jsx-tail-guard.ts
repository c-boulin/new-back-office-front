import type { Plugin } from "vite";

/**
 * Some upstream tooling occasionally re-appends orphan JSX tail tokens
 * (bare `)`, `}`, `);`, `)}` on their own lines) to source files. Babel
 * refuses to parse those files and Vite serves the module as a 500, which
 * surfaces to the browser as "Failed to fetch dynamically imported module".
 *
 * This plugin strips a run of such lines from the END of a file if — and
 * only if — doing so restores paren/brace balance. If the file was already
 * balanced (the normal case), it is returned untouched.
 *
 * Runs before @vitejs/plugin-react so the stripped source is what Babel sees.
 */
export function jsxTailGuard(): Plugin {
  function balanced(src: string): boolean {
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
    return p === 0 && b === 0 && s === 0;
  }

  return {
    name: "jsx-tail-guard",
    enforce: "pre",
    transform(code, id) {
      if (!/\.(ts|tsx)$/.test(id)) return null;
      if (id.includes("/node_modules/")) return null;
      if (balanced(code)) return null;

      // Try trimming trailing lines made of only close-delimiters until
      // balance is restored. Cap the number of attempts.
      const lines = code.split("\n");
      const isJunkTail = (l: string) => /^[\s)}\];,]*$/.test(l);
      let removed = 0;
      while (lines.length > 0 && removed < 20) {
        const last = lines[lines.length - 1];
        if (!isJunkTail(last)) break;
        lines.pop();
        removed++;
        const candidate = lines.join("\n") + "\n";
        if (balanced(candidate)) {
          this.warn(
            `[jsx-tail-guard] Stripped ${removed} orphan tail line(s) from ${id.replace(process.cwd(), "")} to restore parse.`,
          );
          return { code: candidate, map: null };
        }
      }
      // Could not auto-fix — let the normal parser produce a real error.
      return null;
    },
  };
}
