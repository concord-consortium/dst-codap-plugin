import { MapBoundsManager, Bounds } from '../map-bounds-manager';
import { graph } from '../../models/graph';
import { codapInterface } from '../codap-interface';

// Mock CODAP interface
jest.mock('../codap-interface', () => ({
  codapInterface: {
    sendRequest: jest.fn()
  }
}));

// Define the shape of our mocked graph
interface MockGraph {
  absoluteMinLatitude: number;
  absoluteMaxLatitude: number;
  absoluteMinLongitude: number;
  absoluteMaxLongitude: number;
  minLatitude: number;
  maxLatitude: number;
  minLongitude: number;
  maxLongitude: number;
  homeMinLatitude: number;
  homeMaxLatitude: number;
  homeMinLongitude: number;
  homeMaxLongitude: number;
  animateTo: jest.Mock;
}

// Mock the graph model
jest.mock('../../models/graph', () => ({
  graph: {
    absoluteMinLatitude: 0,
    absoluteMaxLatitude: 0,
    absoluteMinLongitude: 0,
    absoluteMaxLongitude: 0,
    minLatitude: 0,
    maxLatitude: 0,
    minLongitude: 0,
    maxLongitude: 0,
    homeMinLatitude: 0,
    homeMaxLatitude: 0,
    homeMinLongitude: 0,
    homeMaxLongitude: 0,
    animateTo: jest.fn()
  } as MockGraph
}));

describe('MapBoundsManager', () => {
  let mapBoundsManager: MapBoundsManager;
  let mockGraph: MockGraph;

  beforeEach(() => {
    mapBoundsManager = new MapBoundsManager();
    mockGraph = graph as unknown as MockGraph;
    // Reset all graph properties before each test
    Object.keys(mockGraph).forEach(key => {
      if (typeof mockGraph[key as keyof MockGraph] === 'number') {
        (mockGraph[key as keyof MockGraph] as number) = 0;
      }
    });
    mockGraph.animateTo.mockClear();
    (codapInterface.sendRequest as jest.Mock).mockClear();
  });

  describe('setWorldMapBounds', () => {
    it('should set world map bounds correctly', () => {
      mapBoundsManager.setWorldMapBounds();

      // Check absolute bounds
      expect(mockGraph.absoluteMinLatitude).toBe(-90);
      expect(mockGraph.absoluteMaxLatitude).toBe(90);
      expect(mockGraph.absoluteMinLongitude).toBe(-180);
      expect(mockGraph.absoluteMaxLongitude).toBe(180);

      // Check visible bounds (slightly inset from absolute bounds)
      expect(mockGraph.minLatitude).toBe(-85);
      expect(mockGraph.maxLatitude).toBe(85);
      expect(mockGraph.minLongitude).toBe(-175);
      expect(mockGraph.maxLongitude).toBe(175);

      // Check home bounds (should match visible bounds)
      expect(mockGraph.homeMinLatitude).toBe(-85);
      expect(mockGraph.homeMaxLatitude).toBe(85);
      expect(mockGraph.homeMinLongitude).toBe(-175);
      expect(mockGraph.homeMaxLongitude).toBe(175);
    });
  });

  describe('animateToDataBounds', () => {
    it('should animate to provided bounds with margin', () => {
      const bounds: Bounds = {
        minLat: 10,
        maxLat: 20,
        minLong: 30,
        maxLong: 40
      };

      mapBoundsManager.animateToDataBounds(bounds);

      // Check that animateTo was called with margins
      expect(mockGraph.animateTo).toHaveBeenCalledWith({
        minLatitude: expect.any(Number),
        maxLatitude: expect.any(Number),
        minLongitude: expect.any(Number),
        maxLongitude: expect.any(Number)
      });

      // Verify margins were added (50% margin)
      const call = mockGraph.animateTo.mock.calls[0][0];
      const latSpan = bounds.maxLat - bounds.minLat;
      const longSpan = bounds.maxLong - bounds.minLong;
      
      expect(call.maxLatitude - call.minLatitude).toBeCloseTo(latSpan * 1.5);
      expect(call.maxLongitude - call.minLongitude).toBeCloseTo(longSpan * 1.5);
    });

    it('should clamp bounds to valid coordinate ranges', () => {
      const bounds: Bounds = {
        minLat: -100, // Below valid range
        maxLat: 100,  // Above valid range
        minLong: -200, // Below valid range
        maxLong: 200   // Above valid range
      };

      mapBoundsManager.animateToDataBounds(bounds);

      const call = mockGraph.animateTo.mock.calls[0][0];
      
      expect(call.minLatitude).toBeGreaterThanOrEqual(-90);
      expect(call.maxLatitude).toBeLessThanOrEqual(90);
      expect(call.minLongitude).toBeGreaterThanOrEqual(-180);
      expect(call.maxLongitude).toBeLessThanOrEqual(180);
    });
  });

  describe('tryGetAttributeStats', () => {
    const mockDataContext = 'testContext';
    const mockLatAttr = 'latitude';
    const mockLongAttr = 'longitude';

    beforeEach(() => {
      // Reset mock implementation
      (codapInterface.sendRequest as jest.Mock).mockReset();
    });

    it('should return bounds when stats are available', async () => {
      // Mock successful stats response
      (codapInterface.sendRequest as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: {
          attrs: [
            {
              name: mockLatAttr,
              stats: { min: 10, max: 20 }
            },
            {
              name: mockLongAttr,
              stats: { min: 30, max: 40 }
            }
          ]
        }
      });

      const result = await mapBoundsManager.tryGetAttributeStats(mockDataContext, mockLatAttr, mockLongAttr);

      expect(result).toEqual({
        minLat: 10,
        maxLat: 20,
        minLong: 30,
        maxLong: 40
      });

      expect(codapInterface.sendRequest).toHaveBeenCalledWith({
        action: 'get',
        resource: `dataContext[${mockDataContext}].collection[Cases]`
      });
    });

    it('should return null when stats are not available', async () => {
      // Mock response without stats
      (codapInterface.sendRequest as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: {
          attrs: [
            { name: mockLatAttr },
            { name: mockLongAttr }
          ]
        }
      });

      const result = await mapBoundsManager.tryGetAttributeStats(mockDataContext, mockLatAttr, mockLongAttr);

      expect(result).toBeNull();
    });

    it('should return null when API call fails', async () => {
      // Mock failed API response
      (codapInterface.sendRequest as jest.Mock).mockResolvedValueOnce({
        success: false
      });

      const result = await mapBoundsManager.tryGetAttributeStats(mockDataContext, mockLatAttr, mockLongAttr);

      expect(result).toBeNull();
    });

    it('should handle missing attributes gracefully', async () => {
      // Mock response with missing attributes
      (codapInterface.sendRequest as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: {
          attrs: [
            { name: 'other_attr' }
          ]
        }
      });

      const result = await mapBoundsManager.tryGetAttributeStats(mockDataContext, mockLatAttr, mockLongAttr);

      expect(result).toBeNull();
    });
  });

  describe('getSampledBounds', () => {
    const mockDataContext = 'testContext';
    const mockLatAttr = 'latitude';
    const mockLongAttr = 'longitude';
    const defaultSampleSize = 200;

    beforeEach(() => {
      (codapInterface.sendRequest as jest.Mock).mockReset();
    });

    it('should return bounds from sampled cases', async () => {
      // Mock successful sample response
      (codapInterface.sendRequest as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: [
          { values: { [mockLatAttr]: 10, [mockLongAttr]: 30 } },
          { values: { [mockLatAttr]: 20, [mockLongAttr]: 40 } },
          { values: { [mockLatAttr]: 15, [mockLongAttr]: 35 } }
        ]
      });

      const result = await mapBoundsManager.getSampledBounds(
        mockDataContext,
        mockLatAttr,
        mockLongAttr
      );

      expect(result).toEqual({
        minLat: 10,
        maxLat: 20,
        minLong: 30,
        maxLong: 40
      });

      expect(codapInterface.sendRequest).toHaveBeenCalledWith({
        action: 'get',
        resource: `dataContext[${mockDataContext}].collection[Cases].caseCount[0:${defaultSampleSize}]`
      });
    });

    it('should handle custom sample size', async () => {
      const customSampleSize = 100;
      
      (codapInterface.sendRequest as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: [
          { values: { [mockLatAttr]: 10, [mockLongAttr]: 30 } }
        ]
      });

      await mapBoundsManager.getSampledBounds(
        mockDataContext,
        mockLatAttr,
        mockLongAttr,
        customSampleSize
      );

      expect(codapInterface.sendRequest).toHaveBeenCalledWith({
        action: 'get',
        resource: `dataContext[${mockDataContext}].collection[Cases].caseCount[0:${customSampleSize}]`
      });
    });

    it('should return null when no valid coordinates found', async () => {
      // Mock response with invalid coordinates
      (codapInterface.sendRequest as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: [
          { values: { [mockLatAttr]: 'invalid', [mockLongAttr]: 'invalid' } },
          { values: { [mockLatAttr]: null, [mockLongAttr]: undefined } }
        ]
      });

      const result = await mapBoundsManager.getSampledBounds(
        mockDataContext,
        mockLatAttr,
        mockLongAttr
      );

      expect(result).toBeNull();
    });

    it('should return null when API call fails', async () => {
      (codapInterface.sendRequest as jest.Mock).mockResolvedValueOnce({
        success: false
      });

      const result = await mapBoundsManager.getSampledBounds(
        mockDataContext,
        mockLatAttr,
        mockLongAttr
      );

      expect(result).toBeNull();
    });

    it('should handle empty sample response', async () => {
      (codapInterface.sendRequest as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: []
      });

      const result = await mapBoundsManager.getSampledBounds(
        mockDataContext,
        mockLatAttr,
        mockLongAttr
      );

      expect(result).toBeNull();
    });

    it('should handle missing attributes in cases', async () => {
      (codapInterface.sendRequest as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: [
          { values: { otherAttr: 42 } },
          { values: {} }
        ]
      });

      const result = await mapBoundsManager.getSampledBounds(
        mockDataContext,
        mockLatAttr,
        mockLongAttr
      );

      expect(result).toBeNull();
    });
  });

  describe('updateMapBounds', () => {
    const mockDataContext = 'testContext';
    const mockLatAttr = 'latitude';
    const mockLongAttr = 'longitude';

    beforeEach(() => {
      (codapInterface.sendRequest as jest.Mock).mockReset();
    });

    it('should set world bounds immediately and then update with stats when available', async () => {
      // Mock successful stats response
      (codapInterface.sendRequest as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: {
          attrs: [
            {
              name: mockLatAttr,
              stats: { min: 10, max: 20 }
            },
            {
              name: mockLongAttr,
              stats: { min: 30, max: 40 }
            }
          ]
        }
      });

      await mapBoundsManager.updateMapBounds(mockDataContext, mockLatAttr, mockLongAttr);

      // Verify world bounds were set first
      expect(mockGraph.absoluteMinLatitude).toBe(-90);
      expect(mockGraph.absoluteMaxLatitude).toBe(90);
      expect(mockGraph.absoluteMinLongitude).toBe(-180);
      expect(mockGraph.absoluteMaxLongitude).toBe(180);

      // Verify animation to data bounds was called
      expect(mockGraph.animateTo).toHaveBeenCalled();
      const call = mockGraph.animateTo.mock.calls[0][0];
      expect(call.minLatitude).toBeGreaterThan(0); // Should be around 10 with margin
      expect(call.maxLatitude).toBeLessThan(30);   // Should be around 20 with margin
      expect(call.minLongitude).toBeGreaterThan(20); // Should be around 30 with margin
      expect(call.maxLongitude).toBeLessThan(50);    // Should be around 40 with margin
    });

    it('should fall back to sampling when stats are not available', async () => {
      // Mock failed stats response
      (codapInterface.sendRequest as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: {
          attrs: [
            { name: mockLatAttr },
            { name: mockLongAttr }
          ]
        }
      });

      // Mock successful sampling response
      (codapInterface.sendRequest as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: [
          { values: { [mockLatAttr]: 15, [mockLongAttr]: 35 } }
        ]
      });

      await mapBoundsManager.updateMapBounds(mockDataContext, mockLatAttr, mockLongAttr);

      // Verify both strategies were attempted
      expect(codapInterface.sendRequest).toHaveBeenCalledTimes(2);

      // Verify animation was called with sampled bounds
      expect(mockGraph.animateTo).toHaveBeenCalled();
    });

    it('should keep world bounds when no valid bounds can be found', async () => {
      // Mock failed responses for both strategies
      (codapInterface.sendRequest as jest.Mock)
        .mockResolvedValueOnce({ success: false })
        .mockResolvedValueOnce({ success: false });

      await mapBoundsManager.updateMapBounds(mockDataContext, mockLatAttr, mockLongAttr);

      // Verify world bounds were set
      expect(mockGraph.minLatitude).toBe(-85);
      expect(mockGraph.maxLatitude).toBe(85);
      expect(mockGraph.minLongitude).toBe(-175);
      expect(mockGraph.maxLongitude).toBe(175);

      // Verify no animation was attempted
      expect(mockGraph.animateTo).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      // Mock error in stats request
      (codapInterface.sendRequest as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      await mapBoundsManager.updateMapBounds(mockDataContext, mockLatAttr, mockLongAttr);

      // Verify world bounds were set and maintained
      expect(mockGraph.minLatitude).toBe(-85);
      expect(mockGraph.maxLatitude).toBe(85);
      expect(mockGraph.minLongitude).toBe(-175);
      expect(mockGraph.maxLongitude).toBe(175);

      // Verify no animation was attempted
      expect(mockGraph.animateTo).not.toHaveBeenCalled();
    });
  });
}); 