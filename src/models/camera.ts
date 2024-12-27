import { action, computed, makeObservable, observable } from "mobx";
import { getCameraFormatFromPosition, getPositionFromCameraFormat } from "../utilities/camera-utils";
import { normalizeRadian } from "../utilities/trig-utils";

export const defaultCameraX = -10;
export const defaultCameraY = 14;
export const defaultCameraZ = 0;
const { radius: defaultRadius, latitude: defaultLatitude, longitude: defaultLongitude} =
  getCameraFormatFromPosition(defaultCameraX, defaultCameraY, defaultCameraZ);

class DSTCamera {
  radius = defaultRadius;
  latitude = defaultLatitude;
  longitude = defaultLongitude;

  constructor() {
    makeObservable(this, {
      radius: observable,
      longitude: observable,
      latitude: observable,
      position: computed,
      setLatitude: action,
      setLongitude: action,
      setPosition: action,
      setRadius: action
    });
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
    this.radius = r;
  }
}

export const dstCamera = new DSTCamera();
