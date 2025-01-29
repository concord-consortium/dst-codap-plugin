import { kHomeMaxLatitude, kHomeMaxLongitude, kHomeMinLatitude, kHomeMinLongitude } from "../utilities/constants";
import { ICase } from "./codap-data";
import { graph, graphMax, graphMin } from "./graph";

// Normally this would be handled by useFrame in the MapPane componet.
const interval = setInterval(() => graph.animate(33), 33);

describe("graph", () => {
  beforeEach(() => {
    graph.setMaxLatitude(kHomeMaxLatitude);
    graph.setMinLatitude(kHomeMinLatitude);
    graph.setMaxLongitude(kHomeMaxLongitude);
    graph.setMinLongitude(kHomeMinLongitude);
  });

  afterAll(() => clearInterval(interval));

  describe("convertLat", () => {
    it("should convert latitude to graph coordinates", () => {
      expect(graph.convertLat(graph.minLatitude)).toBeCloseTo(graphMin);
      expect(graph.convertLat(graph.maxLatitude)).toBeCloseTo(graphMax);
    });

    it("should use default latitude if none is provided", () => {
      expect(graph.convertLat()).toBeCloseTo(0);
    });
  });

  describe("convertLong", () => {
    it("should convert longitude to graph coordinates", () => {
      expect(graph.convertLong(graph.minLongitude)).toBeCloseTo(graphMin);
      expect(graph.convertLong(graph.maxLongitude)).toBeCloseTo(graphMax);
    });

    it("should use default longitude if none is provided", () => {
      expect(graph.convertLong()).toBeCloseTo(0);
    });
  });

  describe("graph space", () => {
    it("should convert to correct graph space", () => {
      graph.setMaxLongitude(graph.longMax - 3);
      graph.setMaxLatitude(graph.latMax - 3);
      expect(graph.latitudeInGraphSpace(graph.minLatitude)).toBeCloseTo(graphMin);
      expect(graph.latitudeInGraphSpace(graph.centerLat)).toBeCloseTo(0);
      expect(graph.latitudeInGraphSpace(graph.maxLatitude)).toBeCloseTo(graphMax);
      expect(graph.longitudeInGraphSpace(graph.minLongitude)).toBeCloseTo(graphMin);
      expect(graph.longitudeInGraphSpace(graph.centerLong)).toBeCloseTo(0);
      expect(graph.longitudeInGraphSpace(graph.maxLongitude)).toBeCloseTo(graphMax);
    });
  });

  describe("convertDate", () => {
    it("should convert date to graph coordinates", () => {
      const aCase: ICase = { id: 1, Day: 4, Month: 1, Year: 2020 };
      expect(graph.convertCaseDate(aCase)).toBeCloseTo(-5);
    });
  });

  describe("caseIsVisible", () => {
    it("should return true if case is within graph bounds", () => {
      const aCase: ICase = { id: 1, Latitude: graph.centerLat, Longitude: graph.centerLong };
      expect(graph.caseIsVisible(aCase)).toBe(true);
    });

    it("should return false if case is outside graph bounds", () => {
      const aCase: ICase = { id: 1, Latitude: graph.latMax + 1, Longitude: graph.longMax + 1 };
      expect(graph.caseIsVisible(aCase)).toBe(false);
    });
  });

  describe("pan and zoom", () => {
    it("should zoom in", (done) => {
      const initialLongRange = graph.longRange;
      graph.zoomIn();

      setTimeout(() => {
        expect(graph.longRange).toBeLessThan(initialLongRange);
        done();
      }, 250);
    });

    it("should zoom out", (done) => {
      const initialLongRange = graph.longRange;
      graph.zoomOut();

      setTimeout(() => {
        expect(graph.longRange).toBeGreaterThan(initialLongRange);
        done();
      }, 250);
    });

    it("should pan down", (done) => {
      const initialMinLat = graph.minLatitude;
      graph.panDown();

      setTimeout(() => {
        expect(graph.minLatitude).toBeLessThan(initialMinLat);
        done();
      }, 250);
    });

    it("should pan up", (done) => {
      const initialMaxLat = graph.maxLatitude;
      graph.panUp();

      setTimeout(() => {
        expect(graph.maxLatitude).toBeGreaterThan(initialMaxLat);
        done();
      }, 250);
    });

    it("should pan left", (done) => {
      const initialMinLong = graph.minLongitude;
      graph.panLeft();

      setTimeout(() => {
        expect(graph.minLongitude).toBeLessThan(initialMinLong);
        done();
      }, 250);
    });

    it("should pan right", (done) => {
      const initialMaxLong = graph.maxLongitude;
      graph.panRight();

      setTimeout(() => {
        expect(graph.maxLongitude).toBeGreaterThan(initialMaxLong);
        done();
      }, 250);
    });
  });

  describe("reset", () => {
    it("should reset to home coordinates", (done) => {
      graph.setMaxLatitude(graph.latMax);
      graph.setMinLatitude(graph.latMin);
      graph.setMaxLongitude(graph.longMax);
      graph.setMinLongitude(graph.longMin);
      expect(graph.canZoomOut).toBe(false);
      expect(graph.canPanDown).toBe(false);
      expect(graph.canPanUp).toBe(false);
      expect(graph.canPanLeft).toBe(false);
      expect(graph.canPanRight).toBe(false);
      expect(graph.canReset).toBe(true);
      graph.reset();

      setTimeout(() => {
        expect(graph.maxLatitude).toBe(graph.homeMaxLatitude);
        expect(graph.minLatitude).toBe(graph.homeMinLatitude);
        expect(graph.maxLongitude).toBe(graph.homeMaxLongitude);
        expect(graph.minLongitude).toBe(graph.homeMinLongitude);
        expect(graph.canZoomOut).toBe(true);
        expect(graph.canPanDown).toBe(true);
        expect(graph.canPanUp).toBe(true);
        expect(graph.canPanLeft).toBe(true);
        expect(graph.canPanRight).toBe(true);
        expect(graph.canReset).toBe(false);
        done();
      }, 250);
    });
  });
});
