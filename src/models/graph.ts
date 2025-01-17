import { makeAutoObservable } from "mobx";
import { kBackgroundLatMax, kBackgroundLatMin, kBackgroundLongMax, kBackgroundLongMin } from "../utilities/constants";
import { getDate, ICase } from "./codap-data";

export const graphMin = -5;
export const graphMax = 5;
const graphRange = graphMax - graphMin;

const minWidth = 1;
const zoomAmount = 5;

class Graph {
  dateMin = 1578124800000;
  dateMax = 1672358400000;
  latMin = kBackgroundLatMin; // The absolute min latitude
  latMax = kBackgroundLatMax; // The absolute max latitude
  longMin = kBackgroundLongMin; // The absolute min longitude
  longMax = kBackgroundLongMax; // The absolute max longitude

  maxLatitude = kBackgroundLatMax; // The current max latitude of the graph
  minLatitude = kBackgroundLatMin; // The current min latitude of the graph
  maxLongitude = kBackgroundLongMax; // The current max longitude of the graph
  minLongitude = kBackgroundLongMin; // The current min longitude of the graph

  constructor() {
    makeAutoObservable(this);
  }

  caseIsVisible(aCase: ICase) {
    if (aCase.Latitude == null || aCase.Longitude == null) return false;

    return aCase.Latitude >= this.minLatitude && aCase.Latitude <= this.maxLatitude &&
      aCase.Longitude >= this.minLongitude && aCase.Longitude <= this.maxLongitude;
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

export const graph = new Graph();
