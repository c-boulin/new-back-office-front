import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

export type ParamDef<T> = {
  default: T;
  parse: (raw: string | null) => T;
  serialize: (value: T) => string | null;
};

export function urlEnum<T extends string>(
  allowed: readonly T[],
  fallback: T,
): ParamDef<T> {
  return {
    default: fallback,
    parse: (raw) =>
      raw && (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback,
    serialize: (value) => (value === fallback ? null : value),
  };
}

export function urlString(fallback = ""): ParamDef<string> {
  return {
    default: fallback,
    parse: (raw) => raw ?? fallback,
    serialize: (value) => (value === fallback || value === "" ? null : value),
  };
}

export function urlInt(fallback: number, min = 0): ParamDef<number> {
  return {
    default: fallback,
    parse: (raw) => {
      if (raw === null) return fallback;
      const n = Number(raw);
      return Number.isFinite(n) && n >= min ? Math.floor(n) : fallback;
    },
    serialize: (value) => (value === fallback ? null : String(value)),
  };
}

export function urlBool(fallback = false): ParamDef<boolean> {
  return {
    default: fallback,
    parse: (raw) => (raw === null ? fallback : raw === "true"),
    serialize: (value) => (value === fallback ? null : value ? "true" : "false"),
  };
}

type StateOf<S extends Record<string, ParamDef<unknown>>> = {
  [K in keyof S]: S[K] extends ParamDef<infer T> ? T : never;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useUrlState<S extends Record<string, ParamDef<any>>>(spec: S) {
  const [params, setParams] = useSearchParams();

  const state = {} as StateOf<S>;
  for (const key of Object.keys(spec) as (keyof S)[]) {
    (state as Record<keyof S, unknown>)[key] = spec[key].parse(params.get(key as string));
  }

  const update = useCallback(
    (
      patch:
        | Partial<StateOf<S>>
        | ((prev: StateOf<S>) => Partial<StateOf<S>>),
    ) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const currentState = {} as StateOf<S>;
          for (const key of Object.keys(spec) as (keyof S)[]) {
            (currentState as Record<keyof S, unknown>)[key] = spec[key].parse(
              prev.get(key as string),
            );
          }
          const resolved =
            typeof patch === "function" ? patch(currentState) : patch;
          for (const [key, value] of Object.entries(resolved)) {
            const s = spec[key].serialize(value as never);
            if (s === null) next.delete(key);
            else next.set(key, s);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setParams, spec],
  );

  return [state, update] as const;
}
