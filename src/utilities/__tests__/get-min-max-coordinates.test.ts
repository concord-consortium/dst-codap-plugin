import { getMinMaxCoordinates, executeFormulaSearch } from "../get-min-max-coordinates";
import { codapInterface } from "@concord-consortium/codap-plugin-api";
import { datasetConfig } from "../../models/dataset-config";

// Mock dependencies
jest.mock("@concord-consortium/codap-plugin-api", () => ({
  codapInterface: {
    sendRequest: jest.fn()
  }
}));

jest.mock("../../models/dataset-config", () => ({
  datasetConfig: {
    dataContextName: "TestData",
    latitudeAttribute: "latitude",
    longitudeAttribute: "longitude"
  }
}));

const mockSendRequest = codapInterface.sendRequest as jest.MockedFunction<typeof codapInterface.sendRequest>;

describe("get-min-max-coordinates", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getMinMaxCoordinates", () => {
    it("should return null if no data context is configured", async () => {
      // Temporarily override the mock
      jest.spyOn(datasetConfig, "dataContextName", "get").mockReturnValueOnce(undefined);
      
      const result = await getMinMaxCoordinates();
      expect(result).toBeNull();
      expect(mockSendRequest).not.toHaveBeenCalled();
    });

    it("should return null if data context cannot be retrieved", async () => {
      mockSendRequest.mockResolvedValueOnce({
        success: false
      });
      
      const result = await getMinMaxCoordinates();
      expect(result).toBeNull();
      expect(mockSendRequest).toHaveBeenCalledTimes(1);
    });

    it("should successfully retrieve coordinate bounds using formula search", async () => {
      // Mock successful responses for each API call
      // 1. Data context info
      mockSendRequest.mockResolvedValueOnce({
        success: true,
        values: { name: "TestData" }
      });
      
      // 2. Collections
      mockSendRequest.mockResolvedValueOnce({
        success: true,
        values: [{ name: "Cases" }]
      });
      
      // 3. Attributes
      mockSendRequest.mockResolvedValueOnce({
        success: true,
        values: [
          { name: "latitude" },
          { name: "longitude" }
        ]
      });
      
      // 4. Min latitude
      mockSendRequest.mockResolvedValueOnce({
        success: true,
        values: [{ values: { latitude: 32.1 } }]
      });
      
      // 5. Max latitude
      mockSendRequest.mockResolvedValueOnce({
        success: true,
        values: [{ values: { latitude: 42.5 } }]
      });
      
      // 6. Min longitude
      mockSendRequest.mockResolvedValueOnce({
        success: true,
        values: [{ values: { longitude: -124.3 } }]
      });
      
      // 7. Max longitude
      mockSendRequest.mockResolvedValueOnce({
        success: true,
        values: [{ values: { longitude: -114.7 } }]
      });
      
      const result = await getMinMaxCoordinates();
      
      expect(result).not.toBeNull();
      expect(result?.success).toBe(true);
      expect(result?.minLat).toBe(32.1);
      expect(result?.maxLat).toBe(42.5);
      expect(result?.minLong).toBe(-124.3);
      expect(result?.maxLong).toBe(-114.7);
      
      // Verify all API calls were made
      expect(mockSendRequest).toHaveBeenCalledTimes(7);
      
      // Verify formula search calls
      expect(mockSendRequest).toHaveBeenCalledWith({
        action: "get",
        resource: "dataContext[TestData].collection[Cases].caseFormulaSearch[latitude=min(latitude)]"
      });
      
      expect(mockSendRequest).toHaveBeenCalledWith({
        action: "get",
        resource: "dataContext[TestData].collection[Cases].caseFormulaSearch[latitude=max(latitude)]"
      });
      
      expect(mockSendRequest).toHaveBeenCalledWith({
        action: "get",
        resource: "dataContext[TestData].collection[Cases].caseFormulaSearch[longitude=min(longitude)]"
      });
      
      expect(mockSendRequest).toHaveBeenCalledWith({
        action: "get",
        resource: "dataContext[TestData].collection[Cases].caseFormulaSearch[longitude=max(longitude)]"
      });
    });
  });

  describe("executeFormulaSearch", () => {
    it("should execute a formula search with the correct parameters", async () => {
      mockSendRequest.mockResolvedValueOnce({
        success: true,
        values: [{ result: 42 }]
      });
      
      const result = await executeFormulaSearch("TestData", "Cases", "latitude=min(latitude)");
      
      expect(result.success).toBe(true);
      expect(mockSendRequest).toHaveBeenCalledWith({
        action: "get",
        resource: "dataContext[TestData].collection[Cases].caseFormulaSearch[latitude=min(latitude)]"
      });
    });
    
    it("should handle errors gracefully", async () => {
      mockSendRequest.mockRejectedValueOnce(new Error("API Error"));
      
      const result = await executeFormulaSearch("TestData", "Cases", "latitude=min(latitude)");
      
      expect(result.success).toBe(false);
      expect(mockSendRequest).toHaveBeenCalledTimes(1);
    });
  });
}); 