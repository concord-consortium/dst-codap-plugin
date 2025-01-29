export const kPluginName = "Space-Time Cube";
export const kVersion = "0.0.1";
export const kInitialDimensions = {
  width: 685,
  height: 542
};

export const kGraphTabLabel = "3D Graph";
export const kAboutTabLabel = "About";

// These constants work for USA_location_map.svg.png
// export const kBackgroundHeight = 334;
// export const kBackgroundWidth = 640;
// export const kBackgroundLongMax = -66.5;
// export const kBackgroundLongMin = -125.5;
// const baseBackgroundLatMax = 49.8;
// const baseBackgroundLatMin = 24.2;

// These constants work for SpaceCubeMap.png
export const kBackgroundHeight = 3840;
export const kBackgroundWidth = 3840;
export const kBackgroundLongMax = -62;
export const kBackgroundLongMin = -130;
const baseBackgroundLatMin = 9.6;
const baseBackgroundLatMax = 63.5;
export const kBackgroundLongRange = kBackgroundLongMax - kBackgroundLongMin;
export const kBackgroundLongMid = kBackgroundLongMin + kBackgroundLongRange / 2;
const baseBackgroundLatRange = baseBackgroundLatMax - baseBackgroundLatMin;
export const kBackgroundLatMid = baseBackgroundLatMin + baseBackgroundLatRange / 2;
export const kBackgroundLatRange = baseBackgroundLatRange * kBackgroundWidth / kBackgroundHeight;
export const kBackgroundLatMax = kBackgroundLatMid + kBackgroundLatRange / 2;
export const kBackgroundLatMin = kBackgroundLatMid - kBackgroundLatRange / 2;
// To keep the display area a square, always ensure that there are
// kLatScale degrees latitude for every one degree longitude.
export const kLatScale = kBackgroundLatRange / kBackgroundLongRange;

export const kHomeMaxLatitude = kBackgroundLatMax - kBackgroundLatRange * .05;
export const kHomeMinLatitude = kBackgroundLatMin + kBackgroundLatRange * .05;
export const kHomeMaxLongitude = kBackgroundLongMax - kBackgroundLongRange * .05;
export const kHomeMinLongitude = kBackgroundLongMin + kBackgroundLongRange * .05;

export const kUIPivotChange = Math.PI / 12;
export const kUIRotationChange = Math.PI / 12;
