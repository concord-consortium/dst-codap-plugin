import { makeAutoObservable } from "mobx";
import { getCameraFormatFromPosition, getPositionFromCameraFormat } from "../utilities/camera-utils";
import { halfPi, normalizeRadian2Pi, normalizeRadianMinusPi, twoPi } from "../utilities/trig-utils";

const defaultCameraX = -10;
const defaultCameraY = 14;
const defaultCameraZ = 0;
const { distance: defaultDistance, pivot: defaultPivot, rotation: defaultRotation} =
  getCameraFormatFromPosition(defaultCameraX, defaultCameraY, defaultCameraZ);
// const defaultDistance = 20;
// const defaultRotation = halfPi;
// const defaultPivot = Math.PI / 4;
// const { x: defaultCameraX, y: defaultCameraY, z: defaultCameraZ } =
//   getPositionFromCameraFormat(defaultDistance, defaultPivot, defaultRotation);

const distanceMax = 30;
const distanceMin = 1;
const legalDistance = (distance: number) => Math.max(distanceMin, Math.min(distanceMax, distance));
const pivotMax = halfPi;
const pivotMin = -halfPi;
const pivotOffset = .05;
const legalPivot = (pivot: number) => Math.max(pivotMin, Math.min(pivotMax, normalizeRadianMinusPi(pivot)));

class DSTCamera {
  distance = defaultDistance;
  pivot = defaultPivot;
  rotation = defaultRotation;

  animationPercentage: Maybe<number>;
  startDistance: Maybe<number>;
  startPivot: Maybe<number>;
  startRotation: Maybe<number>;

  targetDistance: Maybe<number>;
  targetPivot: Maybe<number>;
  targetRotation: Maybe<number>;

  constructor() {
    makeAutoObservable(this);
  }

  animateBy(dDistance: number, dPivot: number, dRotation: number) {
    this.animationPercentage = 0;
    this.startDistance = this.distance;
    this.startPivot = this.pivot;
    this.startRotation = this.rotation;

    this.targetDistance =
      legalDistance((this.targetDistance != null ? this.targetDistance : this.distance) + dDistance);
    this.targetPivot = legalPivot((this.targetPivot != null ? this.targetPivot : this.pivot) + dPivot);
    this.targetRotation =
      normalizeRadian2Pi((this.targetRotation != null ? this.targetRotation : this.rotation) + dRotation);

    const animate = () => {
      this.animationPercentage = this.animationPercentage != null ? Math.min(this.animationPercentage + .1, 1) : 1;
      const percentage = Math.sin((this.animationPercentage * 2 - 1) * halfPi) / 2 + .5;
      if (this.targetDistance != null && this.startDistance != null) {
        this.setDistance(this.startDistance + (this.targetDistance - this.startDistance) * percentage);
      }
      if (this.targetPivot != null && this.startPivot != null) {
        this.setPivot(this.startPivot + (this.targetPivot - this.startPivot) * percentage);
      }
      if (this.targetRotation != null && this.startRotation != null) {
        const normalChange = this.targetRotation - this.startRotation;
        const wrapOffset = normalChange > Math.PI ? -twoPi : normalChange < -Math.PI ? twoPi : 0;
        this.setRotation(this.startRotation + (this.targetRotation - this.startRotation + wrapOffset) * percentage);
      }

      if (
        (this.targetDistance != null && this.distance !== this.targetDistance) ||
        (this.targetPivot != null && this.pivot !== this.targetPivot) ||
        (this.targetRotation != null && this.rotation !== this.targetRotation)
      ) {
        setTimeout(animate, 20);
      } else {
        this.animationPercentage = undefined;
        this.startDistance = undefined;
        this.startPivot = undefined;
        this.startRotation = undefined;
        this.targetDistance = undefined;
        this.targetPivot = undefined;
        this.targetRotation = undefined;
      }
    };
    animate();
  }

  get canPivotUp() {
    const pivot = this.pivot;
    return this.targetPivot != null ? this.targetPivot < pivotMax - pivotOffset : pivot < pivotMax - pivotOffset;
  }

  get canPivotDown() {
    const pivot = this.pivot;
    return this.targetPivot != null ? this.targetPivot > pivotMin + pivotOffset : pivot > pivotMin + pivotOffset;
  }
  
  get canZoomIn() {
    const distance = this.distance;
    return this.targetDistance != null ? this.targetDistance > distanceMin : distance > distanceMin;
  }

  get canZoomOut() {
    const distance = this.distance;
    return this.targetDistance != null ? this.targetDistance < distanceMax : distance < distanceMax;
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
}

export const dstCamera = new DSTCamera();
