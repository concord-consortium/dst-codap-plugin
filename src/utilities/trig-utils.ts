export const twoPi = Math.PI * 2;
export const halfPi = Math.PI / 2;

export function normalizeRadian(_radian: number) {
  let radian = _radian;
  while (radian < 0) radian += twoPi;
  while (radian > twoPi) radian -= twoPi;
  return radian;
}
