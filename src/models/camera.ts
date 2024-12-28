import { makeAutoObservable } from "mobx";
import { getCameraFormatFromPosition, getPositionFromCameraFormat } from "../utilities/camera-utils";
import { halfPi, normalizeRadian2Pi, normalizeRadianMinusPi } from "../utilities/trig-utils";

export const defaultCameraX = -10;
export const defaultCameraY = 14;
export const defaultCameraZ = 0;
const { radius: defaultRadius, latitude: defaultLatitude, longitude: defaultLongitude} =
  getCameraFormatFromPosition(defaultCameraX, defaultCameraY, defaultCameraZ);

const radiusMax = 30;
const radiusMin = 1;
const latitudeMax = halfPi;
const latitudeMin = -halfPi;
const latitudeOffset = .05;

class DSTCamera {
  radius = defaultRadius;
  latitude = defaultLatitude;
  longitude = defaultLongitude;

  constructor() {
    makeAutoObservable(this);
  }

  get canPivotUp() {
    return this.latitude < latitudeMax - latitudeOffset;
  }

  get canPivotDown() {
    return this.latitude > latitudeMin + latitudeOffset;
  }
  
  get canZoomIn() {
    return this.radius > radiusMin;
  }

  get canZoomOut() {
    return this.radius < radiusMax;
  }

  get position() {
    return getPositionFromCameraFormat(this.radius, this.latitude, this.longitude);
  }

  setLatitude(lat: number) {
    this.latitude = Math.max(latitudeMin, Math.min(latitudeMax, normalizeRadianMinusPi(lat)));
  }

  setLongitude(long: number) {
    this.longitude = normalizeRadian2Pi(long);
  }

  setPosition(x: number, y: number, z: number) {
    const { radius, latitude, longitude } = getCameraFormatFromPosition(x, y, z);
    this.setRadius(radius);
    this.setLatitude(latitude);
    this.setLongitude(longitude);
  }

  setRadius(r: number) {
    this.radius = Math.max(radiusMin, Math.min(radiusMax, r));
  }
}

export const dstCamera = new DSTCamera();
