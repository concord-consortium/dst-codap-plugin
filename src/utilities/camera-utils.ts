import { halfPi, normalizeRadian2Pi, normalizeRadianMinusPi } from "./trig-utils";

export interface ICameraFormat {
  radius: number; // Distance from center
  longitude: number; // Angle on the xz plane
  // Angle on the plane that cuts through the longitude.
  // Ranges from -half pi (look straight up) to half pi (looking straight down).
  latitude: number;
}
export interface IPosition {
  x: number;
  y: number;
  z: number;
}

export function getCameraFormatFromPosition(x: number, y: number, z: number): ICameraFormat {
  const radius = Math.sqrt(x**2 + y**2 + z**2);
  const longitude = x === 0 && z === 0 ? 0 : normalizeRadian2Pi(Math.atan(z/x) - (x >= 0 ? Math.PI : 0));
  const latitude = normalizeRadianMinusPi(Math.asin(y / radius));
  return { radius, latitude, longitude };
}

export function getPositionFromCameraFormat(radius: number, _latitude: number, _longitude: number): IPosition {
  const latitude = normalizeRadianMinusPi(_latitude);
  const longitude = normalizeRadian2Pi(_longitude);
  const y = radius * Math.sin(latitude);
  const flatRadius = radius * Math.cos(latitude);
  const xSign = (longitude < halfPi || longitude > 3 * halfPi ? -1 : 1);
  const x = Math.abs(flatRadius * Math.cos(longitude)) * xSign;
  const z = Math.abs(flatRadius * Math.sin(longitude)) * (longitude > Math.PI ? 1 : -1);
  return { x, y, z };
}
