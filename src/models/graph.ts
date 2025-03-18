import { makeAutoObservable } from "mobx";
import {
  kBackgroundLatMax, kBackgroundLatMin, kBackgroundLongMax, kBackgroundLongMin, kHomeMaxLatitude, kHomeMaxLongitude,
  kHomeMinLatitude, kHomeMinLongitude, kLatScale
} from "../utilities/constants";
import { formatDateString, datePercentInRange } from "../utilities/date-utils";
import { halfPi } from "../utilities/trig-utils";
import { codapData } from "./codap-data";

export const graphMin = -5;
export const graphMax = 5;
const graphRange = graphMax - graphMin;

const minWidth = 5;
const zoomAmount = 2.5;

const animationDuration = 200;
const dateAnimationRate = 0.1;

export const kMinDatePercentRange = 0.01;

class Graph {
  maxDatePercent = 1;
  minDatePercent = 0;
  mapDatePercent = 0;
  currentDatePercent = 1;
  animatingDate = false;

  absoluteMinLatitude = kBackgroundLatMin; // The absolute min latitude
  absoluteMaxLatitude = kBackgroundLatMax; // The absolute max latitude
  absoluteMinLongitude = kBackgroundLongMin; // The absolute min longitude
  absoluteMaxLongitude = kBackgroundLongMax; // The absolute max longitude

  maxLatitude = kHomeMaxLatitude; // The current max latitude of the graph
  minLatitude = kHomeMinLatitude; // The current min latitude of the graph
  maxLongitude = kHomeMaxLongitude; // The current max longitude of the graph
  minLongitude = kHomeMinLongitude; // The current min longitude of the graph

  homeMaxLatitude = kHomeMaxLatitude;
  homeMinLatitude = kHomeMinLatitude;
  homeMaxLongitude = kHomeMaxLongitude;
  homeMinLongitude = kHomeMinLongitude;

  animationPercentage: Maybe<number>;
  startMaxLat: Maybe<number>;
  startMinLat: Maybe<number>;
  startMaxLong: Maybe<number>;
  startMinLong: Maybe<number>;

  targetMaxLat: Maybe<number>;
  targetMinLat: Maybe<number>;
  targetMaxLong: Maybe<number>;
  targetMinLong: Maybe<number>;

  // Replace the literal getter methods with readonly fields
  readonly canPanDown = true;
  readonly canPanLeft = true;
  readonly canPanRight = true;
  readonly canPanUp = true;
  readonly canZoomOut = true;

  constructor() {
    makeAutoObservable(this);
  }
  
  // Animate the graph towards its target values.
  // This is called every frame by the component.
  animate(dt: number) {
    if (this.animationPercentage != null) {
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

    if (this.animatingDate) {
      this.setCurrentDatePercent(this.currentDatePercent + dt / 1000 * dateAnimationRate);
      if (this.currentDatePercent >= this.maxDatePercent) {
        this.setAnimatingDate(false);
      }
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

  caseIsVisible(caseId: string) {
    const latitude = codapData.getLatitude(caseId);
    const longitude = codapData.getLongitude(caseId);
    if (latitude == null || longitude == null) return false;

    const datePercent = this.convertCaseDateToPercent(caseId);
    if (datePercent === undefined) return false;
    
    // Simple visibility check based on coordinates and date percent
    return latitude >= this.minLatitude && latitude <= this.maxLatitude &&
      longitude >= this.minLongitude && longitude <= this.maxLongitude &&
      datePercent >= this.minDatePercent && datePercent <= this.currentDatePercent;
  }
  
  convertCaseDate(caseId: string): number {
    const date = codapData.getCaseDate(caseId);
    return date !== undefined && isFinite(date) ? date : this.defaultDate;
  }
  
  convertCaseDateToGraph(caseId: string): number {
    return this.convertDateToGraph(this.convertCaseDate(caseId));
  }

  convertCaseDateToPercent(caseId: string): number {
    return this.convertDateToPercent(this.convertCaseDate(caseId));
  }

  convertDateToGraph(date: number): number {
    return this.convertPercentToGraph(this.convertDateToPercent(date));
  }

  convertDateToPercent(date: number): number {
    return (date - codapData.absoluteMinDate) / codapData.absoluteDateRange;
  }

  convertLat(_lat?: number) {
    const lat = _lat ?? this.defaultLat;
    return ((lat - this.minLatitude) / this.latRange) * graphRange + graphMin;
  }
  
  convertLong(_long?: number) {
    const long = _long ?? this.defaultLong;
    return ((long - this.minLongitude) / this.longRange) * graphRange + graphMin;
  }

  convertPercentToDate(percent: number) {
    return codapData.absoluteMinDate + percent * codapData.absoluteDateRange;
  }

  convertPercentToGraph(percent: number) {
    return (percent - this.minDatePercent) / (this.maxDatePercent - this.minDatePercent) * graphRange + graphMin;
  }

  get canAnimateDate() {
    return this.currentDatePercent < this.maxDatePercent;
  }

  get canReset() {
    return this.maxLatitude !== this.homeMaxLatitude || this.minLatitude !== this.homeMinLatitude ||
      this.maxLongitude !== this.homeMaxLongitude || this.minLongitude !== this.homeMinLongitude;
  }

  get canZoomIn() {
    const longRange = this.targetLongRange ?? this.longRange;
    return longRange > minWidth;
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
    return this.maxDate - this.minDate;
  }

  get defaultDate() {
    return this.minDate + this.dateRange / 2;
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

  get mapPosition() {
    return this.convertPercentToGraph(this.mapDatePercent);
  }

  get maxDate() {
    return this.convertPercentToDate(this.maxDatePercent);
  }

  get maxWidth() {
    return this.absoluteMaxLongitude - this.absoluteMinLongitude;
  }

  get minDate() {
    return this.convertPercentToDate(this.minDatePercent);
  }

  get targetLongRange() {
    if (this.targetMaxLong != null && this.targetMinLong != null) return this.targetMaxLong - this.targetMinLong;
  }

  getDateStringFromPercent(percent: number) {
    return formatDateString(new Date(this.convertPercentToDate(percent)));
  }

  latitudeInGraphSpace(_lat?: number) {
    return this.convertLat(_lat) - this.centerX;
  }

  longitudeInGraphSpace(_long?: number) {
    return this.convertLong(_long) - this.centerZ;
  }

  panDown(amount?: number) {
    // Remove the restriction on panning down
    const __amount = amount ?? this.latRange / 4;
    // Allow panning beyond the absolute boundaries
    this.animateTo({ maxLatitude: this.maxLatitude - __amount, minLatitude: this.minLatitude - __amount });
  }

  panLeft(amount?: number) {
    // Remove the restriction on panning left 
    const __amount = amount ?? this.longRange / 4;
    // Allow panning beyond the absolute boundaries
    this.animateTo({ maxLongitude: this.maxLongitude - __amount, minLongitude: this.minLongitude - __amount });
  }

  panRight(amount?: number) {
    // Remove the restriction on panning right
    const __amount = amount ?? this.longRange / 4;
    // Allow panning beyond the absolute boundaries
    this.animateTo({ maxLongitude: this.maxLongitude + __amount, minLongitude: this.minLongitude + __amount });
  }

  panUp(amount?: number) {
    // Remove the restriction on panning up
    const __amount = amount ?? this.latRange / 4;
    // Allow panning beyond the absolute boundaries
    this.animateTo({ maxLatitude: this.maxLatitude + __amount, minLatitude: this.minLatitude + __amount });
  }

  reset() {
    this.animateTo({
      maxLatitude: this.homeMaxLatitude,
      minLatitude: this.homeMinLatitude,
      maxLongitude: this.homeMaxLongitude,
      minLongitude: this.homeMinLongitude
    });
  }

  restrictDates() {
    this.setCurrentDatePercent(this.currentDatePercent);
    this.setMapDatePercent(this.mapDatePercent);
  }

  /**
   * Reset the date visualization to show all data in the newly loaded dataset
   * This method should be called after a new dataset is loaded and date range is set
   */
  resetDateVisualization() {
    // Reset all date percentages to default values
    this.minDatePercent = 0;
    this.maxDatePercent = 1;
    this.mapDatePercent = 0;
    this.currentDatePercent = 1;
    this.animatingDate = false;
  }

  setAnimatingDate(animating: boolean) {
    this.animatingDate = animating;
  }

  setCurrentDatePercent(date: number) {
    this.currentDatePercent = datePercentInRange(date, this.minDatePercent, this.maxDatePercent);
  }

  setMapDatePercent(date: number) {
    this.mapDatePercent = datePercentInRange(date, this.minDatePercent, this.maxDatePercent);
  }

  setMaxDatePercent(date: number) {
    this.maxDatePercent = datePercentInRange(date);
    this.restrictDates();
  }

  setMinDatePercent(date: number) {
    this.minDatePercent = datePercentInRange(date);
    this.restrictDates();
  }
  
  setMaxLatitude(lat: number) {
    // Remove the restriction on maximum latitude
    this.maxLatitude = lat;
  }

  setMaxLongitude(long: number) {
    // Remove the restriction on maximum longitude
    this.maxLongitude = long;
  }

  setMinLatitude(lat: number) {
    // Remove the restriction on minimum latitude
    this.minLatitude = lat;
  }

  setMinLongitude(long: number) {
    // Remove the restriction on minimum longitude
    this.minLongitude = long;
  }

  zoomIn() {
    const _zoomAmount = Math.min(zoomAmount, (this.longRange - minWidth) / 2);
    const maxLatitude = (this.targetMaxLat ?? this.maxLatitude) - _zoomAmount * kLatScale;
    const minLatitude = (this.targetMinLat ?? this.minLatitude) + _zoomAmount * kLatScale;
    const maxLongitude = (this.targetMaxLong ?? this.maxLongitude) - _zoomAmount;
    const minLongitude = (this.targetMinLong ?? this.minLongitude) + _zoomAmount;
    this.animateTo({ maxLatitude, minLatitude, maxLongitude, minLongitude });
  }

  zoomOut() {
    // Allow zooming out beyond the absolute boundaries
    const maxLatitude = (this.targetMaxLat ?? this.maxLatitude) + zoomAmount * kLatScale;
    const minLatitude = (this.targetMinLat ?? this.minLatitude) - zoomAmount * kLatScale;
    const maxLongitude = (this.targetMaxLong ?? this.maxLongitude) + zoomAmount;
    const minLongitude = (this.targetMinLong ?? this.minLongitude) - zoomAmount;

    this.animateTo({ maxLatitude, minLatitude, maxLongitude, minLongitude });
  }

  /**
   * Update the absolute boundaries of the map based on dataset
   * @param minLat Minimum latitude
   * @param maxLat Maximum latitude
   * @param minLong Minimum longitude
   * @param maxLong Maximum longitude
   */
  updateAbsoluteBounds(minLat: number, maxLat: number, minLong: number, maxLong: number) {
    // Update absolute bounds
    this.absoluteMinLatitude = minLat;
    this.absoluteMaxLatitude = maxLat;
    this.absoluteMinLongitude = minLong;
    this.absoluteMaxLongitude = maxLong;
    
    // Update home positions to match the new absolute bounds with a slight inset
    const latRange = maxLat - minLat;
    const longRange = maxLong - minLong;
    
    this.homeMinLatitude = minLat + latRange * 0.05;
    this.homeMaxLatitude = maxLat - latRange * 0.05;
    this.homeMinLongitude = minLong + longRange * 0.05;
    this.homeMaxLongitude = maxLong - longRange * 0.05;
    
    // Immediately update the current view boundaries
    this.minLatitude = this.homeMinLatitude;
    this.maxLatitude = this.homeMaxLatitude;
    this.minLongitude = this.homeMinLongitude;
    this.maxLongitude = this.homeMaxLongitude;
    
    // Cancel any ongoing animation
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
  
  /**
   * Reset the view to the data boundaries
   */
  resetToDataBounds() {
    // Reset the view to the home positions
    this.animateTo({
      maxLatitude: this.homeMaxLatitude,
      minLatitude: this.homeMinLatitude,
      maxLongitude: this.homeMaxLongitude,
      minLongitude: this.homeMinLongitude
    });
  }

  /**
   * Reset the view to the home position
   */
  resetToHomeView() {
    // Reset the view to the home positions
    this.animateTo({
      maxLatitude: this.homeMaxLatitude,
      minLatitude: this.homeMinLatitude,
      maxLongitude: this.homeMaxLongitude,
      minLongitude: this.homeMinLongitude
    });
  }
}

export const graph = new Graph();
