import { kHomeMaxLatitude, kHomeMaxLongitude, kHomeMinLatitude, kHomeMinLongitude } from "../utilities/constants";
import { ICase } from "./codap-data";
import { graph, graphMax, graphMin } from "./graph";

// Normally this would be handled by useFrame in the MapPane componet.
const interval = setInterval(() => graph.animate(33), 33);

describe("graph", () => {
  beforeEach(() => {
    graph.setMaxDatePercent(1);
    graph.setMinDatePercent(0);
    graph.setCurrentDatePercent(1);
    graph.setMapDatePercent(0);
    graph.setMaxLatitude(kHomeMaxLatitude);
    graph.setMinLatitude(kHomeMinLatitude);
    graph.setMaxLongitude(kHomeMaxLongitude);
    graph.setMinLongitude(kHomeMinLongitude);
  });

  afterAll(() => clearInterval(interval));

  describe("setDates", () => {
    it("current and map dates follow min and max dates", () => {
      expect(graph.currentDatePercent).toBeCloseTo(1);
      graph.setMaxDatePercent(0.75);
      expect(graph.maxDatePercent).toBeCloseTo(0.75);
      expect(graph.currentDatePercent).toBeCloseTo(0.75);

      expect(graph.mapDatePercent).toBeCloseTo(0);
      graph.setMinDatePercent(0.25);
      expect(graph.minDatePercent).toBeCloseTo(0.25);
      expect(graph.mapDatePercent).toBeCloseTo(0.25);

      expect(graph.mapPosition).toBeCloseTo(-5);
      graph.setMapDatePercent(0.5);
      expect(graph.mapPosition).toBeCloseTo(0);
    });
  });

  describe("animate current date", () => {
    it("should animate current date", (done) => {
      expect(graph.canAnimateDate).toBe(false);
      graph.setCurrentDatePercent(0.975);
      expect(graph.canAnimateDate).toBe(true);
      graph.setAnimatingDate(true);

      setTimeout(() => {
        expect(graph.currentDatePercent).toBeGreaterThan(0.9);
        expect(graph.animatingDate).toBe(false);
        expect(graph.canAnimateDate).toBe(false);
        done();
      }, 300);
    });
  });

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
      graph.setMaxLongitude(graph.absoluteMaxLongitude - 3);
      graph.setMaxLatitude(graph.absoluteMaxLatitude - 3);
      expect(graph.latitudeInGraphSpace(graph.minLatitude)).toBeCloseTo(graphMin);
      expect(graph.latitudeInGraphSpace(graph.centerLat)).toBeCloseTo(0);
      expect(graph.latitudeInGraphSpace(graph.maxLatitude)).toBeCloseTo(graphMax);
      expect(graph.longitudeInGraphSpace(graph.minLongitude)).toBeCloseTo(graphMin);
      expect(graph.longitudeInGraphSpace(graph.centerLong)).toBeCloseTo(0);
      expect(graph.longitudeInGraphSpace(graph.maxLongitude)).toBeCloseTo(graphMax);
    });
  });

  describe("convertDateToGraph", () => {
    it("should convert date to graph coordinates", () => {
      const aCase: ICase = { __id__: "1", Day: 4, Month: 1, Year: 2020 };
      expect(graph.convertCaseDateToGraph(aCase)).toBeCloseTo(-5);
    });
  });

  describe("caseIsVisible", () => {
    it("should return true if case is within graph bounds", () => {
      const aCase: ICase = { __id__: "1", Latitude: graph.centerLat, Longitude: graph.centerLong };
      expect(graph.caseIsVisible(aCase)).toBe(true);
    });

    it("should return false if case is outside graph bounds", () => {
      const aCase: ICase = { __id__: "1", Latitude: graph.absoluteMaxLatitude + 1, Longitude: graph.absoluteMaxLongitude + 1 };
      expect(graph.caseIsVisible(aCase)).toBe(false);
    });

    it("should return false if case is outside time range", () => {
      const aCase: ICase = {
        __id__: "1", Latitude: graph.absoluteMaxLatitude, Longitude: graph.absoluteMaxLongitude,
        Year: 1980, Month: 1, Day: 1
      };
      expect(graph.caseIsVisible(aCase)).toBe(false);
      const aCase2: ICase = {
        __id__: "1", Latitude: graph.absoluteMaxLatitude, Longitude: graph.absoluteMaxLongitude,
        Year: 2100, Month: 1, Day: 1
      };
      expect(graph.caseIsVisible(aCase2)).toBe(false);
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
      graph.setMaxLatitude(graph.absoluteMaxLatitude);
      graph.setMinLatitude(graph.absoluteMinLatitude);
      graph.setMaxLongitude(graph.absoluteMaxLongitude);
      graph.setMinLongitude(graph.absoluteMinLongitude);
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
