import { halfPi, normalizeRadian2Pi, normalizeRadianMinusPi } from "./trig-utils";

export interface ICameraFormat {
  distance: number; // Distance from center
  rotation: number; // Angle around the y axis. Ranges from 0 to two pi.
  // Angle on the plane that cuts through the rotation angle.
  // Ranges from -half pi (looking straight up) to half pi (looking straight down).
  pivot: number;
}
export interface IPosition {
  x: number;
  y: number;
  z: number;
}

export function getCameraFormatFromPosition(x: number, y: number, z: number): ICameraFormat {
  const distance = Math.sqrt(x**2 + y**2 + z**2);
  const rotation = x === 0 && z === 0 ? 0 : normalizeRadian2Pi(Math.atan(z/x) - (x >= 0 ? Math.PI : 0));
  const pivot = normalizeRadianMinusPi(Math.asin(y / distance));
  return { distance, pivot, rotation };
}

export function getPositionFromCameraFormat(distance: number, _pivot: number, _rotation: number): IPosition {
  const pivot = normalizeRadianMinusPi(_pivot);
  const rotation = normalizeRadian2Pi(_rotation);
  const y = distance * Math.sin(pivot);
  const flatDistance = distance * Math.cos(pivot);
  const xSign = (rotation < halfPi || rotation > 3 * halfPi ? -1 : 1);
  const x = Math.abs(flatDistance * Math.cos(rotation)) * xSign;
  const z = Math.abs(flatDistance * Math.sin(rotation)) * (rotation > Math.PI ? 1 : -1);
  return { x, y, z };
}
