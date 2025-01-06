export const kPluginName = "Space-Time Cube";
export const kVersion = "0.0.1";
export const kInitialDimensions = {
  width: 780,
  height: 600
};
export const kDataContextName = "dst-data";

export const kGraphTabLabel = "3D Graph";
export const kAboutTabLabel = "About";

export const kBackgroundHeight = 334;
export const kBackgroundWidth = 640;
export const kBackgroundLongMax = -66.5;
export const kBackgroundLongMin = -125.5;
const backgroundLongRange = kBackgroundLongMax - kBackgroundLongMin;
const baseBackgroundLatMax = 49.8;
const baseBackgroundLatMin = 24.2;
const baseBackgroundLatRange = baseBackgroundLatMax - baseBackgroundLatMin;
const baseBackgroundLatMid = baseBackgroundLatMin + baseBackgroundLatRange / 2;
export const kBackgroundLatMax = baseBackgroundLatMid + backgroundLongRange / 2;
export const kBackgroundLatMin = baseBackgroundLatMid - backgroundLongRange / 2;

export const kUIDistanceChange = 2;
export const kUIPivotChange = Math.PI / 12;
export const kUIRotationChange = Math.PI / 12;
