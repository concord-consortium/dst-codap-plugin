import { pickPointAt, pointsInRect, ScreenPoints } from "../point-picking";

function makePoints(rows: Array<{ x: number; y: number; r: number; depth: number; hidden?: number }>): ScreenPoints {
  const count = rows.length;
  const p: ScreenPoints = {
    count,
    screenX: new Float32Array(count),
    screenY: new Float32Array(count),
    screenR: new Float32Array(count),
    depth: new Float32Array(count),
    hidden: new Uint8Array(count),
  };
  rows.forEach((r, i) => {
    p.screenX[i] = r.x;
    p.screenY[i] = r.y;
    p.screenR[i] = r.r;
    p.depth[i] = r.depth;
    p.hidden[i] = r.hidden ?? 0;
  });
  return p;
}

describe("pickPointAt", () => {
  it("hits the disc under the cursor and misses outside it", () => {
    const p = makePoints([{ x: 100, y: 100, r: 10, depth: 0.5 }]);
    expect(pickPointAt(105, 102, p)).toBe(0); // inside radius
    expect(pickPointAt(100, 100, p)).toBe(0); // dead center
    expect(pickPointAt(115, 100, p)).toBe(-1); // 15px away, r=10
  });

  it("returns the frontmost (nearest depth) disc when discs overlap", () => {
    const p = makePoints([
      { x: 100, y: 100, r: 12, depth: 0.8 }, // behind
      { x: 102, y: 101, r: 12, depth: 0.2 }, // front — should win
      { x: 99, y: 99, r: 12, depth: 0.5 },
    ]);
    expect(pickPointAt(101, 100, p)).toBe(1);
  });

  it("never picks hidden or zero-radius instances", () => {
    const p = makePoints([
      { x: 100, y: 100, r: 10, depth: 0.1, hidden: 1 },
      { x: 100, y: 100, r: 0, depth: 0.1 },
    ]);
    expect(pickPointAt(100, 100, p)).toBe(-1);
  });

  it("returns -1 when nothing is under the cursor", () => {
    const p = makePoints([{ x: 0, y: 0, r: 5, depth: 0.5 }]);
    expect(pickPointAt(500, 500, p)).toBe(-1);
  });
});

describe("pointsInRect", () => {
  it("selects centers inside the box (size-independent), skipping hidden", () => {
    const p = makePoints([
      { x: 10, y: 10, r: 5, depth: 0.5 },   // in
      { x: 50, y: 50, r: 5, depth: 0.5 },   // in
      { x: 200, y: 50, r: 5, depth: 0.5 },  // out (x)
      { x: 50, y: 50, r: 5, depth: 0.5, hidden: 1 }, // hidden
      { x: 30, y: 30, r: 0, depth: 0.5 },   // behind camera
    ]);
    const got = pointsInRect({ minX: 0, minY: 0, maxX: 100, maxY: 100 }, p);
    expect(got).toEqual([0, 1]);
  });

  it("includes points exactly on the boundary", () => {
    const p = makePoints([{ x: 100, y: 0, r: 5, depth: 0.5 }]);
    expect(pointsInRect({ minX: 0, minY: 0, maxX: 100, maxY: 100 }, p)).toEqual([0]);
  });
});
