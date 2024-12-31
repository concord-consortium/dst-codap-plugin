export const twoPi = Math.PI * 2;
export const halfPi = Math.PI / 2;

// max - min should equal two pi
function normalizeRadian(_radian: number, min: number, max: number) {
  let radian = _radian;
  while (radian < min) radian += twoPi;
  while (radian >= max) radian -= twoPi;
  return radian;
}

// Returns the equivalent radian between 0 and two pi.
export function normalizeRadian2Pi(radian: number) {
  return normalizeRadian(radian, 0, twoPi);
}

// Returns the equivalent radian betweeen -pi and pi.
export function normalizeRadianMinusPi(radian: number) {
  return normalizeRadian(radian, -Math.PI, Math.PI);
}
