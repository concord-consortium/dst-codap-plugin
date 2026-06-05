import { bisectRight, extent, min as d3min, quantileSorted, range as d3range } from "d3";

// Three ways to bin a numeric legend attribute into `count` bins.
export type BinningMode = "quantile" | "linear" | "logarithmic";

export const kBinningModes: BinningMode[] = ["quantile", "linear", "logarithmic"];
export const kDefaultBinCount = 5;
// If any bin would hold more than this share of the points, the auto-default
// moves on to the next, more-even binning mode.
export const kEvennessLimit = 0.40;

/**
 * Internal bin-boundary thresholds (count - 1 of them) for a set of values under
 * a given mode. Bin i is [thresholds[i-1], thresholds[i]).
 */
export function computeThresholds(values: number[], mode: BinningMode, count: number): number[] {
  if (values.length === 0 || count < 2) return [];
  const [lo, hi] = extent(values);
  if (lo == null || hi == null || lo === hi) return [];

  if (mode === "linear") {
    return d3range(1, count).map(i => lo + (hi - lo) * (i / count));
  }

  if (mode === "logarithmic") {
    // Log-spaced over the positive range; non-positive values fall into bin 0.
    const positive = values.filter(v => v > 0);
    const pmin = positive.length ? (d3min(positive) as number) : (hi > 0 ? hi / 1e6 : 1);
    const top = hi > 0 ? hi : pmin * 10;
    const a = Math.log(pmin);
    const b = Math.log(top);
    if (!isFinite(a) || !isFinite(b) || a === b) {
      // Degenerate (e.g. all non-positive); fall back to linear spacing.
      return d3range(1, count).map(i => lo + (hi - lo) * (i / count));
    }
    return d3range(1, count).map(i => Math.exp(a + (b - a) * (i / count)));
  }

  // quantile
  const sorted = [...values].sort((x, y) => x - y);
  return d3range(1, count).map(i => quantileSorted(sorted, i / count) as number);
}

/** Bin index for a value given its bin thresholds. */
export function binIndex(thresholds: number[], value: number): number {
  return bisectRight(thresholds, value);
}

/** The largest share of values that lands in any single bin (0..1). */
export function maxBinFraction(values: number[], thresholds: number[]): number {
  if (values.length === 0) return 1;
  const counts = new Array(thresholds.length + 1).fill(0);
  for (const v of values) counts[binIndex(thresholds, v)]++;
  let mx = 0;
  for (const c of counts) if (c > mx) mx = c;
  return mx / values.length;
}

/**
 * Pick the default binning mode: prefer quantile, then linear, then logarithmic,
 * choosing the first whose fullest bin is within kEvennessLimit. If none qualifies,
 * choose whichever distributes the points most evenly.
 */
export function autoBinningMode(values: number[], count: number, limit = kEvennessLimit): BinningMode {
  if (values.length === 0) return "quantile";
  const fracs = kBinningModes.map(m => maxBinFraction(values, computeThresholds(values, m, count)));
  for (let i = 0; i < kBinningModes.length; i++) {
    if (fracs[i] <= limit) return kBinningModes[i];
  }
  let best = 0;
  for (let i = 1; i < kBinningModes.length; i++) if (fracs[i] < fracs[best]) best = i;
  return kBinningModes[best];
}

/**
 * A minimal d3-quantize-compatible "binning scale": callable value -> range[bin],
 * with .thresholds()/.range()/.domain() so it works with both our size legend and
 * the vendored choropleth color legend (which calls getScaleThresholds + domain/range).
 */
export interface BinScale<T> {
  (value: number): T;
  thresholds(): number[];
  range(): T[];
  domain(): number[];
}

export function makeBinScale<T>(thresholds: number[], range: T[], domain: number[]): BinScale<T> {
  const scale = ((value: number) =>
    range[Math.min(bisectRight(thresholds, value), range.length - 1)]) as BinScale<T>;
  scale.thresholds = () => thresholds;
  scale.range = () => range;
  scale.domain = () => domain;
  return scale;
}
