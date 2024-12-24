import { getDate, IItem } from "../models/item";

export const dataRanges = {
  dateMin: 1578124800000,
  dateMax: 1672358400000,
  latMin: 18.4589,
  latMax: 48.98,
  longMin: -124.0062,
  longMax: -66.746
};
const dateRange = () => dataRanges.dateMax - dataRanges.dateMin;
const defaultDate = () =>  dataRanges.dateMin + dateRange() / 2;
const latRange = () => dataRanges.latMax - dataRanges.latMin;
const defaultLat = () => dataRanges.latMin + latRange() / 2;
const longRange = () => dataRanges.longMax - dataRanges.longMin;
const defaultLong = () => dataRanges.longMin + longRange() / 2;

const graphMin = -5;
const graphMax = 5;
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
