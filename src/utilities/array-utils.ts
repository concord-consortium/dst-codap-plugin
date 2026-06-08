// Min and max of a numeric array in one pass.
//
// IMPORTANT: do NOT use Math.min(...values) / Math.max(...values) on large
// arrays. Spreading more than ~100K elements as call arguments throws
// "RangeError: Maximum call stack size exceeded" in V8 — which previously, when
// computing the dataset date range over every case, silently aborted data load
// (caught upstream) and left the whole plot blank at 100K+ rows. This loop has
// no argument-count limit.
export function minMax(values: ArrayLike<number>): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;
  // Indexed loop, not for-of: the param is ArrayLike (not guaranteed iterable),
  // and avoiding the spread is the whole point.
  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return { min, max };
}
