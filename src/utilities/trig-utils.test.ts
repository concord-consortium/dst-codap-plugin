import { normalizeRadian2Pi, normalizeRadianMinusPi, twoPi } from "./trig-utils";

describe("trig utilities", () => {
  it("normalize angle from 0 to 2pi works", () => {
    expect(normalizeRadian2Pi(0)).toBe(0);
    expect(normalizeRadian2Pi(Math.PI)).toBe(Math.PI);
    expect(normalizeRadian2Pi(twoPi)).toBe(0);
    expect(normalizeRadian2Pi(-Math.PI)).toBe(Math.PI);
    expect(normalizeRadian2Pi(3 * Math.PI)).toBe(Math.PI);
    expect(normalizeRadian2Pi(10 * Math.PI)).toBe(0);
    expect(normalizeRadian2Pi(-10 * Math.PI)).toBe(0);
  });

  it("normalize angle from -pi to pi works", () => {
    expect(normalizeRadianMinusPi(0)).toBe(0);
    expect(normalizeRadianMinusPi(Math.PI)).toBe(-Math.PI);
    expect(normalizeRadianMinusPi(twoPi)).toBe(0);
    expect(normalizeRadianMinusPi(-Math.PI)).toBe(-Math.PI);
    expect(normalizeRadianMinusPi(3 * Math.PI)).toBe(-Math.PI);
    expect(normalizeRadianMinusPi(10 * Math.PI)).toBe(0);
    expect(normalizeRadianMinusPi(-10 * Math.PI)).toBe(0);
  });
});
