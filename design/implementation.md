# Implementation Plan: Arbitrary Dataset Support for DST-CODAP Plugin

## Overview

This implementation plan provides a detailed roadmap for extending the DST-CODAP plugin to support arbitrary datasets. It breaks down the technical tasks, defines the specific implementation approach, and outlines the changes required in each component of the application.

## Component Architecture Changes

### 1. Configuration Model

Create a new configuration model to store dataset and attribute mapping settings:

```typescript
// src/models/dataset-config.ts
import { types } from "mobx-state-tree";

export const DatasetConfiguration = types
  .model("DatasetConfiguration", {
    dataContextName: types.maybe(types.string),
    latitudeAttribute: types.maybe(types.string),
    longitudeAttribute: types.maybe(types.string),
    dateAttribute: types.maybe(types.string),
    colorAttribute: types.maybe(types.string),
    sizeAttribute: types.maybe(types.string),
    dateFormat: types.optional(types.string, "auto"),
    isConfigured: types.optional(types.boolean, false)
  })
  .actions(self => ({
    setDataContext(name: string) {
      self.dataContextName = name;
    },
    setLatitudeAttribute(name: string) {
      self.latitudeAttribute = name;
    },
    // Additional setter actions for other attributes
  }));
```

### 2. CODAP Interface Enhancements

Extend the CODAP utilities to support:
- Dataset discovery
- Attribute retrieval
- Configuration persistence

## Implementation Tasks

### Phase 1: Core Configuration System

#### 1.1 Dataset Configuration Model
- Create the dataset configuration model using MobX-State-Tree
- Add methods for loading/saving configuration
- Integrate with CODAP plugin state persistence

#### 1.2 CODAP Dataset Discovery
- Implement methods to query available CODAP datasets
- Add functionality to retrieve attributes from a selected dataset
- Create utilities to validate dataset compatibility

#### 1.3 Configuration UI Components
- Create dataset selector component
- Build attribute mapping interface
- Implement configuration validation and feedback UI

### Phase 2: Data Access Refactoring

#### 2.1 Flexible Data Access Layer
- Replace hardcoded attribute access with configurable mapping
- Create adapter functions for different data types
- Implement coordinate normalization and validation

#### 2.2 Date Parsing and Handling
- Develop flexible date parser supporting multiple formats
- Implement date range detection and normalization
- Create utility to convert various date formats to numeric values for visualization

#### 2.3 Data Validation
- Create validators for geographic coordinates
- Implement date format detection and validation
- Add missing value handling and data sanitization

### Phase 3: Visualization Updates

#### 3.1 Update Point Rendering
- Modify point generation to use mapped attributes
- Update color mapping to work with arbitrary attributes
- Adjust size mapping for different data ranges

#### 3.2 Update Map Plane
- Dynamically adjust map boundaries based on dataset coordinates
- Implement auto-scaling for different geographic ranges
- Add fallback for datasets with unusual geographic distributions

#### 3.3 Update Time Animation
- Adapt time-based animation to work with different date formats
- Implement automatic time range detection
- Create controls for adjusting animation speed based on data density

### Phase 4: Integration and Finalization

#### 4.1 Initialization Flow
- Update plugin initialization to check for and apply saved configuration
- Implement configuration wizard for first-time setup
- Add dataset change detection and handling

#### 4.2 Selection Synchronization
- Update bidirectional selection to work with configured dataset
- Implement case selection mapping for different data structures
- Add robust error handling for selection operations

#### 4.3 Error Handling
- Create user-friendly error messages for common issues
- Implement graceful fallbacks for incompatible data
- Add diagnostic logging for troubleshooting

## Detailed Code Changes

### 1. Update Plugin Initialization

Replace the hardcoded dataset initialization in `src/utilities/codap-utils.ts`:

```typescript
// Current (before changes)
export async function initializeDST() {
  // ... existing code
  getData();
  // ... more existing code
}

// New (after changes)
export async function initializeDST() {
  await initializePlugin({pluginName: kPluginName, version: kVersion, dimensions: kInitialDimensions})
    .catch(reason => {
      console.warn("Not embedded in CODAP", reason);
    });

  // Load previous configuration if available
  const state = await getInteractiveState();
  if (state?.datasetConfig) {
    datasetConfig.applySnapshot(state.datasetConfig);
    
    if (datasetConfig.isConfigured) {
      // Configuration exists, load the data
      await loadConfiguredData();
    } else {
      // No configuration, show configuration UI
      ui.setShowDatasetConfig(true);
    }
  } else {
    // No previous configuration, show configuration UI
    ui.setShowDatasetConfig(true);
  }

  // Setup selection listeners
  setupSelectionSynchronization();
}
```

### 2. Create Dataset Configuration Component

Implement a configuration UI component:

```typescript
// src/components/dataset-config.tsx
import React, { useEffect, useState } from "react";
import { Button, FormControl, FormLabel, Select } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { datasetConfig } from "../models/dataset-config";
import { getAvailableDatasets, getDatasetAttributes, saveInteractiveState } from "../utilities/codap-utils";

export const DatasetConfigPanel = observer(function DatasetConfigPanel() {
  const [datasets, setDatasets] = useState<string[]>([]);
  const [attributes, setAttributes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDatasets() {
      setLoading(true);
      const availableDatasets = await getAvailableDatasets();
      setDatasets(availableDatasets);
      setLoading(false);
    }
    fetchDatasets();
  }, []);

  async function handleDatasetChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const dataContextName = e.target.value;
    datasetConfig.setDataContext(dataContextName);
    
    // Reset attribute mappings
    datasetConfig.resetAttributeMappings();
    
    // Fetch attributes for this dataset
    const datasetAttributes = await getDatasetAttributes(dataContextName);
    setAttributes(datasetAttributes);
    
    // Auto-detect potential mappings
    autoDetectAttributeMappings(datasetAttributes);
  }

  async function handleSaveConfig() {
    datasetConfig.setIsConfigured(true);
    
    // Save configuration to interactive state
    await saveInteractiveState({
      datasetConfig: datasetConfig.toJSON()
    });
    
    // Load the configured dataset
    await loadConfiguredData();
    
    // Hide config panel
    ui.setShowDatasetConfig(false);
  }

  function autoDetectAttributeMappings(attrs: string[]) {
    // Logic to auto-detect lat/long/date attributes based on common naming patterns
    // ...
  }

  return (
    <div className="dataset-config-panel">
      <h2>Configure Dataset</h2>
      
      <FormControl>
        <FormLabel>Select Dataset</FormLabel>
        <Select
          value={datasetConfig.dataContextName || ""}
          onChange={handleDatasetChange}
          placeholder="Select dataset"
          isDisabled={loading}
        >
          {datasets.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </Select>
      </FormControl>
      
      {datasetConfig.dataContextName && (
        <>
          <FormControl>
            <FormLabel>Latitude Attribute</FormLabel>
            <Select
              value={datasetConfig.latitudeAttribute || ""}
              onChange={e => datasetConfig.setLatitudeAttribute(e.target.value)}
              placeholder="Select latitude attribute"
            >
              {attributes.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </Select>
          </FormControl>
          
          {/* Similar FormControls for longitude, date, color, and size attributes */}
          
          <Button
            colorScheme="blue"
            onClick={handleSaveConfig}
            isDisabled={!datasetConfig.isValid}
            mt={4}
          >
            Apply Configuration
          </Button>
        </>
      )}
    </div>
  );
});
```

### 3. Update Data Access in CodapData Model

Modify the data access in the codapData model:

```typescript
// src/models/codap-data.ts
import { datasetConfig } from "./dataset-config";

// Replace direct attribute access with configurable mapping
getLatitude(caseId: string): number {
  if (!datasetConfig.latitudeAttribute) return 0;
  
  const value = this.dataSet.getAttributeValueByName(caseId, datasetConfig.latitudeAttribute);
  return this.parseNumeric(value);
}

getLongitude(caseId: string): number {
  if (!datasetConfig.longitudeAttribute) return 0;
  
  const value = this.dataSet.getAttributeValueByName(caseId, datasetConfig.longitudeAttribute);
  return this.parseNumeric(value);
}

getCaseDate(caseId: string): number {
  if (!datasetConfig.dateAttribute) return 0;
  
  const value = this.dataSet.getAttributeValueByName(caseId, datasetConfig.dateAttribute);
  return this.parseDate(value);
}

// Add helper methods for parsing
parseNumeric(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

parseDate(value: any): number {
  if (typeof value === 'number') return value; // Unix timestamp or numeric date
  
  if (typeof value === 'string') {
    // Try different date formats based on configuration
    if (datasetConfig.dateFormat === 'auto') {
      // Try multiple formats
      return this.tryParseDate(value);
    } else {
      // Use configured format
      return this.parseDateWithFormat(value, datasetConfig.dateFormat);
    }
  }
  
  return 0;
}
```

### 4. Update the App Component to Include Configuration Panel

Modify the App component to display the configuration UI when needed:

```typescript
// src/components/App.tsx
import { ChakraProvider, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { initializeDST } from "../utilities/codap-utils";
import { kAboutTabLabel, kGraphTabLabel } from "../utilities/constants";
import { AboutTab } from "./about-tab";
import { GraphTab } from "./graph-tab";
import { DatasetConfigPanel } from "./dataset-config";
import { ui } from "../models/ui";
import "./App.css";

export const App = observer(() => {
  useEffect(() => {
    initializeDST();
  }, []);

  return (
    <ChakraProvider>
      <div className="App">
        {ui.showDatasetConfig ? (
          <DatasetConfigPanel />
        ) : (
          <Tabs variant="enclosed">
            <TabList>
              <Tab>
                {kGraphTabLabel}
              </Tab>
              <Tab>
                {kAboutTabLabel}
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <GraphTab />
              </TabPanel>
              <TabPanel>
                <AboutTab />
              </TabPanel>
            </TabPanels>
          </Tabs>
        )}
      </div>
    </ChakraProvider>
  );
});
```

### 5. Extend the UI Model

Add configuration UI state to the UI model:

```typescript
// src/models/ui.ts
import { types } from "mobx-state-tree";

export const UIModel = types
  .model("UIModel", {
    // Existing properties
    mode: types.optional(types.string, "pointer"),
    activeControls: types.maybe(types.string),
    // New properties
    showDatasetConfig: types.optional(types.boolean, false)
  })
  .actions(self => ({
    // Existing actions
    setMode(mode: string) {
      self.mode = mode;
    },
    // New actions
    setShowDatasetConfig(show: boolean) {
      self.showDatasetConfig = show;
    }
  }));
```

### 6. Add CODAP API Utilities

Implement new utilities for dataset discovery and attribute retrieval:

```typescript
// src/utilities/codap-utils.ts (additions)
import {
  codapInterface, initializePlugin, getInteractiveState, updateInteractiveState
} from "@concord-consortium/codap-plugin-api";

export async function getAvailableDatasets() {
  const result = await codapInterface.sendRequest({
    action: "get",
    resource: "dataContextList"
  });
  
  if (result.success) {
    return result.values.map((context: any) => context.name);
  }
  return [];
}

export async function getDatasetAttributes(dataContextName: string) {
  const result = await codapInterface.sendRequest({
    action: "get",
    resource: `dataContext[${dataContextName}].collection[*].attribute`
  });
  
  if (result.success) {
    return result.values.map((attr: any) => attr.name);
  }
  return [];
}

export async function saveInteractiveState(state: any) {
  return await updateInteractiveState(state);
}

export async function loadConfiguredData() {
  const { dataContextName } = datasetConfig;
  
  if (!dataContextName || !datasetConfig.isConfigured) {
    console.error("Cannot load data: dataset not properly configured");
    return;
  }
  
  try {
    // Get dataset context
    const dataContextResult = await getDataContext(dataContextName);
    
    if (!dataContextResult.success) {
      console.error("Couldn't load dataset context");
      return;
    }
    
    // Update dataset attributes
    updateDataSetAttributes(dataContextResult.values);
    
    // Load cases
    const casesResult = await getCaseByFormulaSearch(dataContextName, kCollectionName, "true");
    
    if (!casesResult.success) {
      console.error("Couldn't load cases from dataset");
      return;
    }
    
    const casesValues = casesResult.values as DIGetCaseResult["case"][];
    const cases: ICaseCreation[] = casesValues.map(aCase => 
      ({ __id__: toV3CaseId(aCase.id!), ...aCase.values })
    );
    
    // Set cases in the visualization
    setDSTCases(cases);
    
    // Update date range based on configuration
    const dates = codapData.caseIds.map(caseId => codapData.getCaseDate(caseId));
    codapData.setAbsoluteDateRange(Math.min(...dates), Math.max(...dates));
    
    // Setup selection synchronization
    setupSelectionSynchronization();
  } catch (error) {
    console.error("Error loading dataset:", error);
  }
}

export function setupSelectionSynchronization() {
  const { dataContextName } = datasetConfig;
  
  if (!dataContextName) return;
  
  // Listen for selection changes in CODAP
  addDataContextChangeListener(dataContextName, notification => {
    const { operation } = notification.values;
    
    if (operation === "selectCases") {
      updateSelection();
    }
  });
  
  // When selection changes in the plugin, pass to CODAP
  reaction(
    () => Array.from(codapData.dataSet.selection),
    selection => selectCases(dataContextName, Array.from(codapData.dataSet.selection)),
    { equals: comparer.structural }
  );
}
```

## Testing Strategy

### Unit Tests

1. **Configuration Model Tests**
   - Test setting and validating attribute mappings
   - Verify configuration persistence and loading

2. **Data Parsing Tests**
   - Test coordinate parsing with various formats
   - Validate date parsing for different formats
   - Test error handling for invalid data

3. **Visualization Update Tests**
   - Verify point generation with different attribute mappings
   - Test map scaling with different geographic ranges
   - Validate time animation with various date ranges

### Integration Tests

1. **CODAP API Integration**
   - Test dataset discovery and attribute retrieval
   - Verify configuration storage and retrieval
   - Test selection synchronization

2. **End-to-End Visualization Tests**
   - Test complete workflow from configuration to visualization
   - Verify all visualization features work with different datasets
   - Test performance with large datasets

### Manual Testing

1. **Dataset Compatibility Testing**
   - Test with geographic datasets (lat/long)
   - Test with different date formats
   - Test with missing or partial data

2. **User Interface Testing**
   - Verify configuration UI usability
   - Test error messages and validation feedback
   - Verify all controls work as expected

## Deployment Plan

1. **Development Environment**
   - Implement changes in a feature branch
   - Set up test datasets for validation

2. **Testing Environment**
   - Deploy to test CODAP instance
   - Verify functionality with various datasets
   - Collect feedback from test users

3. **Production Deployment**
   - Create release package
   - Update documentation
   - Deploy to CODAP plugin directory

## Migration Plan

For existing users of the DST-CODAP plugin:

1. **Data Migration**
   - First run will prompt for configuration
   - Auto-detect attributes for tornado dataset
   - Preserve existing visualizations where possible

2. **User Communication**
   - Update documentation with migration guide
   - Provide examples of configuring different datasets
   - Include troubleshooting information 