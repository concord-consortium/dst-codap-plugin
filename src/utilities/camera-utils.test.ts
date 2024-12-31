import { getCameraFormatFromPosition, getPositionFromCameraFormat } from "./camera-utils";
import { halfPi, normalizeRadian2Pi, normalizeRadianMinusPi } from "./trig-utils";


describe("camera utilities", () => {
  it("converts position to position round trip", () => {
    function testPositionToPosition(x: number, y: number, z: number) {
      const cameraFormat = getCameraFormatFromPosition(x, y, z);
      const position = getPositionFromCameraFormat(cameraFormat.distance, cameraFormat.pivot, cameraFormat.rotation);
      expect(position.x).toBeCloseTo(x);
      expect(position.y).toBeCloseTo(y);
      expect(position.z).toBeCloseTo(z);
    }
    testPositionToPosition(1, 2, 3);
    testPositionToPosition(-1, 2, 3);
    testPositionToPosition(1, -2, 3);
    testPositionToPosition(1, 2, -3);
    testPositionToPosition(-1, -2, 3);
    testPositionToPosition(-1, 2, -3);
    testPositionToPosition(1, -2, -3);
    testPositionToPosition(-1, -2, -3);
    testPositionToPosition(1, 0, 0);
    testPositionToPosition(0, 1, 0);
    testPositionToPosition(0, 0, 1);
  });

  it("converts camera format to camera format round trip", () => {
    function testCameraToCamera(distance: number, pivot: number, rotation: number) {
      const position = getPositionFromCameraFormat(distance, pivot, rotation);
      const cameraFormat = getCameraFormatFromPosition(position.x, position.y, position.z);
      expect(cameraFormat.distance).toBeCloseTo(distance);
      expect(cameraFormat.pivot).toBeCloseTo(normalizeRadianMinusPi(pivot));
      expect(cameraFormat.rotation).toBeCloseTo(normalizeRadian2Pi(rotation));
    }
    testCameraToCamera(1, 0, 0);
    testCameraToCamera(100, 0, 0);
    testCameraToCamera(1, halfPi, 0);
    testCameraToCamera(1, -halfPi, 0);
    testCameraToCamera(1, 1, halfPi);
    testCameraToCamera(1, 1, Math.PI);
    testCameraToCamera(1, 1, 3 * halfPi);
    testCameraToCamera(1, -1, -halfPi);
    testCameraToCamera(1, -1, -Math.PI);
    testCameraToCamera(1, 0, halfPi);
  });
});
