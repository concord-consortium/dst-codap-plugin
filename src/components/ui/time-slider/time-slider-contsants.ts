import { range } from "d3";

export const timeLineTop = 48;
export const timeLineHeight = 240;

const numTicks = 7;
const tickSpacing = timeLineHeight / (numTicks + 1);
export const tickOffsets = range(1, numTicks + 1).map(num => num * tickSpacing);
export const labelOffsets = [0, ...tickOffsets, timeLineHeight];

export const labelHeight = 18;

export const dateRangeSliderThumbOffset = -14;
export const mapSliderThumbOffset = -14;
export const timeSliderThumbOffset = -18;
