// Auto-heal orphan JSX tail tokens (bare `)`, `}`, `);`, `)}` appended to a
// file's end) that occasionally slip in via upstream tooling. Babel refuses
// to parse those files, which becomes "Failed to fetch dynamically imported
// module" in the browser. This plugin trims trailing close-only lines when —
// and only when — doing so restores paren/brace balance.

/** @returns {import('vite').Plugin} */
export function jsxTailGuard() {
  function balanced(src) {
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

      const lines = code.split("\n");
      const isJunkTail = (l) => /^[\s)}\];,]*$/.test(l);
      let removed = 0;
      while (lines.length > 0 && removed < 20) {
        const last = lines[lines.length - 1];
        if (!isJunkTail(last)) break;
        lines.pop();
        removed++;
        const candidate = lines.join("\n") + "\n";
        if (balanced(candidate)) {
          this.warn(
            `[jsx-tail-guard] Stripped ${removed} orphan tail line(s) from ${id} to restore parse.`,
          );
          return { code: candidate, map: null };
        }
      }
      return null;
    },
  };
}
