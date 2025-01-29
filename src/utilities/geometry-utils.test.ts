import { projectPoint } from "./geometry-utils";

describe("geometry-utils", () => {
  describe("projectPoint", () => {
    it("should project a point correctly", () => {
      const result = projectPoint(0, 0, 0, 10, 10, 10, 5);
      expect(result.x).toBeCloseTo(2.886751345948129);
      expect(result.y).toBeCloseTo(2.886751345948129);
      expect(result.z).toBeCloseTo(2.886751345948129);
    });
  });
});
