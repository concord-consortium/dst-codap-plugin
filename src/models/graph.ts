import { makeAutoObservable } from "mobx";
import {
  kBackgroundLatMax, kBackgroundLatMin, kBackgroundLongMax, kBackgroundLongMin, kLatScale
} from "../utilities/constants";
import { halfPi } from "../utilities/trig-utils";
import { getDate, ICase } from "./codap-data";

export const graphMin = -5;
export const graphMax = 5;
const graphRange = graphMax - graphMin;

const minWidth = 5;
const zoomAmount = 2.5;

const animationDuration = 200;

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

  homeMaxLatitude = kBackgroundLatMax;
  homeMinLatitude = kBackgroundLatMin;
  homeMaxLongitude = kBackgroundLongMax;
  homeMinLongitude = kBackgroundLongMin;

  animationPercentage: Maybe<number>;
  startMaxLat: Maybe<number>;
  startMinLat: Maybe<number>;
  startMaxLong: Maybe<number>;
  startMinLong: Maybe<number>;

  targetMaxLat: Maybe<number>;
  targetMinLat: Maybe<number>;
  targetMaxLong: Maybe<number>;
  targetMinLong: Maybe<number>;

  constructor() {
    makeAutoObservable(this);
  }
  
  // Animate the graph towards its target values.
  // This is called every frame by the component.
  animate(dt: number) {
    if (this.animationPercentage == null) return;

    this.animationPercentage = Math.min(this.animationPercentage + dt / animationDuration, 1);
    const smoothPercentage = Math.sin((this.animationPercentage * 2 - 1) * halfPi) / 2 + .5;
    if (this.targetMaxLat != null && this.startMaxLat != null) {
      this.setMaxLatitude(this.startMaxLat + (this.targetMaxLat - this.startMaxLat) * smoothPercentage);
    }
    if (this.targetMinLat != null && this.startMinLat != null) {
      this.setMinLatitude(this.startMinLat + (this.targetMinLat - this.startMinLat) * smoothPercentage);
    }
    if (this.targetMaxLong != null && this.startMaxLong != null) {
      this.setMaxLongitude(this.startMaxLong + (this.targetMaxLong - this.startMaxLong) * smoothPercentage);
    }
    if (this.targetMinLong != null && this.startMinLong != null) {
      this.setMinLongitude(this.startMinLong + (this.targetMinLong - this.startMinLong) * smoothPercentage);
    }

    // End the animation if we're done.
    if (this.animationPercentage >= 1) {
      this.animationPercentage = undefined;
      this.startMaxLat = undefined;
      this.startMinLat = undefined;
      this.startMaxLong = undefined;
      this.startMinLong = undefined;
      this.targetMaxLat = undefined;
      this.targetMinLat = undefined;
      this.targetMaxLong = undefined;
      this.targetMinLong = undefined;
    }
  }

  // Sets up an animation to move the camera to the given values.
  animateTo({ maxLatitude, minLatitude, maxLongitude, minLongitude }:
    { maxLatitude?: number, minLatitude?: number, maxLongitude?: number, minLongitude?: number }
  ) {
    if (maxLatitude == null && minLatitude == null && maxLongitude == null && minLongitude == null) return;

    this.animationPercentage = 0;
    this.startMaxLat = this.maxLatitude;
    this.startMinLat = this.minLatitude;
    this.startMaxLong = this.maxLongitude;
    this.startMinLong = this.minLongitude;

    this.targetMaxLat = maxLatitude ?? this.targetMaxLat ?? this.maxLatitude;
    this.targetMinLat = minLatitude ?? this.targetMinLat ?? this.minLatitude;
    this.targetMaxLong = maxLongitude ?? this.targetMaxLong ?? this.maxLongitude;
    this.targetMinLong = minLongitude ?? this.targetMinLong ?? this.minLongitude;
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

  get canPanDown() {
    return this.minLatitude > this.latMin;
  }

  get canPanLeft() {
    return this.minLongitude > this.longMin;
  }

  get canPanRight() {
    return this.maxLongitude < this.longMax;
  }

  get canPanUp() {
    return this.maxLatitude < this.latMax;
  }

  get canReset() {
    return this.maxLatitude !== this.homeMaxLatitude || this.minLatitude !== this.homeMinLatitude ||
      this.maxLongitude !== this.homeMaxLongitude || this.minLongitude !== this.homeMinLongitude;
  }

  get canZoomIn() {
    return this.longRange > minWidth;
  }

  get canZoomOut() {
    return this.longRange < this.maxWidth;
  }

  get centerLat() {
    return (this.minLatitude + this.maxLatitude) / 2;
  }

  get centerLong() {
    return (this.minLongitude + this.maxLongitude) / 2;
  }

  get centerX() {
    return this.convertLat(this.centerLat);
  }

  get centerZ() {
    return this.convertLong(this.centerLong);
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
    return this.maxLatitude - this.minLatitude;
  }

  get longRange() {
    return this.maxLongitude - this.minLongitude;
  }

  get maxWidth() {
    return this.longMax - this.longMin;
  }

  latitudeInGraphSpace(_lat?: number) {
    return this.convertLat(_lat) - this.centerX;
  }

  longitudeInGraphSpace(_long?: number) {
    return this.convertLong(_long) - this.centerZ;
  }

  panDown(amount?: number) {
    if (!this.canPanDown) return;

    const __amount = amount ?? this.latRange / 4;
    const _amount = Math.min(Math.abs(__amount), this.minLatitude - this.latMin);
    this.animateTo({ maxLatitude: this.maxLatitude - _amount, minLatitude: this.minLatitude - _amount });
  }

  panLeft(amount?: number) {
    if (!this.canPanLeft) return;

    const __amount = amount ?? this.longRange / 4;
    const _amount = Math.min(Math.abs(__amount), this.minLongitude - this.longMin);
    this.animateTo({ maxLongitude: this.maxLongitude - _amount, minLongitude: this.minLongitude - _amount });
  }

  panRight(amount?: number) {
    if (!this.canPanRight) return;

    const __amount = amount ?? this.longRange / 4;
    const _amount = Math.min(Math.abs(__amount), this.longMax - this.maxLongitude);
    this.animateTo({ maxLongitude: this.maxLongitude + _amount, minLongitude: this.minLongitude + _amount });
  }

  panUp(amount?: number) {
    if (!this.canPanUp) return;

    const __amount = amount ?? this.latRange / 4;
    const _amount = Math.min(Math.abs(__amount), this.latMax - this.maxLatitude);
    this.animateTo({ maxLatitude: this.maxLatitude + _amount, minLatitude: this.minLatitude + _amount });
  }

  reset() {
    this.animateTo({
      maxLatitude: this.homeMaxLatitude,
      minLatitude: this.homeMinLatitude,
      maxLongitude: this.homeMaxLongitude,
      minLongitude: this.homeMinLongitude
    });
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
    const _zoomAmount = Math.min(zoomAmount, (this.longRange - minWidth) / 2);
    const maxLatitude = this.maxLatitude - _zoomAmount * kLatScale;
    const minLatitude = this.minLatitude + _zoomAmount * kLatScale;
    const maxLongitude = this.maxLongitude - _zoomAmount;
    const minLongitude = this.minLongitude + _zoomAmount;
    this.animateTo({ maxLatitude, minLatitude, maxLongitude, minLongitude });
  }

  zoomOut() {
    // Always make sure we zoom out zoomAmount * 2 so we maintain a square.
    // To do this, if we bump into the max or min, we increase the other side by the amount we'd go over.
    // If both sides go over, then we'll be capped at the max dimensions anyway.
    let maxLatitude = (this.targetMaxLat ?? this.maxLatitude) + zoomAmount * kLatScale;
    let minLatitude = (this.targetMinLat ?? this.minLatitude) - zoomAmount * kLatScale;
    if (maxLatitude > this.latMax) {
      minLatitude -= maxLatitude - this.latMax;
      maxLatitude = this.latMax;
    }
    if (minLatitude < this.latMin) {
      maxLatitude += this.latMin - minLatitude;
      minLatitude = this.latMin;
    }
    let maxLongitude = (this.targetMaxLong ?? this.maxLongitude) + zoomAmount;
    let minLongitude = (this.targetMinLong ?? this.minLongitude) - zoomAmount;
    if (maxLongitude > this.longMax) {
      minLongitude -= maxLongitude - this.longMax;
      maxLongitude = this.longMax;
    }
    if (minLongitude < this.longMin) {
      maxLongitude += this.longMin - minLongitude;
      minLongitude = this.longMin;
    }

    this.animateTo({ maxLatitude, minLatitude, maxLongitude, minLongitude });
  }
}

export const graph = new Graph();
