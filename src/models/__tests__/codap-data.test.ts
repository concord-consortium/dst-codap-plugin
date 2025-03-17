import { codapData } from "../codap-data";
import { datasetConfig } from "../dataset-config";
import { dstContainer } from "../dst-container";

// Mock the dstContainer
jest.mock("../dst-container", () => ({
  dstContainer: {
    dataSet: {
      getCollectionByName: jest.fn(),
      getAttributeByName: jest.fn(),
      getValue: jest.fn(),
      isCaseSelected: jest.fn()
    }
  }
}));

describe("CodapData Model", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset datasetConfig
    Object.assign(datasetConfig, {
      dataContextName: "TestDataset",
      latitudeAttribute: "Lat",
      longitudeAttribute: "Long",
      dateAttribute: "Date",
      colorAttribute: "Color",
      sizeAttribute: "Size",
      dateFormat: "auto",
      isConfigured: true
    });
    
    // Mock a collection with case IDs
    (dstContainer.dataSet.getCollectionByName as jest.Mock).mockReturnValue({
      caseIds: ["case1", "case2", "case3"]
    });
    
    // Mock attribute retrieval
    (dstContainer.dataSet.getAttributeByName as jest.Mock).mockImplementation((name) => {
      const attributeMap: Record<string, any> = {
        "Lat": { id: "lat-attr" },
        "Long": { id: "long-attr" },
        "Date": { id: "date-attr" },
        "Color": { id: "color-attr" },
        "Size": { id: "size-attr" }
      };
      return attributeMap[name];
    });
    
    // Mock value retrieval
    (dstContainer.dataSet.getValue as jest.Mock).mockImplementation((caseId, attributeId) => {
      const valueMap: Record<string, Record<string, any>> = {
        "case1": {
          "lat-attr": 35.123,
          "long-attr": -78.456,
          "date-attr": "2022-01-15",
          "color-attr": "red",
          "size-attr": 5
        },
        "case2": {
          "lat-attr": 36.789,
          "long-attr": -79.012,
          "date-attr": "2022-02-20",
          "color-attr": "blue",
          "size-attr": 10
        },
        "case3": {
          "lat-attr": 37.345,
          "long-attr": -80.678,
          "date-attr": "2022-03-25",
          "color-attr": "green",
          "size-attr": 15
        }
      };
      return valueMap[caseId]?.[attributeId];
    });
    
    // Mock selection state
    (dstContainer.dataSet.isCaseSelected as jest.Mock).mockImplementation((caseId) => {
      return caseId === "case2"; // Only case2 is selected
    });
  });

  describe("Basic Data Access", () => {
    it("should return case IDs", () => {
      expect(codapData.caseIds).toEqual(["case1", "case2", "case3"]);
    });
    
    it("should access attribute values", () => {
      expect(codapData.getAttributeValue("Lat", "case1")).toBe(35.123);
      expect(codapData.getAttributeNumericValue("Long", "case2")).toBe(-79.012);
    });
  });

  describe("Configured Attribute Access", () => {
    it("should get latitude using configured attribute", () => {
      expect(codapData.getLatitude("case1")).toBe(35.123);
    });
    
    it("should get longitude using configured attribute", () => {
      expect(codapData.getLongitude("case2")).toBe(-79.012);
    });
    
    it("should parse date using configured attribute", () => {
      // Implementation will depend on how we parse dates
      const date = codapData.getCaseDate("case3");
      expect(date).toBeDefined();
    });
  });

  describe("Selection Management", () => {
    it("should check if a case is selected", () => {
      expect(codapData.isSelected("case1")).toBe(false);
      expect(codapData.isSelected("case2")).toBe(true);
    });
    
    it("should use marquee selection when active", () => {
      codapData.setMarqueeSelection(["case1", "case3"]);
      expect(codapData.isSelected("case1")).toBe(true);
      expect(codapData.isSelected("case2")).toBe(false);
      expect(codapData.isSelected("case3")).toBe(true);
    });
    
    it("should clear marquee selection", () => {
      codapData.setMarqueeSelection(["case1"]);
      codapData.setMarqueeSelection();
      expect(codapData.isSelected("case1")).toBe(false);
      expect(codapData.isSelected("case2")).toBe(true);
    });
  });

  describe("Date Range Management", () => {
    it("should set absolute date range", () => {
      const minDate = new Date("2022-01-01").getTime();
      const maxDate = new Date("2022-12-31").getTime();
      
      codapData.setAbsoluteDateRange(minDate, maxDate);
      
      expect(codapData.absoluteMinDate).toBe(minDate);
      expect(codapData.absoluteMaxDate).toBe(maxDate);
      expect(codapData.absoluteDateRange).toBe(maxDate - minDate);
    });
  });
}); 