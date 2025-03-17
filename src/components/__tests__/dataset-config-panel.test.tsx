import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DatasetConfigPanel } from "../dataset-config-panel";
import { datasetConfig } from "../../models/dataset-config";
import * as codapDatasetUtils from "../../utilities/codap-dataset-utils";
import { ChakraProvider } from "@chakra-ui/react";

// Mock the CODAP dataset utilities
jest.mock("../../utilities/codap-dataset-utils", () => ({
  getAvailableDatasets: jest.fn(),
  getDatasetAttributes: jest.fn(),
  saveInteractiveState: jest.fn(),
  loadConfiguredData: jest.fn()
}));

// Mock the datasetConfig
jest.mock("../../models/dataset-config", () => ({
  datasetConfig: {
    dataContextName: null,
    latitudeAttribute: null,
    longitudeAttribute: null,
    dateAttribute: null,
    colorAttribute: null,
    sizeAttribute: null,
    dateFormat: "auto",
    isConfigured: false,
    isValid: false,
    setDataContext: jest.fn((name) => {
      // Update the mock state as well
      mockedDatasetConfig.dataContextName = name;
    }),
    setLatitudeAttribute: jest.fn((attr) => {
      // Update the mock state
      mockedDatasetConfig.latitudeAttribute = attr;
    }),
    setLongitudeAttribute: jest.fn((attr) => {
      // Update the mock state
      mockedDatasetConfig.longitudeAttribute = attr;
    }),
    setDateAttribute: jest.fn((attr) => {
      // Update the mock state
      mockedDatasetConfig.dateAttribute = attr;
    }),
    setColorAttribute: jest.fn(),
    setSizeAttribute: jest.fn(),
    setDateFormat: jest.fn(),
    setIsConfigured: jest.fn(),
    resetAttributeMappings: jest.fn()
  }
}));

// Create a local reference to the mocked datasetConfig for easier state updates
const mockedDatasetConfig = datasetConfig;

// Mock UI model
jest.mock("../../models/ui", () => ({
  ui: {
    setShowDatasetConfig: jest.fn()
  }
}));

describe("DatasetConfigPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset dataset config for each test
    Object.assign(mockedDatasetConfig, {
      dataContextName: null,
      latitudeAttribute: null,
      longitudeAttribute: null,
      dateAttribute: null,
      colorAttribute: null,
      sizeAttribute: null,
      isValid: false
    });
    
    // Mock the dataset and attribute retrieval
    (codapDatasetUtils.getAvailableDatasets as jest.Mock).mockResolvedValue([
      "Dataset1", "Dataset2"
    ]);
    
    (codapDatasetUtils.getDatasetAttributes as jest.Mock).mockResolvedValue([
      "Latitude", "Longitude", "Date", "Color", "Size"
    ]);
  });

  it("should render the dataset selection dropdown", async () => {
    render(
      <ChakraProvider>
        <DatasetConfigPanel />
      </ChakraProvider>
    );
    
    // Wait for datasets to load
    await waitFor(() => {
      expect(screen.getByText("Configure Dataset")).toBeInTheDocument();
    });
    
    // Check dataset dropdown exists
    expect(screen.getByLabelText(/Select Dataset/i)).toBeInTheDocument();
    
    // Verify datasets are loaded
    await waitFor(() => {
      expect(screen.getByText("Dataset1")).toBeInTheDocument();
      expect(screen.getByText("Dataset2")).toBeInTheDocument();
    });
  });

  it("should show attribute mapping controls after dataset selection", async () => {
    const { rerender } = render(
      <ChakraProvider>
        <DatasetConfigPanel />
      </ChakraProvider>
    );
    
    // Wait for datasets to load
    await waitFor(() => {
      expect(screen.getByLabelText(/Select Dataset/i)).toBeInTheDocument();
    });
    
    // Select a dataset
    fireEvent.change(screen.getByLabelText(/Select Dataset/i), {
      target: { value: "Dataset1" }
    });
    
    // Verify dataset selection is called
    expect(datasetConfig.setDataContext).toHaveBeenCalledWith("Dataset1");
    
    // Re-render with the updated dataContextName
    rerender(
      <ChakraProvider>
        <DatasetConfigPanel />
      </ChakraProvider>
    );
    
    // Verify attribute selectors are shown
    await waitFor(() => {
      expect(screen.getByTestId("latitude-select")).toBeInTheDocument();
      expect(screen.getByTestId("longitude-select")).toBeInTheDocument();
      expect(screen.getByTestId("date-select")).toBeInTheDocument();
    });
  });

  it("should handle attribute selection", async () => {
    // Define a test wrapper component to properly test the attribute selection
    function TestWrapper() {
      // Set up dataConfig context
      React.useEffect(() => {
        mockedDatasetConfig.dataContextName = "Dataset1";
      }, []);
      
      return (
        <ChakraProvider>
          <DatasetConfigPanel />
        </ChakraProvider>
      );
    }
    
    render(<TestWrapper />);
    
    // Wait for attributes to load
    await waitFor(() => {
      expect(screen.getByTestId("latitude-select")).toBeInTheDocument();
    });
    
    // Reset mocks after the initial render to track only the changes we make
    jest.clearAllMocks();
    
    // Select latitude attribute
    const latitudeSelect = screen.getByTestId("latitude-select");
    fireEvent.change(latitudeSelect, { target: { value: "Latitude" } });
    
    // Select longitude attribute
    const longitudeSelect = screen.getByTestId("longitude-select");
    fireEvent.change(longitudeSelect, { target: { value: "Longitude" } });
    
    // Select date attribute
    const dateSelect = screen.getByTestId("date-select");
    fireEvent.change(dateSelect, { target: { value: "Date" } });
    
    // Verify the calls were made
    await waitFor(() => {
      expect(datasetConfig.setLatitudeAttribute).toHaveBeenCalled();
      expect(datasetConfig.setLongitudeAttribute).toHaveBeenCalled();
      expect(datasetConfig.setDateAttribute).toHaveBeenCalled();
    });
  });

  it("should enable apply button when configuration is valid", async () => {
    // Set up datasetConfig for this test
    Object.assign(mockedDatasetConfig, {
      dataContextName: "Dataset1",
      isValid: true
    });
    
    render(
      <ChakraProvider>
        <DatasetConfigPanel />
      </ChakraProvider>
    );
    
    // Wait for components to load
    await waitFor(() => {
      expect(screen.getByText("Apply Configuration")).toBeInTheDocument();
    });
    
    // Verify button is enabled
    const applyButton = screen.getByText("Apply Configuration");
    expect(applyButton).not.toBeDisabled();
    
    // Click apply button
    fireEvent.click(applyButton);
    
    // Verify actions are called
    expect(datasetConfig.setIsConfigured).toHaveBeenCalledWith(true);
    expect(codapDatasetUtils.saveInteractiveState).toHaveBeenCalled();
  });

  it("should auto-detect attributes", async () => {
    // Mock getDatasetAttributes to trigger auto-detection
    (codapDatasetUtils.getDatasetAttributes as jest.Mock).mockImplementation(async () => {
      const attrs = ["Latitude", "Longitude", "Date", "Color", "Size"];
      // Auto-detection happens in the component
      return attrs;
    });
    
    render(
      <ChakraProvider>
        <DatasetConfigPanel />
      </ChakraProvider>
    );
    
    // Wait for datasets to load
    await waitFor(() => {
      expect(screen.getByLabelText(/Select Dataset/i)).toBeInTheDocument();
    });
    
    // Select a dataset
    fireEvent.change(screen.getByLabelText(/Select Dataset/i), {
      target: { value: "Dataset1" }
    });
    
    // Wait for attribute fetching to complete
    await waitFor(() => {
      expect(codapDatasetUtils.getDatasetAttributes).toHaveBeenCalled();
    });
    
    // Verify auto-detection occurred
    expect(datasetConfig.setLatitudeAttribute).toHaveBeenCalledWith("Latitude");
    expect(datasetConfig.setLongitudeAttribute).toHaveBeenCalledWith("Longitude");
    expect(datasetConfig.setDateAttribute).toHaveBeenCalledWith("Date");
  });
}); 
