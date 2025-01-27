import { makeAutoObservable } from "mobx";
import { Euler } from "three";
import { getCameraFormatFromPosition, getPositionFromCameraFormat } from "../utilities/camera-utils";
import { halfPi, normalizeRadian2Pi, normalizeRadianMinusPi, quarterPi, twoPi } from "../utilities/trig-utils";

// const defaultCameraX = -10;
// const defaultCameraY = 14;
// const defaultCameraZ = 0;
// const { distance: defaultDistance, pivot: defaultPivot, rotation: defaultRotation} =
//   getCameraFormatFromPosition(defaultCameraX, defaultCameraY, defaultCameraZ);
export const defaultDistance = 40;
export const defaultRotation = quarterPi;
export const defaultPivot = quarterPi;
export const defaultZoom = 18;
export const { x: defaultCameraX, y: defaultCameraY, z: defaultCameraZ } =
  getPositionFromCameraFormat(defaultDistance, defaultPivot, defaultRotation);

export const distanceMax = 60;
export const distanceMin = 1;
export const pivotMax = halfPi;
export const pivotMin = -halfPi;
const pivotOffset = .05;
export const zoomMax = 200;
export const zoomMin = 10;

const legalDistance = (distance: number) => Math.max(distanceMin, Math.min(distanceMax, distance));
const legalPivot = (pivot: number) => Math.max(pivotMin, Math.min(pivotMax, normalizeRadianMinusPi(pivot)));
const legalZoom = (zoom: number) => Math.max(zoomMin, Math.min(zoomMax, zoom));

const animationDuration = 200;

class DSTCamera {
  distance = defaultDistance;
  pivot = defaultPivot;
  rotation = defaultRotation;
  zoom = defaultZoom;

  animating = false;
  animationPercentage: Maybe<number>;
  startDistance: Maybe<number>;
  startPivot: Maybe<number>;
  startRotation: Maybe<number>;
  startZoom: Maybe<number>;

  targetDistance: Maybe<number>;
  targetPivot: Maybe<number>;
  targetRotation: Maybe<number>;
  targetZoom: Maybe<number>;

  constructor() {
    makeAutoObservable(this);
  }

  // Animate the camera towards its target values.
  // This is called every frame by the component.
  animate(dt: number) {
    if (this.animationPercentage == null) {
      // Change animating to false one frame behind the animation actually ending to prevent the
      // three camera from updating the dst camera incorrectly.
      this.animating = false;
      return;
    }

    this.animationPercentage = Math.min(this.animationPercentage + dt / animationDuration, 1);
    const smoothPercentage = Math.sin((this.animationPercentage * 2 - 1) * halfPi) / 2 + .5;
    if (this.targetDistance != null && this.startDistance != null) {
      this.setDistance(this.startDistance + (this.targetDistance - this.startDistance) * smoothPercentage);
    }
    if (this.targetPivot != null && this.startPivot != null) {
      this.setPivot(this.startPivot + (this.targetPivot - this.startPivot) * smoothPercentage);
    }
    if (this.targetRotation != null && this.startRotation != null) {
      const baseDifference = this.targetRotation - this.startRotation;
      const wrapOffset = baseDifference > Math.PI ? -twoPi : baseDifference < -Math.PI ? twoPi : 0;
      this.setRotation(this.startRotation + (baseDifference + wrapOffset) * smoothPercentage);
    }
    if (this.targetZoom != null && this.startZoom != null) {
      this.setZoom(this.startZoom + (this.targetZoom - this.startZoom) * smoothPercentage);
    }

    // End the animation if we're done.
    if (this.animationPercentage >= 1) {
      this.animationPercentage = undefined;
      this.startDistance = undefined;
      this.startPivot = undefined;
      this.startRotation = undefined;
      this.targetDistance = undefined;
      this.targetPivot = undefined;
      this.targetRotation = undefined;
      this.targetZoom = undefined;
    }
  }

  // Sets up an animation to move the camera by the given amounts.
  animateBy(dZoom: number, dPivot: number, dRotation: number) {
    // Capture the state when the animation starts.
    this.animating = true;
    this.animationPercentage = 0;
    this.startPivot = this.pivot;
    this.startRotation = this.rotation;
    this.startZoom = this.zoom;

    // Either set or extend the target distance, pivot, and rotation.
    this.targetPivot = legalPivot((this.targetPivot != null ? this.targetPivot : this.pivot) + dPivot);
    this.targetRotation =
      normalizeRadian2Pi((this.targetRotation != null ? this.targetRotation : this.rotation) + dRotation);
    this.targetZoom = legalZoom((this.targetZoom != null ? this.targetZoom : this.zoom) + dZoom);
  }

  // Sets up an animation to move the camera to the given values.
  animateTo(zoom: number, pivot: number, rotation: number) {
    const dZoom = zoom - (this.targetZoom ?? this.zoom);
    const dPivot = pivot - (this.targetPivot ?? this.pivot);
    const dRotation = rotation - (this.targetRotation ?? this.rotation);
    this.animateBy(dZoom, dPivot, dRotation);
  }

  get canPivotUp() {
    const pivot = this.pivot; // This is required to make the view update for some reason.
    return (this.targetPivot ?? pivot) < pivotMax - pivotOffset;
  }

  get canPivotDown() {
    const pivot = this.pivot; // This is required to make the view update for some reason.
    return (this.targetPivot ?? pivot) > pivotMin + pivotOffset;
  }
  
  get canZoomIn() {
    const zoom = this.zoom;
    return (this.targetZoom ?? zoom) < zoomMax;
  }

  get canZoomOut() {
    const zoom = this.zoom;
    return (this.targetZoom ?? zoom) > zoomMin;
  }

  // Returns the Euler to make a flat object face the camera
  get facingRotation() {
    return new Euler(-this.pivot, -this.rotation - halfPi, 0, "YXZ");
  }

  get isHome() {
    const { x, y, z } = this.position;
    return Math.abs(x - defaultCameraX) <= .2 && Math.abs(y - defaultCameraY) <= .2 &&
      Math.abs(z - defaultCameraZ) <= .2 && Math.abs(this.zoom - defaultZoom) <= 1;
  }

  get position() {
    return getPositionFromCameraFormat(this.distance, this.pivot, this.rotation);
  }

  resetHome() {
    this.animateTo(defaultZoom, defaultPivot, defaultRotation);
  }

  setDistance(distance: number) {
    this.distance = legalDistance(distance);
  }

  setPivot(pivot: number) {
    this.pivot = legalPivot(pivot);
  }

  setRotation(rotation: number) {
    this.rotation = normalizeRadian2Pi(rotation);
  }

  setPosition(x: number, y: number, z: number) {
    const { distance, pivot, rotation } = getCameraFormatFromPosition(x, y, z);
    this.setDistance(distance);
    this.setPivot(pivot);
    this.setRotation(rotation);
  }

  setZoom(zoom: number) {
    this.zoom = legalZoom(zoom);
  }

  zoomIn() {
    this.animateBy((this.targetZoom ?? this.zoom) / 3, 0, 0);
  }

  zoomOut() {
    this.animateBy(-(this.targetZoom ?? this.zoom) / 4, 0, 0);
  }
}

export const dstCamera = new DSTCamera();
