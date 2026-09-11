export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type LatencyRange = { min?: number; max?: number };

export async function withLatency<T>(
  work: () => T | Promise<T>,
  range: LatencyRange = {},
): Promise<T> {
  const min = range.min ?? 120;
  const max = range.max ?? 320;
  const jitter = Math.floor(Math.random() * (max - min + 1)) + min;
  await delay(jitter);
  return work();
}
