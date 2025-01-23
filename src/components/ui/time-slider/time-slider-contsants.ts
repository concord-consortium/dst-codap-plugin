const timeLineHeight = 240;
const numTicks = 7;

const tickSpacing = timeLineHeight / (numTicks + 1);
export const tickOffsets = Array.from({ length: numTicks }, (_, i) => (i + 1) * tickSpacing);
