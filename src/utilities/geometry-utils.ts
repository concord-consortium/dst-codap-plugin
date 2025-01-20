// Returns a point between the start and end points, offset distance from the start point.
export function projectPoint(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, offset: number) {
  const distance = Math.sqrt((x2 - x1)**2 + (y2 - y1)**2 + (z2 - z1)**2);
  const x = x1 + offset * ((x2 - x1) / distance);
  const y = y1 + offset * ((y2 - y1) / distance);
  const z = z1 + offset * ((z2 - z1) / distance);
  return { x, y, z };
}
