// Deterministic small-state PRNG so seed data is stable across reloads.
export function createRng(seed: number) {
  let state = seed >>> 0;
  return {
    next(): number {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
    },
    int(minInclusive: number, maxInclusive: number): number {
      return Math.floor(this.next() * (maxInclusive - minInclusive + 1)) + minInclusive;
    },
    pick<T>(items: readonly T[]): T {
      return items[this.int(0, items.length - 1)];
    },
    bool(probabilityTrue = 0.5): boolean {
      return this.next() < probabilityTrue;
    },
  };
}

export type Rng = ReturnType<typeof createRng>;
