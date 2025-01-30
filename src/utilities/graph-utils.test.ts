import { ICase } from "../models/codap-data";
import { convertLat, convertLong, convertDate, dataRanges, graphMax, graphMin, projectPoint } from "./graph-utils";

describe("graph-utils", () => {
  describe("convertLat", () => {
    it("should convert latitude to graph coordinates", () => {
      expect(convertLat(dataRanges.latMin)).toBeCloseTo(graphMin);
      expect(convertLat(dataRanges.latMax)).toBeCloseTo(graphMax);
    });

    it("should use default latitude if none is provided", () => {
      expect(convertLat()).toBeCloseTo(0);
    });
  });

  describe("convertLong", () => {
    it("should convert longitude to graph coordinates", () => {
      expect(convertLong(dataRanges.longMin)).toBeCloseTo(graphMin);
      expect(convertLong(dataRanges.longMax)).toBeCloseTo(graphMax);
    });

    it("should use default longitude if none is provided", () => {
      expect(convertLong()).toBeCloseTo(0);
    });
  });

  describe("convertDate", () => {
    it("should convert date to graph coordinates", () => {
      const aCase: ICase = { __id__: "1", Day: 4, Month: 1, Year: 2020 };
      expect(convertDate(aCase)).toBeCloseTo(-5);
    });
  });

  describe("projectPoint", () => {
    it("should project a point correctly", () => {
      const result = projectPoint(0, 0, 0, 10, 10, 10, 5);
      expect(result.x).toBeCloseTo(2.886751345948129);
      expect(result.y).toBeCloseTo(2.886751345948129);
      expect(result.z).toBeCloseTo(2.886751345948129);
    });
  });
});
