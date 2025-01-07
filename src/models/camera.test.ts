import {
  defaultCameraX, defaultCameraY, defaultCameraZ, defaultDistance, defaultPivot, defaultRotation, defaultZoom,
  distanceMax, distanceMin, dstCamera, pivotMax, pivotMin, zoomMax, zoomMin
} from "./camera";

// Normally this would be handled by useFrame in the DSTCamera componet.
const interval = setInterval(() => dstCamera.animate(33), 33);

describe("DSTCamera", () => {
  beforeEach(() => {
    dstCamera.setDistance(defaultDistance);
    dstCamera.setPivot(defaultPivot);
    dstCamera.setRotation(defaultRotation);
    dstCamera.setZoom(defaultZoom);
  });

  afterAll(() => clearInterval(interval));

  test("should initialize with default values", () => {
    expect(dstCamera.zoom).toBeCloseTo(defaultZoom);
    expect(dstCamera.pivot).toBeCloseTo(defaultPivot);
    expect(dstCamera.rotation).toBeCloseTo(defaultRotation);
  });

  test("should reset to home position", (done) => {
    dstCamera.setZoom(10);
    dstCamera.setPivot(0.5);
    dstCamera.setRotation(1);

    dstCamera.resetHome();


    setTimeout(() => {
      expect(dstCamera.zoom).toBeCloseTo(defaultZoom);
      expect(dstCamera.pivot).toBeCloseTo(defaultPivot);
      expect(dstCamera.rotation).toBeCloseTo(defaultRotation);
      done();
    }, 250);
  });

  test("should set distance within legal range", () => {
    dstCamera.setDistance(100);
    expect(dstCamera.distance).toBe(distanceMax);

    dstCamera.setDistance(-10);
    expect(dstCamera.distance).toBe(distanceMin);

    dstCamera.setDistance(defaultDistance);
    expect(dstCamera.distance).toBe(defaultDistance);
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
    expect(dstCamera.zoom).toBeLessThan(defaultZoom + 5);
    expect(dstCamera.pivot).toBeLessThan(defaultPivot + 0.1);
    expect(dstCamera.rotation).toBeLessThan(defaultRotation + Math.PI / 4);

    setTimeout(() => {
      expect(dstCamera.zoom).toBeCloseTo(defaultZoom + 5);
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
    expect(dstCamera.canZoomIn).toBe(true);
    dstCamera.setZoom(zoomMax);
    expect(dstCamera.canZoomIn).toBe(false);
  });

  test("should determine if can zoom out", () => {
    expect(dstCamera.canZoomOut).toBe(true);
    dstCamera.setZoom(zoomMin);
    expect(dstCamera.canZoomOut).toBe(false);
  });

  test("should determine if is home", () => {
    dstCamera.resetHome();
    expect(dstCamera.isHome).toBe(true);

    dstCamera.setDistance(10);
    expect(dstCamera.isHome).toBe(false);
  });
});
