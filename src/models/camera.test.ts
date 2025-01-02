import {
  defaultCameraX, defaultCameraY, defaultCameraZ, defaultDistance, defaultPivot, defaultRotation, distanceMax,
  distanceMin, dstCamera, pivotMax, pivotMin
} from "./camera";

describe("DSTCamera", () => {
  beforeEach(() => {
    dstCamera.setDistance(defaultDistance);
    dstCamera.setPivot(defaultPivot);
    dstCamera.setRotation(defaultRotation);
  });

  test("should initialize with default values", () => {
    expect(dstCamera.distance).toBeCloseTo(defaultDistance);
    expect(dstCamera.pivot).toBeCloseTo(defaultPivot);
    expect(dstCamera.rotation).toBeCloseTo(defaultRotation);
  });

  test("should reset to home position", (done) => {
    dstCamera.setDistance(10);
    dstCamera.setPivot(0.5);
    dstCamera.setRotation(1);

    dstCamera.resetHome();


    setTimeout(() => {
      expect(dstCamera.distance).toBeCloseTo(defaultDistance);
      expect(dstCamera.pivot).toBeCloseTo(defaultPivot);
      expect(dstCamera.rotation).toBeCloseTo(defaultRotation);
      done();
    }, 250);
  });

  test("should set distance within legal range", () => {
    dstCamera.setDistance(50);
    expect(dstCamera.distance).toBe(distanceMax);

    dstCamera.setDistance(-10);
    expect(dstCamera.distance).toBe(distanceMin);

    dstCamera.setDistance(15);
    expect(dstCamera.distance).toBe(15);
  });

  test("should set pivot within legal range", () => {
    dstCamera.setPivot(3/4 * Math.PI);
    expect(dstCamera.pivot).toBeCloseTo(pivotMax);

    dstCamera.setPivot(-Math.PI);
    expect(dstCamera.pivot).toBeCloseTo(pivotMin);

    dstCamera.setPivot(0);
    expect(dstCamera.pivot).toBeCloseTo(0);
  });

  test("should set rotation within legal range", () => {
    dstCamera.setRotation(4 * Math.PI);
    expect(dstCamera.rotation).toBeCloseTo(0);

    dstCamera.setRotation(-2 * Math.PI);
    expect(dstCamera.rotation).toBeCloseTo(0);

    dstCamera.setRotation(Math.PI);
    expect(dstCamera.rotation).toBeCloseTo(Math.PI);
  });

  test("should animate by given deltas", (done) => {
    dstCamera.animateBy(5, 0.1, Math.PI / 4);
    expect(dstCamera.distance).toBeLessThan(defaultDistance + 5);
    expect(dstCamera.pivot).toBeLessThan(defaultPivot + 0.1);
    expect(dstCamera.rotation).toBeLessThan(defaultRotation + Math.PI / 4);

    setTimeout(() => {
      expect(dstCamera.distance).toBeCloseTo(defaultDistance + 5);
      expect(dstCamera.pivot).toBeCloseTo(defaultPivot + 0.1);
      expect(dstCamera.rotation).toBeCloseTo(defaultRotation + Math.PI / 4);
      done();
    }, 250);
  });

  test("should return correct position", () => {
    const position = dstCamera.position;
    expect(position.x).toBeCloseTo(defaultCameraX);
    expect(position.y).toBeCloseTo(defaultCameraY);
    expect(position.z).toBeCloseTo(defaultCameraZ);
  });

  test("should determine if can pivot up", () => {
    dstCamera.setPivot(pivotMax);
    expect(dstCamera.canPivotUp).toBe(false);

    dstCamera.setPivot(0);
    expect(dstCamera.canPivotUp).toBe(true);
  });

  test("should determine if can pivot down", () => {
    dstCamera.setPivot(pivotMin);
    expect(dstCamera.canPivotDown).toBe(false);

    dstCamera.setPivot(0);
    expect(dstCamera.canPivotDown).toBe(true);
  });

  test("should determine if can zoom in", () => {
    dstCamera.setDistance(distanceMin);
    expect(dstCamera.canZoomIn).toBe(false);

    dstCamera.setDistance(10);
    expect(dstCamera.canZoomIn).toBe(true);
  });

  test("should determine if can zoom out", () => {
    dstCamera.setDistance(distanceMax);
    expect(dstCamera.canZoomOut).toBe(false);

    dstCamera.setDistance(10);
    expect(dstCamera.canZoomOut).toBe(true);
  });

  test("should determine if is home", () => {
    dstCamera.resetHome();
    expect(dstCamera.isHome).toBe(true);

    dstCamera.setDistance(10);
    expect(dstCamera.isHome).toBe(false);
  });
});
