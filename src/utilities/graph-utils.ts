export const kLatMin = 18.4589;
export const kLatMax = 48.98;
const latRange = kLatMax - kLatMin;
export const kLongMin = -124.0062;
export const kLongMax = -66.746;
const longRange = kLongMax - kLongMin;

const graphMin = -5;
const graphMax = 5;
const graphRange = graphMax - graphMin;

export function convertLat(lat = 35) {
  return ((lat - kLatMin) / latRange) * graphRange + graphMin;
}

export function convertLong(long = -95) {
  return ((long - kLongMin) / longRange) * graphRange + graphMin;
}

export function convertDate(date?: string) {
  return 0;
}
