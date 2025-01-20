import { ICase } from "./codap-data";
import { graph, graphMax, graphMin } from "./graph";

describe("graph-utils", () => {
  describe("convertLat", () => {
    it("should convert latitude to graph coordinates", () => {
      expect(graph.convertLat(graph.latMin)).toBeCloseTo(graphMin);
      expect(graph.convertLat(graph.latMax)).toBeCloseTo(graphMax);
    });

    it("should use default latitude if none is provided", () => {
      expect(graph.convertLat()).toBeCloseTo(0);
    });
  });

  describe("convertLong", () => {
    it("should convert longitude to graph coordinates", () => {
      expect(graph.convertLong(graph.longMin)).toBeCloseTo(graphMin);
      expect(graph.convertLong(graph.longMax)).toBeCloseTo(graphMax);
    });

    it("should use default longitude if none is provided", () => {
      expect(graph.convertLong()).toBeCloseTo(0);
    });
  });

  describe("convertDate", () => {
    it("should convert date to graph coordinates", () => {
      const aCase: ICase = { id: 1, Day: 4, Month: 1, Year: 2020 };
      expect(graph.convertDate(aCase)).toBeCloseTo(-5);
    });
  });
});
