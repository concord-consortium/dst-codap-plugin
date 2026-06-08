import { makeAutoObservable } from "mobx";
import {
  kBackgroundLatMax, kBackgroundLatMin, kBackgroundLongMax, kBackgroundLongMin, kHomeMaxLatitude, kHomeMaxLongitude,
  kHomeMinLatitude, kHomeMinLongitude, kLatScale
} from "../utilities/constants";
import { formatDateString, datePercentInRange } from "../utilities/date-utils";
import { halfPi } from "../utilities/trig-utils";
import { codapData } from "./codap-data";
import { ui } from "./ui";

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
  // When a slice is locked, the two range triangles hold a fixed separation and
  // move together as a unit; the cube z-axis zooms out to the full dataset so the
  // slice reads as a band sliding through the whole timeframe. See lockSlice().
  sliceLocked = false;

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
      const step = dt / 1000 * dateAnimationRate;
      if (this.sliceLocked) {
        // Translate the whole slice upward until its top triangle reaches the top.
        this.translateSlice(step);
        if (this.maxDatePercent >= 1) {
          this.setAnimatingDate(false);
        }
      } else {
        this.setCurrentDatePercent(this.currentDatePercent + step);
        if (this.currentDatePercent >= this.maxDatePercent) {
          this.setAnimatingDate(false);
        }
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
    // First check if points are globally visible based on selection state
    const isSelected = codapData.isSelected(caseId);
    if (isSelected && !ui.showSelectedPoints) return false;
    if (!isSelected && !ui.showUnselectedPoints) return false;
    
    const latitude = codapData.getLatitude(caseId);
    const longitude = codapData.getLongitude(caseId);
    if (latitude == null || longitude == null) return false;

    const datePercent = this.convertCaseDateToPercent(caseId);
    if (datePercent === undefined) return false;
    
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
    return (percent - this.projMinDatePercent) / this.projDatePercentSpan * graphRange + graphMin;
  }

  // Basis the cube z-axis projects against. Unlocked: the slice fills the cube
  // (zoom to slice). Locked: the full dataset [0,1] fills the cube, so the slice
  // shows as a band that slides through the whole timeframe.
  get projMinDatePercent() {
    return this.sliceLocked ? 0 : this.minDatePercent;
  }

  get projDatePercentSpan() {
    return (this.sliceLocked ? 1 : this.maxDatePercent - this.minDatePercent) || 1;
  }

  // Dates labelling the cube z-axis, matching the projection basis above.
  get axisMinDate() {
    return this.convertPercentToDate(this.projMinDatePercent);
  }

  get axisMaxDate() {
    return this.convertPercentToDate(this.projMinDatePercent + this.projDatePercentSpan);
  }

  // A slice exists once either triangle is pulled off its extreme; this is when
  // the lock affordance appears and locking becomes possible.
  get sliceExists() {
    return this.minDatePercent > 0 || this.maxDatePercent < 1;
  }

  get sliceSeparation() {
    return this.maxDatePercent - this.minDatePercent;
  }

  // Midpoint of the slice (0..1) — the locked drag handle rides here.
  get sliceCenter() {
    return (this.minDatePercent + this.maxDatePercent) / 2;
  }

  get canAnimateDate() {
    return this.sliceLocked ? this.maxDatePercent < 1 : this.currentDatePercent < this.maxDatePercent;
  }

  get canPanDown() {
    return this.minLatitude > this.absoluteMinLatitude;
  }

  get canPanLeft() {
    return this.minLongitude > this.absoluteMinLongitude;
  }

  get canPanRight() {
    return this.maxLongitude < this.absoluteMaxLongitude;
  }

  get canPanUp() {
    return this.maxLatitude < this.absoluteMaxLatitude;
  }

  get canReset() {
    return this.maxLatitude !== this.homeMaxLatitude || this.minLatitude !== this.homeMinLatitude ||
      this.maxLongitude !== this.homeMaxLongitude || this.minLongitude !== this.homeMinLongitude;
  }

  get canZoomIn() {
    const longRange = this.targetLongRange ?? this.longRange;
    return longRange > minWidth;
  }

  get canZoomOut() {
    const longRange = this.targetLongRange ?? this.longRange;
    return longRange < this.maxWidth;
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
    if (!this.canPanDown) return;

    const __amount = amount ?? this.latRange / 4;
    const _amount = Math.min(Math.abs(__amount), this.minLatitude - this.absoluteMinLatitude);
    this.animateTo({ maxLatitude: this.maxLatitude - _amount, minLatitude: this.minLatitude - _amount });
  }

  panLeft(amount?: number) {
    if (!this.canPanLeft) return;

    const __amount = amount ?? this.longRange / 4;
    const _amount = Math.min(Math.abs(__amount), this.minLongitude - this.absoluteMinLongitude);
    this.animateTo({ maxLongitude: this.maxLongitude - _amount, minLongitude: this.minLongitude - _amount });
  }

  panRight(amount?: number) {
    if (!this.canPanRight) return;

    const __amount = amount ?? this.longRange / 4;
    const _amount = Math.min(Math.abs(__amount), this.absoluteMaxLongitude - this.maxLongitude);
    this.animateTo({ maxLongitude: this.maxLongitude + _amount, minLongitude: this.minLongitude + _amount });
  }

  panUp(amount?: number) {
    if (!this.canPanUp) return;

    const __amount = amount ?? this.latRange / 4;
    const _amount = Math.min(Math.abs(__amount), this.absoluteMaxLatitude - this.maxLatitude);
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

  // Center the view on the contiguous (lower-48) United States.
  // Bounds are slightly padded from CONUS extents (~24-50N, -125 to -66W)
  // and held to a ~2:1 longitude:latitude aspect ratio so the cube fills
  // without significant extra whitespace.
  viewContinentalUS() {
    this.animateTo({
      minLatitude: 22,
      maxLatitude: 52,
      minLongitude: -127,
      maxLongitude: -65
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
    this.sliceLocked = false;
  }

  setAnimatingDate(animating: boolean) {
    this.animatingDate = animating;
  }

  lockSlice() {
    if (!this.sliceExists) return;
    this.sliceLocked = true;
    // Reveal the whole slice — while locked the scrub dot is replaced by the
    // slice drag handle, so the full band between the triangles is shown.
    this.currentDatePercent = this.maxDatePercent;
    // Detach the map plane: drop it to the bottom of the axis, where it's then
    // free to roam the full timeframe independent of the slice.
    this.mapDatePercent = 0;
  }

  unlockSlice() {
    this.sliceLocked = false;
    this.animatingDate = false;
    // Re-clamp the map plane back inside the slice it's constrained to when
    // unlocked.
    this.setMapDatePercent(this.mapDatePercent);
  }

  toggleSliceLock() {
    if (this.sliceLocked) this.unlockSlice();
    else this.lockSlice();
  }

  // Slide a locked slice along the axis by delta (in 0..1 percent), preserving
  // the triangle separation and keeping both triangles within [0, 1].
  translateSlice(delta: number) {
    if (!this.sliceLocked) return;
    const clamped = Math.max(-this.minDatePercent, Math.min(1 - this.maxDatePercent, delta));
    this.minDatePercent += clamped;
    this.maxDatePercent += clamped;
    this.currentDatePercent = this.maxDatePercent;
  }

  setCurrentDatePercent(date: number) {
    this.currentDatePercent = datePercentInRange(date, this.minDatePercent, this.maxDatePercent);
  }

  setMapDatePercent(date: number) {
    // Unlocked, the map plane is confined to the slice; locked, it roams the
    // full axis independent of the slice.
    this.mapDatePercent = this.sliceLocked
      ? datePercentInRange(date)
      : datePercentInRange(date, this.minDatePercent, this.maxDatePercent);
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
    this.maxLatitude = Math.min(this.absoluteMaxLatitude, lat);
  }

  setMaxLongitude(long: number) {
    this.maxLongitude = Math.min(this.absoluteMaxLongitude, long);
  }

  setMinLatitude(lat: number) {
    this.minLatitude = Math.max(this.absoluteMinLatitude, lat);
  }

  setMinLongitude(long: number) {
    this.minLongitude = Math.max(this.absoluteMinLongitude, long);
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
    // Always make sure we zoom out zoomAmount * 2 so we maintain a square.
    // To do this, if we bump into the max or min, we increase the other side by the amount we'd go over.
    // If both sides go over, then we'll be capped at the max dimensions anyway.
    let maxLatitude = (this.targetMaxLat ?? this.maxLatitude) + zoomAmount * kLatScale;
    let minLatitude = (this.targetMinLat ?? this.minLatitude) - zoomAmount * kLatScale;
    if (maxLatitude > this.absoluteMaxLatitude) {
      minLatitude -= maxLatitude - this.absoluteMaxLatitude;
      maxLatitude = this.absoluteMaxLatitude;
    }
    if (minLatitude < this.absoluteMinLatitude) {
      maxLatitude += this.absoluteMinLatitude - minLatitude;
      minLatitude = this.absoluteMinLatitude;
    }
    let maxLongitude = (this.targetMaxLong ?? this.maxLongitude) + zoomAmount;
    let minLongitude = (this.targetMinLong ?? this.minLongitude) - zoomAmount;
    if (maxLongitude > this.absoluteMaxLongitude) {
      minLongitude -= maxLongitude - this.absoluteMaxLongitude;
      maxLongitude = this.absoluteMaxLongitude;
    }
    if (minLongitude < this.absoluteMinLongitude) {
      maxLongitude += this.absoluteMinLongitude - minLongitude;
      minLongitude = this.absoluteMinLongitude;
    }

    this.animateTo({ maxLatitude, minLatitude, maxLongitude, minLongitude });
  }

  /**
   * Updates the absolute boundaries of the map based on the dataset
   * @param minLat Minimum latitude boundary
   * @param maxLat Maximum latitude boundary
   * @param minLong Minimum longitude boundary
   * @param maxLong Maximum longitude boundary
   */
  updateAbsoluteBounds(minLat: number, maxLat: number, minLong: number, maxLong: number) {
    // Update absolute boundaries
    this.absoluteMinLatitude = minLat;
    this.absoluteMaxLatitude = maxLat;
    this.absoluteMinLongitude = minLong;
    this.absoluteMaxLongitude = maxLong;
    
    // Also update the home boundaries to match the new data boundaries
    this.homeMinLatitude = minLat;
    this.homeMaxLatitude = maxLat;
    this.homeMinLongitude = minLong;
    this.homeMaxLongitude = maxLong;
  }

  /**
   * Resets the view to the newly set data boundaries
   */
  resetToDataBounds() {
    // Animate to the home boundaries (which were set in updateAbsoluteBounds)
    this.animateTo({
      maxLatitude: this.homeMaxLatitude,
      minLatitude: this.homeMinLatitude,
      maxLongitude: this.homeMaxLongitude,
      minLongitude: this.homeMinLongitude
    });
  }
  
  /**
   * Resets the view to the home boundaries
   * Alias for reset() method for backward compatibility
   */
  resetToHomeView() {
    this.reset();
  }
}

export const graph = new Graph();
