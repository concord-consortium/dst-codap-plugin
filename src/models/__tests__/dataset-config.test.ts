import { getSnapshot } from "mobx-state-tree";
import { DatasetConfiguration } from "../dataset-config";

describe("DatasetConfiguration Model", () => {
  let datasetConfig: any;

  beforeEach(() => {
    // Create a fresh instance before each test
    datasetConfig = DatasetConfiguration.create();
  });

  it("should have default values", () => {
    expect(datasetConfig.dataContextName).toBeUndefined();
    expect(datasetConfig.latitudeAttribute).toBeUndefined();
    expect(datasetConfig.longitudeAttribute).toBeUndefined();
    expect(datasetConfig.dateAttribute).toBeUndefined();
    expect(datasetConfig.colorAttribute).toBeUndefined();
    expect(datasetConfig.sizeAttribute).toBeUndefined();
    expect(datasetConfig.dateFormat).toBe("auto");
    expect(datasetConfig.isConfigured).toBe(false);
  });

  it("should set and get dataContextName", () => {
    datasetConfig.setDataContext("TestDataset");
    expect(datasetConfig.dataContextName).toBe("TestDataset");
  });

  it("should set and get attribute mappings", () => {
    datasetConfig.setLatitudeAttribute("lat");
    datasetConfig.setLongitudeAttribute("long");
    datasetConfig.setDateAttribute("date");
    datasetConfig.setColorAttribute("color");
    datasetConfig.setSizeAttribute("size");
    
    expect(datasetConfig.latitudeAttribute).toBe("lat");
    expect(datasetConfig.longitudeAttribute).toBe("long");
    expect(datasetConfig.dateAttribute).toBe("date");
    expect(datasetConfig.colorAttribute).toBe("color");
    expect(datasetConfig.sizeAttribute).toBe("size");
  });

  it("should set and get dateFormat", () => {
    datasetConfig.setDateFormat("yyyy-MM-dd");
    expect(datasetConfig.dateFormat).toBe("yyyy-MM-dd");
  });

  it("should set and get isConfigured", () => {
    datasetConfig.setIsConfigured(true);
    expect(datasetConfig.isConfigured).toBe(true);
  });

  it("should reset attribute mappings", () => {
    // Set some attributes
    datasetConfig.setLatitudeAttribute("lat");
    datasetConfig.setLongitudeAttribute("long");
    datasetConfig.setDateAttribute("date");
    
    // Reset them
    datasetConfig.resetAttributeMappings();
    
    // Verify they're reset
    expect(datasetConfig.latitudeAttribute).toBeUndefined();
    expect(datasetConfig.longitudeAttribute).toBeUndefined();
    expect(datasetConfig.dateAttribute).toBeUndefined();
  });

  it("should validate required attributes", () => {
    // Initially not valid because required attributes are missing
    expect(datasetConfig.isValid).toBe(false);
    
    // Set required attributes
    datasetConfig.setDataContext("TestDataset");
    datasetConfig.setLatitudeAttribute("lat");
    datasetConfig.setLongitudeAttribute("long");
    datasetConfig.setDateAttribute("date");
    
    // Now it should be valid
    expect(datasetConfig.isValid).toBe(true);
    
    // Missing any required attribute makes it invalid
    datasetConfig.setLatitudeAttribute(undefined);
    expect(datasetConfig.isValid).toBe(false);
  });

  it("should create a snapshot for persistence", () => {
    datasetConfig.setDataContext("TestDataset");
    datasetConfig.setLatitudeAttribute("lat");
    datasetConfig.setLongitudeAttribute("long");
    datasetConfig.setDateAttribute("date");
    datasetConfig.setIsConfigured(true);
    
    const snapshot = getSnapshot(datasetConfig);
    
    expect(snapshot).toEqual({
      dataContextName: "TestDataset",
      latitudeAttribute: "lat",
      longitudeAttribute: "long",
      dateAttribute: "date",
      colorAttribute: undefined,
      sizeAttribute: undefined,
      dateFormat: "auto",
      isConfigured: true
    });
  });

  it("should create from a snapshot", () => {
    const snapshot = {
      dataContextName: "TestDataset",
      latitudeAttribute: "lat",
      longitudeAttribute: "long",
      dateAttribute: "date",
      colorAttribute: "color",
      sizeAttribute: "size",
      dateFormat: "MM/dd/yyyy",
      isConfigured: true
    };
    
    const newConfig = DatasetConfiguration.create(snapshot);
    
    expect(newConfig.dataContextName).toBe("TestDataset");
    expect(newConfig.latitudeAttribute).toBe("lat");
    expect(newConfig.longitudeAttribute).toBe("long");
    expect(newConfig.dateAttribute).toBe("date");
    expect(newConfig.colorAttribute).toBe("color");
    expect(newConfig.sizeAttribute).toBe("size");
    expect(newConfig.dateFormat).toBe("MM/dd/yyyy");
    expect(newConfig.isConfigured).toBe(true);
  });
}); 
