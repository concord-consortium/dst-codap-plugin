import { makeAutoObservable } from "mobx";
import { getCameraFormatFromPosition, getPositionFromCameraFormat } from "../utilities/camera-utils";
import { normalizeRadian } from "../utilities/trig-utils";

export const defaultCameraX = -10;
export const defaultCameraY = 14;
export const defaultCameraZ = 0;
const { radius: defaultRadius, latitude: defaultLatitude, longitude: defaultLongitude} =
  getCameraFormatFromPosition(defaultCameraX, defaultCameraY, defaultCameraZ);

export const radiusMax = 30;
export const radiusMin = 1;

class DSTCamera {
  radius = defaultRadius;
  latitude = defaultLatitude;
  longitude = defaultLongitude;

  constructor() {
    makeAutoObservable(this);
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
    this.latitude = Math.max(0, Math.min(Math.PI, normalizeRadian(lat)));
  }

  setLongitude(long: number) {
    this.longitude = normalizeRadian(long);
  }

  setPosition(x: number, y: number, z: number) {
    const { radius, latitude, longitude } = getCameraFormatFromPosition(x, y, z);
    this.radius = radius;
    this.latitude = latitude;
    this.longitude = longitude;
  }

  setRadius(r: number) {
    this.radius = Math.max(radiusMin, Math.min(radiusMax, r));
  }
}

export const dstCamera = new DSTCamera();
