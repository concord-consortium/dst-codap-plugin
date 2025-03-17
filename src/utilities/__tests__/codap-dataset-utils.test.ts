import { codapInterface } from "@concord-consortium/codap-plugin-api";
import { getAvailableDatasets, getDatasetAttributes, saveInteractiveState } from "../codap-dataset-utils";

// Mock the codap-plugin-api
jest.mock("@concord-consortium/codap-plugin-api", () => ({
  codapInterface: {
    sendRequest: jest.fn()
  }
}));

describe("CODAP Dataset Utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAvailableDatasets", () => {
    it("should return an array of dataset names when successful", async () => {
      // Setup mock response
      const mockResponse = {
        success: true,
        values: [
          { name: "Dataset1", title: "First Dataset" },
          { name: "Dataset2", title: "Second Dataset" }
        ]
      };
      
      (codapInterface.sendRequest as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call function
      const result = await getAvailableDatasets();
      
      // Verify results
      expect(result).toEqual(["Dataset1", "Dataset2"]);
      expect(codapInterface.sendRequest).toHaveBeenCalledWith({
        action: "get",
        resource: "dataContextList"
      });
    });

    it("should return an empty array when request fails", async () => {
      // Setup mock response
      const mockResponse = {
        success: false
      };
      
      (codapInterface.sendRequest as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call function
      const result = await getAvailableDatasets();
      
      // Verify results
      expect(result).toEqual([]);
      expect(codapInterface.sendRequest).toHaveBeenCalled();
    });
  });

  describe("getDatasetAttributes", () => {
    it("should return an array of attribute names when successful", async () => {
      // Setup mock response
      const mockResponse = {
        success: true,
        values: [
          { name: "Latitude", description: "Latitude value" },
          { name: "Longitude", description: "Longitude value" },
          { name: "Date", description: "Date value" }
        ]
      };
      
      (codapInterface.sendRequest as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call function
      const result = await getDatasetAttributes("TestDataset");
      
      // Verify results
      expect(result).toEqual(["Latitude", "Longitude", "Date"]);
      expect(codapInterface.sendRequest).toHaveBeenCalledWith({
        action: "get",
        resource: "dataContext[TestDataset].collection[*].attribute"
      });
    });

    it("should return an empty array when request fails", async () => {
      // Setup mock response
      const mockResponse = {
        success: false
      };
      
      (codapInterface.sendRequest as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call function
      const result = await getDatasetAttributes("TestDataset");
      
      // Verify results
      expect(result).toEqual([]);
      expect(codapInterface.sendRequest).toHaveBeenCalled();
    });
  });

  describe("saveInteractiveState", () => {
    it("should call sendRequest with the provided state", async () => {
      // Setup mock response
      const mockResponse = { success: true };
      (codapInterface.sendRequest as jest.Mock).mockResolvedValue(mockResponse);
      
      // Create test state
      const testState = {
        datasetConfig: {
          dataContextName: "TestDataset",
          latitudeAttribute: "Latitude",
          longitudeAttribute: "Longitude",
          dateAttribute: "Date"
        }
      };
      
      // Call function
      await saveInteractiveState(testState);
      
      // Verify results
      expect(codapInterface.sendRequest).toHaveBeenCalledWith({
        action: "update",
        resource: "interactiveState",
        values: testState
      });
    });
  });
}); 
