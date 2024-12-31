import { getCameraFormatFromPosition, getPositionFromCameraFormat } from "./camera-utils";
import { halfPi, normalizeRadian2Pi, normalizeRadianMinusPi } from "./trig-utils";


describe("camera utilities", () => {
  it("converts position to position round trip", () => {
    function testPositionToPosition(x: number, y: number, z: number) {
      const cameraFormat = getCameraFormatFromPosition(x, y, z);
      const position = getPositionFromCameraFormat(cameraFormat.radius, cameraFormat.latitude, cameraFormat.longitude);
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
    function testCameraToCamera(r: number, lat: number, long: number) {
      const position = getPositionFromCameraFormat(r, lat, long);
      const cameraFormat = getCameraFormatFromPosition(position.x, position.y, position.z);
      expect(cameraFormat.radius).toBeCloseTo(r);
      expect(cameraFormat.latitude).toBeCloseTo(normalizeRadianMinusPi(lat));
      expect(cameraFormat.longitude).toBeCloseTo(normalizeRadian2Pi(long));
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
