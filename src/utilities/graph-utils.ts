import { getDate, IItem } from "../models/item";
import { kBackgroundLatMax, kBackgroundLatMin, kBackgroundLongMax, kBackgroundLongMin } from "./constants";

export const dataRanges = {
  dateMin: 1578124800000,
  dateMax: 1672358400000,
  latMin: kBackgroundLatMin,
  latMax: kBackgroundLatMax,
  longMin: kBackgroundLongMin,
  longMax: kBackgroundLongMax
};
const dateRange = () => dataRanges.dateMax - dataRanges.dateMin;
const defaultDate = () =>  dataRanges.dateMin + dateRange() / 2;
const latRange = () => dataRanges.latMax - dataRanges.latMin;
const defaultLat = () => dataRanges.latMin + latRange() / 2;
const longRange = () => dataRanges.longMax - dataRanges.longMin;
const defaultLong = () => dataRanges.longMin + longRange() / 2;

export const graphMin = -5;
export const graphMax = 5;
const graphRange = graphMax - graphMin;

export function convertLat(_lat?: number) {
  const lat = _lat ?? defaultLat();
  return ((lat - dataRanges.latMin) / latRange()) * graphRange + graphMin;
}

export function convertLong(_long?: number) {
  const long = _long ?? defaultLong();
  return ((long - dataRanges.longMin) / longRange()) * graphRange + graphMin;
}

export function convertDate(item: IItem) {
  const _date = getDate(item);
  const date = isFinite(_date) ? _date : defaultDate();
  return ((date - dataRanges.dateMin) / dateRange()) * graphRange + graphMin;
}

// Returns a point between the start and end points, offset distance from the start point.
export function projectPoint(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, offset: number) {
  const distance = Math.sqrt((x2 - x1)**2 + (y2 - y1)**2 + (z2 - z1)**2);
  const x = x1 + offset * ((x2 - x1) / distance);
  const y = y1 + offset * ((y2 - y1) / distance);
  const z = z1 + offset * ((z2 - z1) / distance);
  return { x, y, z };
}
