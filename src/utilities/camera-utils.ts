import { halfPi, normalizeRadian } from "./trig-utils";

export interface ICameraFormat {
  radius: number; // Distance from center
  longitude: number; // Angle on the xz plane
  // Angle on the plane that cuts through the longitude.
  // Ranges from 0 (looking straight down) to pi (looking straight up).
  latitude: number;
}
export interface IPosition {
  x: number;
  y: number;
  z: number;
}

export function getCameraFormatFromPosition(x: number, y: number, z: number): ICameraFormat {
  console.log(`--- x`, x);
  console.log(` -- y`, y);
  console.log(` -- z`, z);
  const radius = Math.sqrt(x**2 + y**2 + z**2);
  const longitude = normalizeRadian(Math.atan(z/x) - (x > 0 ? Math.PI : 0));
  const _latitude = normalizeRadian(Math.acos(Math.sqrt(z**2 + y**2) / radius));
  const latitude = y > 0 ? _latitude : Math.PI - _latitude;
  console.log(`--- radius`, radius);
  console.log(` -- latitude`, latitude);
  console.log(` -- longitude`, longitude);
  return { radius, latitude, longitude };
}

export function getPositionFromCameraFormat(radius: number, latitude: number, longitude: number): IPosition {
  const tanLong = Math.tan(longitude);
  const y = Math.sqrt((radius * Math.cos(latitude)) ** 2 / (1 + tanLong ** 2)) * (latitude > halfPi ? -1 : 1);
  const _z = y * tanLong;
  const x = Math.sqrt(radius ** 2 - _z ** 2 - y ** 2) * (longitude < halfPi || longitude > 3 * halfPi ? -1 : 1);
  const z = Math.abs(_z) * (longitude > Math.PI ? 1 : -1);
  console.log(`... x`, x);
  console.log(` .. y`, y);
  console.log(` .. z`, z);
  return { x, y, z };
}
