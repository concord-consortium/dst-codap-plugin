import { ICaseCreation } from "../codap/models/data/data-set-types";
import testDataSet from "../test/test-data-set.json";
import { setDSTCases, updateDataSetAttributes } from "../utilities/codap-utils";
import { kHomeMaxLatitude, kHomeMaxLongitude, kHomeMinLatitude, kHomeMinLongitude } from "../utilities/constants";
import { graph, graphMax, graphMin } from "./graph";

const cases: ICaseCreation[] = [
  { __id__: "1", Day: 4, Month: 1, Year: 2020 },
  {
    __id__: "2", Latitude: graph.centerLat, Longitude: graph.centerLong,
    Year: 2021, Month: 1, Day: 1
  },
  {
    __id__: "3", Latitude: graph.absoluteMaxLatitude + 1, Longitude: graph.absoluteMaxLongitude + 1,
    Year: 2021, Month: 1, Day: 1
  },
  {
    __id__: "4", Latitude: graph.absoluteMaxLatitude, Longitude: graph.absoluteMaxLongitude,
    Year: 1980, Month: 1, Day: 1
  },
  {
    __id__: "5", Latitude: graph.absoluteMaxLatitude, Longitude: graph.absoluteMaxLongitude,
    Year: 2100, Month: 1, Day: 1
  }
];

// Normally this would be handled by useFrame in the MapPane componet.
const interval = setInterval(() => graph.animate(33), 33);

describe("graph", () => {
  beforeAll(() => {
    updateDataSetAttributes(testDataSet as any);
    setDSTCases(cases);
  });

  beforeEach(() => {
    graph.unlockSlice();
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

  describe("slice lock", () => {
    it("only allows locking once a slice exists", () => {
      expect(graph.sliceExists).toBe(false);
      graph.lockSlice();
      expect(graph.sliceLocked).toBe(false); // no slice yet → no-op

      graph.setMinDatePercent(0.4);
      graph.setMaxDatePercent(0.8);
      expect(graph.sliceExists).toBe(true);
      graph.lockSlice();
      expect(graph.sliceLocked).toBe(true);
      // Locking reveals the whole slice (scrub pinned to the top triangle).
      expect(graph.currentDatePercent).toBeCloseTo(0.8);
    });

    it("projects against the full range when locked, the slice when not", () => {
      graph.setMinDatePercent(0.4);
      graph.setMaxDatePercent(0.8);
      // Unlocked: slice fills the cube.
      expect(graph.convertPercentToGraph(0.4)).toBeCloseTo(graphMin);
      expect(graph.convertPercentToGraph(0.8)).toBeCloseTo(graphMax);

      graph.lockSlice();
      // Locked: full dataset fills the cube; the slice is an interior band.
      expect(graph.convertPercentToGraph(0)).toBeCloseTo(graphMin);
      expect(graph.convertPercentToGraph(1)).toBeCloseTo(graphMax);
      expect(graph.axisMinDate).toBeCloseTo(graph.convertPercentToDate(0));
      expect(graph.axisMaxDate).toBeCloseTo(graph.convertPercentToDate(1));
    });

    it("slides a locked slice as a unit, clamped to [0, 1]", () => {
      graph.setMinDatePercent(0.4);
      graph.setMaxDatePercent(0.6);
      graph.lockSlice();

      graph.translateSlice(0.1);
      expect(graph.minDatePercent).toBeCloseTo(0.5);
      expect(graph.maxDatePercent).toBeCloseTo(0.7);
      expect(graph.sliceSeparation).toBeCloseTo(0.2); // separation preserved

      // Over-translate up: clamps so the top triangle stops at 1.
      graph.translateSlice(0.9);
      expect(graph.maxDatePercent).toBeCloseTo(1);
      expect(graph.minDatePercent).toBeCloseTo(0.8);
    });

    it("can animate while locked until the top triangle reaches the top", (done) => {
      // Start near the top so the climb finishes within the test window
      // (animation rate is 0.1/sec).
      graph.setMinDatePercent(0.67);
      graph.setMaxDatePercent(0.97);
      graph.lockSlice();
      expect(graph.canAnimateDate).toBe(true);
      graph.setAnimatingDate(true);

      setTimeout(() => {
        expect(graph.maxDatePercent).toBeGreaterThan(0.97); // slid up
        expect(graph.sliceSeparation).toBeCloseTo(0.3);     // separation held
        expect(graph.animatingDate).toBe(false);            // stopped at the top
        expect(graph.maxDatePercent).toBeCloseTo(1);
        done();
      }, 600);
    });

    it("frees the map plane to the full axis when locked, re-confines on unlock", () => {
      graph.setMinDatePercent(0.4);
      graph.setMaxDatePercent(0.8);
      graph.setMapDatePercent(0.5); // confined to the slice while unlocked
      expect(graph.mapDatePercent).toBeCloseTo(0.5);

      graph.lockSlice();
      expect(graph.mapDatePercent).toBeCloseTo(0); // dropped to the bottom
      graph.setMapDatePercent(0.95);               // roams the full axis now
      expect(graph.mapDatePercent).toBeCloseTo(0.95);

      graph.unlockSlice();
      // Re-confined to the slice [0.4, 0.8] → clamped down to the top.
      expect(graph.mapDatePercent).toBeCloseTo(0.8);
    });

    it("unlocking re-zooms the cube to the slice", () => {
      graph.setMinDatePercent(0.4);
      graph.setMaxDatePercent(0.8);
      graph.lockSlice();
      graph.unlockSlice();
      expect(graph.sliceLocked).toBe(false);
      expect(graph.convertPercentToGraph(0.4)).toBeCloseTo(graphMin);
      expect(graph.convertPercentToGraph(0.8)).toBeCloseTo(graphMax);
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
      expect(graph.convertCaseDateToGraph("1")).toBeCloseTo(-5);
    });
  });

  describe("caseIsVisible", () => {
    it("should return true if case is within graph bounds", () => {
      expect(graph.caseIsVisible("2")).toBe(true);
    });

    it("should return false if case is outside graph bounds", () => {
      expect(graph.caseIsVisible("3")).toBe(false);
    });

    it("should return false if case is outside time range", () => {
      expect(graph.caseIsVisible("4")).toBe(false);
      expect(graph.caseIsVisible("5")).toBe(false);
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
      }, 3000);
    });
  });
});
