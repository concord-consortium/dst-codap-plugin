export const kPluginName = "Space-Time Cube";
export const kVersion = "0.0.1";
export const kInitialDimensions = {
  width: 780,
  height: 600
};

export const kGraphTabLabel = "3D Graph";
export const kAboutTabLabel = "About";

export const kBackgroundHeight = 334;
export const kBackgroundWidth = 640;
export const kBackgroundLongMax = -66.5;
export const kBackgroundLongMin = -125.5;
export const kBackgroundLongRange = kBackgroundLongMax - kBackgroundLongMin;
export const kBackgroundLongMid = kBackgroundLongMin + kBackgroundLongRange / 2;
const baseBackgroundLatMax = 49.8;
const baseBackgroundLatMin = 24.2;
const baseBackgroundLatRange = baseBackgroundLatMax - baseBackgroundLatMin;
export const kBackgroundLatMid = baseBackgroundLatMin + baseBackgroundLatRange / 2;
const latRange = baseBackgroundLatRange * kBackgroundWidth / kBackgroundHeight;
export const kBackgroundLatMax = kBackgroundLatMid + latRange / 2;
export const kBackgroundLatMin = kBackgroundLatMid - latRange / 2;
// To keep the display area a square, always ensure that there are
// kLatScale degrees latitude for every one degree longitude.
export const kLatScale = latRange / kBackgroundLongRange;

export const kUIPivotChange = Math.PI / 12;
export const kUIRotationChange = Math.PI / 12;
