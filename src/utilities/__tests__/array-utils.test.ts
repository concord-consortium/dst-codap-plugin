import { minMax } from "../array-utils";

describe("minMax", () => {
  it("returns the min and max", () => {
    expect(minMax([3, 1, 4, 1, 5, 9, 2, 6])).toEqual({ min: 1, max: 9 });
    expect(minMax([-2, -7, -1])).toEqual({ min: -7, max: -1 });
    expect(minMax([42])).toEqual({ min: 42, max: 42 });
  });

  it("works on typed arrays", () => {
    expect(minMax(new Float64Array([2.5, -1.5, 0]))).toEqual({ min: -1.5, max: 2.5 });
  });

  it("does NOT throw on large arrays (the Math.min(...arr) spread bug)", () => {
    // 200K elements — Math.min(...arr) throws "Maximum call stack size exceeded"
    // here; minMax must not. This is the regression guard for the blank-plot bug.
    const n = 200_000;
    const arr = new Float64Array(n);
    for (let i = 0; i < n; i++) arr[i] = (i * 7919) % 100000;
    expect(() => Math.min(...(arr as unknown as number[]))).toThrow();
    expect(() => minMax(arr)).not.toThrow();
    const { min, max } = minMax(arr);
    expect(min).toBe(0);
    expect(max).toBeGreaterThan(0);
  });
});
