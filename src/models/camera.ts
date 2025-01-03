import { makeAutoObservable } from "mobx";
import { getCameraFormatFromPosition, getPositionFromCameraFormat } from "../utilities/camera-utils";
import { halfPi, normalizeRadian2Pi, normalizeRadianMinusPi, quarterPi } from "../utilities/trig-utils";

// const defaultCameraX = -10;
// const defaultCameraY = 14;
// const defaultCameraZ = 0;
// const { distance: defaultDistance, pivot: defaultPivot, rotation: defaultRotation} =
//   getCameraFormatFromPosition(defaultCameraX, defaultCameraY, defaultCameraZ);
const defaultDistance = 40;
const defaultRotation = quarterPi;
const defaultPivot = quarterPi;
const defaultZoom = 20;
const { x: defaultCameraX, y: defaultCameraY, z: defaultCameraZ } =
  getPositionFromCameraFormat(defaultDistance, defaultPivot, defaultRotation);

const distanceMax = 60;
const distanceMin = 1;
const pivotMax = halfPi;
const pivotMin = -halfPi;
const pivotOffset = .05;
export const zoomMax = 200;
export const zoomMin = 10;

class DSTCamera {
  distance = defaultDistance;
  pivot = defaultPivot;
  rotation = defaultRotation;
  zoom = defaultZoom;

  constructor() {
    makeAutoObservable(this);
  }

  get canPivotUp() {
    return this.pivot < pivotMax - pivotOffset;
  }

  get canPivotDown() {
    return this.pivot > pivotMin + pivotOffset;
  }
  
  get canZoomIn() {
    return this.zoom < zoomMax;
  }

  get canZoomOut() {
    return this.zoom > zoomMin;
  }

  get isHome() {
    const { x, y, z } = this.position;
    return x <= defaultCameraX + .2 && x >= defaultCameraX - .2 &&
      y <= defaultCameraY + .2 && y >= defaultCameraY - .2 &&
      z <= defaultCameraZ + .2 && z >= defaultCameraZ - .2;
  }

  get position() {
    return getPositionFromCameraFormat(this.distance, this.pivot, this.rotation);
  }

  resetHome() {
    this.setDistance(defaultDistance);
    this.setPivot(defaultPivot);
    this.setRotation(defaultRotation);
  }

  setPivot(pivot: number) {
    this.pivot = Math.max(pivotMin, Math.min(pivotMax, normalizeRadianMinusPi(pivot)));
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

  setDistance(distance: number) {
    this.distance = Math.max(distanceMin, Math.min(distanceMax, distance));
  }

  setZoom(zoom: number) {
    this.zoom = Math.max(zoomMin, Math.min(zoomMax, zoom));
  }
}

export const dstCamera = new DSTCamera();
