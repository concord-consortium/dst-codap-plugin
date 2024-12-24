import { getDate, IItem } from "../models/item";

export const kDateMin = 1578124800000;
export const kDateMax = 1672358400000;
const dateRange = kDateMax - kDateMin;
const defaultDate = kDateMin + dateRange / 2;
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

export function convertDate(item: IItem) {
  const _date = getDate(item);
  const date = isFinite(_date) ? _date : defaultDate;
  return ((date - kDateMin) / dateRange) * graphRange + graphMin;
}
