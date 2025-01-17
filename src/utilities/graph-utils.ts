import { makeAutoObservable } from "mobx";
import { getDate, ICase } from "../models/codap-data";
import { kBackgroundLatMax, kBackgroundLatMin, kBackgroundLongMax, kBackgroundLongMin } from "./constants";

export const graphMin = -5;
export const graphMax = 5;
const graphRange = graphMax - graphMin;

const minWidth = 1;
const zoomAmount = 5;

class DataRanges {
  dateMin = 1578124800000;
  dateMax = 1672358400000;
  latMin = kBackgroundLatMin;
  latMax = kBackgroundLatMax;
  longMin = kBackgroundLongMin;
  longMax = kBackgroundLongMax;

  maxLatitude = kBackgroundLatMax;
  minLatitude = kBackgroundLatMin;
  maxLongitude = kBackgroundLongMax;
  minLongitude = kBackgroundLongMin;

  constructor() {
    makeAutoObservable(this);
  }

  convertLat(_lat?: number) {
    const lat = _lat ?? this.defaultLat;
    return ((lat - this.minLatitude) / this.latRange) * graphRange + graphMin;
  }
  
  convertLong(_long?: number) {
    const long = _long ?? this.defaultLong;
    return ((long - this.minLongitude) / this.longRange) * graphRange + graphMin;
  }
  
  convertDate(aCase: ICase) {
    const _date = getDate(aCase);
    const date = isFinite(_date) ? _date : this.defaultDate;
    return ((date - this.dateMin) / this.dateRange) * graphRange + graphMin;
  }

  get canZoomIn() {
    return this.latRange > minWidth;
  }

  get canZoomOut() {
    return this.latRange < this.maxWidth;
  }

  get dateRange() {
    return this.dateMax - this.dateMin;
  }

  get defaultDate() {
    return this.dateMin + this.dateRange / 2;
  }

  get defaultLat() {
    return this.minLatitude + this.latRange / 2;
  }

  get defaultLong() {
    return this.minLongitude + this.longRange / 2;
  }

  get latRange() {
    return this.maxLongitude - this.minLongitude;
  }

  get longRange() {
    return this.maxLatitude - this.minLatitude;
  }

  get maxWidth() {
    return this.longMax - this.longMin;
  }

  setDateRange(min: number, max: number) {
    this.dateMin = min;
    this.dateMax = max;
  }
  
  setMaxLatitude(lat: number) {
    this.maxLatitude = Math.min(this.latMax, lat);
  }

  setMaxLongitude(long: number) {
    this.maxLongitude = Math.min(this.longMax, long);
  }

  setMinLatitude(lat: number) {
    this.minLatitude = Math.max(this.latMin, lat);
  }

  setMinLongitude(long: number) {
    this.minLongitude = Math.max(this.longMin, long);
  }

  zoomIn() {
    const _zoomAmount = Math.min(zoomAmount, (this.latRange - minWidth) / 2);
    this.setMaxLatitude(this.maxLatitude - _zoomAmount);
    this.setMaxLongitude(this.maxLongitude - _zoomAmount);
    this.setMinLatitude(this.minLatitude + _zoomAmount);
    this.setMinLongitude(this.minLongitude + _zoomAmount);
  }

  zoomOut() {
    this.setMaxLatitude(this.maxLatitude + zoomAmount);
    this.setMaxLongitude(this.maxLongitude + zoomAmount);
    this.setMinLatitude(this.minLatitude - zoomAmount);
    this.setMinLongitude(this.minLongitude - zoomAmount);
  }
}

export const dataRanges = new DataRanges();

// Returns a point between the start and end points, offset distance from the start point.
export function projectPoint(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, offset: number) {
  const distance = Math.sqrt((x2 - x1)**2 + (y2 - y1)**2 + (z2 - z1)**2);
  const x = x1 + offset * ((x2 - x1) / distance);
  const y = y1 + offset * ((y2 - y1) / distance);
  const z = z1 + offset * ((z2 - z1) / distance);
  return { x, y, z };
}
