import { makeAutoObservable } from "mobx";
import { getCameraFormatFromPosition, getPositionFromCameraFormat } from "../utilities/camera-utils";
import { halfPi, normalizeRadian2Pi, normalizeRadianMinusPi } from "../utilities/trig-utils";

export const defaultCameraX = -10;
export const defaultCameraY = 14;
export const defaultCameraZ = 0;
const { distance: defaultDistance, pivot: defaultPivot, rotation: defaultRotation} =
  getCameraFormatFromPosition(defaultCameraX, defaultCameraY, defaultCameraZ);

const distanceMax = 30;
const distanceMin = 1;
const pivotMax = halfPi;
const pivotMin = -halfPi;
const pivotOffset = .05;

class DSTCamera {
  distance = defaultDistance;
  pivot = defaultPivot;
  rotation = defaultRotation;

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
    return this.distance > distanceMin;
  }

  get canZoomOut() {
    return this.distance < distanceMax;
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
}

export const dstCamera = new DSTCamera();
