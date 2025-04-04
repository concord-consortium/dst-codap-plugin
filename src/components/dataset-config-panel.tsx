import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Select,
  Stack,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Spinner,
  Text,
  HStack
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { datasetConfig } from "../models/dataset-config";
import { graph } from "../models/graph";
import { 
  getDatasetAttributes, 
  getDatasetDetails,
  loadConfiguredData
} from "../utilities/codap-dataset-utils";
import { getAvailableDatasets, saveInteractiveState } from "../utilities/codap-interface-helpers";
import { ui } from "../models/ui";
import { codapInterface } from "@concord-consortium/codap-plugin-api";
import { createDataContextFromURL } from "@concord-consortium/codap-plugin-api";
import dataURL from "../data/Tornado_Tracks_2020-2022.csv";

// Interface for attribute mappings
interface AttributeMappings {
  latitude: string | undefined;
  longitude: string | undefined;
  date: string | undefined;
  color: string | undefined;
  size: string | undefined;
}

/**
 * Panel for configuring which dataset to use and mapping attributes
 */
export const DatasetConfigPanel = observer(function DatasetConfigPanel() {
  const [datasets, setDatasets] = useState<string[]>([]);
  const [attributes, setAttributes] = useState<string[]>([]);
  const [isLoadingDatasets, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [autoSelectedDataset, setAutoSelectedDataset] = useState<string | null>(null);
  // Use an ESLint disable comment for this specific state variable
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [datasetDetails, setDatasetDetails] = useState<any>(null);

  // Define fetchDatasets function in broader scope
  const fetchDatasets = async () => {
    setLoading(true);
    setLoadError(null);
    setAutoSelectedDataset(null);
    try {
      console.log("Fetching available datasets...");
      // Diagnostic log before API call
      console.log("CODAP plugin API available:", typeof codapInterface !== 'undefined');
      
      const availableDatasets = await getAvailableDatasets();
      console.log("Available datasets:", availableDatasets);
      
      if (Array.isArray(availableDatasets) && availableDatasets.length > 0) {
        setDatasets(availableDatasets);
        
        // Auto-select the dataset if there's only one
        if (availableDatasets.length === 1 && !datasetConfig.dataContextName) {
          console.log("Auto-selecting the only available dataset:", availableDatasets[0]);
          const dataContextName = availableDatasets[0];
          datasetConfig.setDataContext(dataContextName);
          setAutoSelectedDataset(dataContextName);
          
          // Fetch the attributes for this dataset
          try {
            setDatasetDetails(await getDatasetDetails(dataContextName));
            const datasetAttributes = await getDatasetAttributes(dataContextName);
            setAttributes(datasetAttributes);
            
            // Auto-detect attribute mappings
            const mappings = autoDetectAttributes(datasetAttributes);
            
            // Update dataset config with detected mappings
            if (mappings.latitude) datasetConfig.setLatitudeAttribute(mappings.latitude);
            if (mappings.longitude) datasetConfig.setLongitudeAttribute(mappings.longitude);
            if (mappings.date) datasetConfig.setDateAttribute(mappings.date);
            if (mappings.color) datasetConfig.setColorAttribute(mappings.color);
            if (mappings.size) datasetConfig.setSizeAttribute(mappings.size);
          } catch (attributeError) {
            console.error("Error auto-fetching dataset attributes:", attributeError);
          }
        }
      } else {
        console.warn("No datasets returned from CODAP or empty array received");
        setLoadError("No datasets found in CODAP. Please create a dataset first.");
      }
    } catch (error) {
      console.error("Error fetching datasets:", error);
      setLoadError(`Failed to load datasets: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to create a sample dataset
  const createSampleDataset = async () => {
    setLoading(true);
    setLoadError(null);
    setAutoSelectedDataset(null);
    try {
      console.log("Creating sample dataset from:", dataURL);
      const result = await createDataContextFromURL(dataURL);
      
      if (result.success) {
        console.log("Successfully created sample dataset:", result.values);
        // Use the created dataset directly instead of fetching all datasets again
        const dataContextName = "Tornado_Tracks_2020-2022"; // Name matching the imported CSV
        
        // Set the dataset in the config
        datasetConfig.setDataContext(dataContextName);
        setAutoSelectedDataset(dataContextName);
        
        try {
          // Get dataset details and attributes
          setDatasetDetails(await getDatasetDetails(dataContextName));
          const datasetAttributes = await getDatasetAttributes(dataContextName);
          
          // Update the datasets list with the new dataset
          setDatasets([dataContextName]);
          setAttributes(datasetAttributes);
          
          // Auto-detect and apply attribute mappings
          const mappings = autoDetectAttributes(datasetAttributes);
          if (mappings.latitude) datasetConfig.setLatitudeAttribute(mappings.latitude);
          if (mappings.longitude) datasetConfig.setLongitudeAttribute(mappings.longitude);
          if (mappings.date) datasetConfig.setDateAttribute(mappings.date);
          if (mappings.color) datasetConfig.setColorAttribute(mappings.color);
          if (mappings.size) datasetConfig.setSizeAttribute(mappings.size);
        } catch (attributeError) {
          console.error("Error fetching attributes for sample dataset:", attributeError);
          // Fall back to fetching all datasets if direct approach fails
          await fetchDatasets();
        }
      } else {
        console.error("Failed to create sample dataset:", result);
        setLoadError(`Failed to create sample dataset: ${result.values?.error || "Unknown error"}`);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error creating sample dataset:", error);
      setLoadError(`Error creating sample dataset: ${error instanceof Error ? error.message : String(error)}`);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Load available datasets when component mounts or modal visibility changes
  useEffect(() => {
    // Only fetch datasets when the modal is visible
    if (ui.showDatasetConfig) {
      fetchDatasets();
    }
  }, [ui.showDatasetConfig]); // Re-run when modal visibility changes

  /**
   * Auto-detect attribute mappings based on attribute names
   * @param attributeList Array of attribute names
   * @returns Attribute mappings
   */
  const autoDetectAttributes = (attributeList: string[]): AttributeMappings => {
    console.log("Auto-detecting attribute mappings from:", attributeList);
    
    const mappings: AttributeMappings = {
      latitude: undefined,
      longitude: undefined,
      date: undefined,
      color: undefined,
      size: undefined
    };
    
    // Convert to lowercase for case-insensitive matching
    const lowercaseAttributes = attributeList.map(attr => attr.toLowerCase());
    
    // Find latitude attribute
    const latitudeKeywords = ["lat", "latitude"];
    for (const keyword of latitudeKeywords) {
      const match = lowercaseAttributes.find(attr => attr.includes(keyword));
      if (match) {
        const index = lowercaseAttributes.indexOf(match);
        mappings.latitude = attributeList[index];
        console.log("Latitude match:", mappings.latitude);
        break;
      }
    }
    
    // Find longitude attribute
    const longitudeKeywords = ["lon", "long", "longitude"];
    for (const keyword of longitudeKeywords) {
      const match = lowercaseAttributes.find(attr => attr.includes(keyword));
      if (match) {
        const index = lowercaseAttributes.indexOf(match);
        mappings.longitude = attributeList[index];
        console.log("Longitude match:", mappings.longitude);
        break;
      }
    }
    
    // Find date attribute
    const dateKeywords = ["date", "time", "day"];
    let dateMatches: string[] = [];
    
    for (const keyword of dateKeywords) {
      const matches = lowercaseAttributes
        .filter(attr => attr.includes(keyword))
        .map(attr => {
          const index = lowercaseAttributes.indexOf(attr);
          return attributeList[index];
        });
      
      if (matches.length > 0) {
        dateMatches = [...dateMatches, ...matches];
      }
    }
    
    // Prioritize date attributes: exact "date" match first, then "day", then others
    if (dateMatches.length > 0) {
      // Priority 1: Exact "date" match
      const exactDateMatch = dateMatches.find(attr => attr.toLowerCase() === "date");
      if (exactDateMatch) {
        mappings.date = exactDateMatch;
      } 
      // Priority 2: Exact "day" match
      else {
        const dayMatch = dateMatches.find(attr => attr.toLowerCase() === "day");
        if (dayMatch) {
          mappings.date = dayMatch;
        } 
        // Priority 3: First match with "date" in the name
        else {
          const dateInName = dateMatches.find(attr => attr.toLowerCase().includes("date"));
          if (dateInName) {
            mappings.date = dateInName;
          } 
          // Priority 4: Just use the first match we found
          else {
            mappings.date = dateMatches[0];
          }
        }
      }
      console.log("Date match:", mappings.date);
    }
    
    // Look for potential color attributes - still detect for internal use
    const colorKeywords = ["color", "category", "type", "species"];
    for (const keyword of colorKeywords) {
      const match = lowercaseAttributes.find(attr => attr.includes(keyword));
      if (match) {
        const index = lowercaseAttributes.indexOf(match);
        mappings.color = attributeList[index];
        console.log("Color match:", mappings.color);
        break;
      }
    }
    
    // Look for potential size attributes - still detect for internal use
    const sizeKeywords = ["size", "weight", "magnitude", "depth"];
    for (const keyword of sizeKeywords) {
      const match = lowercaseAttributes.find(attr => attr.includes(keyword));
      if (match) {
        const index = lowercaseAttributes.indexOf(match);
        mappings.size = attributeList[index];
        console.log("Size match:", mappings.size);
        break;
      }
    }
    
    console.log("Attribute mapping results:", mappings);
    return mappings;
  };

  // Handler for dataset selection
  const handleDatasetChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const dataContextName = event.target.value;
    console.log(`Selected dataset: ${dataContextName}`);
    
    if (!dataContextName) {
      return;
    }
    
    datasetConfig.setDataContext(dataContextName);
    
    try {
      // Get dataset details first to understand structure
      setDatasetDetails(await getDatasetDetails(dataContextName));
      
      // Get attributes for selected dataset
      const datasetAttributes = await getDatasetAttributes(dataContextName);
      console.log("Final retrieved attributes:", datasetAttributes);
      
      // Update available attributes for selection
      setAttributes(datasetAttributes);
      
      // Auto-detect potential mappings
      const mappings = autoDetectAttributes(datasetAttributes);
      
      // Update dataset config with detected mappings
      if (mappings.latitude) datasetConfig.setLatitudeAttribute(mappings.latitude);
      if (mappings.longitude) datasetConfig.setLongitudeAttribute(mappings.longitude);
      if (mappings.date) datasetConfig.setDateAttribute(mappings.date);
      
      // Set color and size attributes if auto-detected, although not shown in UI
      if (mappings.color) datasetConfig.setColorAttribute(mappings.color);
      if (mappings.size) datasetConfig.setSizeAttribute(mappings.size);
    } catch (error) {
      console.error("Error fetching dataset attributes:", error);
    }
  };

  // Handler for applying the configuration
  async function handleSaveConfig() {
    datasetConfig.setIsConfigured(true);
    
    // Save configuration to interactive state
    try {
      await saveInteractiveState({
        datasetConfig
      });
      
      // Reset the date range in the graph to ensure visualization uses the new data
      console.log("Configuration applied, loading configured data...");
      
      // Load the configured dataset which will calculate the date range
      await loadConfiguredData();
      
      // Reset the graph date visualization 
      graph.resetDateVisualization();
      
      // Close the modal
      ui.setShowDatasetConfig(false);
    } catch (error) {
      console.error("Error saving configuration:", error);
    }
  }

  // Handler for canceling configuration
  function handleCancel() {
    // If we haven't configured a dataset yet, we might want to show a warning
    // or try to select a default dataset
    if (!datasetConfig.isConfigured) {
      console.log("Configuration canceled without selecting a dataset");
    }
    
    ui.setShowDatasetConfig(false);
  }

  // Check if configuration is valid for saving
  const isConfigValid = () => {
    return Boolean(
      datasetConfig.dataContextName &&
      datasetConfig.latitudeAttribute &&
      datasetConfig.longitudeAttribute &&
      datasetConfig.dateAttribute
    );
  };

  return (
    <Modal 
      isOpen={ui.showDatasetConfig} 
      onClose={handleCancel}
      size="xl"
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Configure Dataset</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {isLoadingDatasets ? (
              <Box textAlign="center" py={4}>
                <Spinner size="lg" />
                <Text mt={2}>Loading available datasets...</Text>
              </Box>
            ) : loadError ? (
              <Box textAlign="center" py={4} color="red.500">
                <Text fontWeight="bold">Error</Text>
                <Text mt={2}>{loadError}</Text>
                <Box mt={4} p={4} bg="gray.100" borderRadius="md" fontSize="sm" color="gray.700">
                  <Text fontWeight="bold">Diagnostic Information:</Text>
                  <Text>CODAP Integration Status: {typeof codapInterface !== 'undefined' ? 'Available' : 'Not Available'}</Text>
                  <Text>Running in iframe: {window.self !== window.top ? 'Yes' : 'No'}</Text>
                  <Text>Plugin initialized: {ui ? 'Yes' : 'No'}</Text>
                </Box>
                <HStack spacing={4} mt={4} justify="center">
                  <Button 
                    colorScheme="blue" 
                    onClick={() => fetchDatasets()}
                  >
                    Retry Connection
                  </Button>
                  <Button 
                    colorScheme="red" 
                    onClick={createSampleDataset}
                    isLoading={isLoadingDatasets}
                  >
                    Create Sample Dataset
                  </Button>
                </HStack>
              </Box>
            ) : datasets.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Text>No datasets found in CODAP.</Text>
                <Text mt={2}>Please create a dataset in CODAP first.</Text>
                <HStack spacing={4} mt={4} justify="center">
                  <Button 
                    colorScheme="blue" 
                    onClick={createSampleDataset}
                    isLoading={isLoadingDatasets}
                  >
                    Create Sample Dataset
                  </Button>
                  <Button 
                    colorScheme="blue" 
                    onClick={() => fetchDatasets()}
                  >
                    Retry
                  </Button>
                </HStack>
              </Box>
            ) : (
              <>
                <FormControl>
                  <FormLabel htmlFor="dataset-select">Select Dataset</FormLabel>
                  <Select
                    id="dataset-select"
                    value={datasetConfig.dataContextName || ""}
                    onChange={handleDatasetChange}
                    placeholder="Select dataset"
                    isDisabled={isLoadingDatasets}
                  >
                    {datasets.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </Select>
                  <FormHelperText>Choose a dataset from CODAP to visualize</FormHelperText>
                </FormControl>
                
                {autoSelectedDataset && datasetConfig.isValid && (
                  <Box 
                    p={4} 
                    bg="blue.50" 
                    borderRadius="md" 
                    borderLeft="4px" 
                    borderColor="blue.400"
                    mt={3}
                  >
                    <Text fontWeight="medium">
                      Dataset "{autoSelectedDataset}" was automatically selected and configured.
                    </Text>
                    <Button 
                      mt={2} 
                      colorScheme="blue" 
                      size="sm"
                      onClick={handleSaveConfig}
                    >
                      Apply Auto-Configuration
                    </Button>
                  </Box>
                )}
                
                {datasetConfig.dataContextName && (
                  <Stack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel htmlFor="latitude-select">Latitude Attribute</FormLabel>
                      <Select
                        id="latitude-select"
                        data-testid="latitude-select"
                        value={datasetConfig.latitudeAttribute || ""}
                        onChange={e => datasetConfig.setLatitudeAttribute(e.target.value)}
                        placeholder="Select latitude attribute"
                      >
                        {attributes.map(name => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </Select>
                      <FormHelperText>
                        Attribute containing latitude values
                        {autoSelectedDataset && datasetConfig.latitudeAttribute && 
                          <Text as="span" color="green.600" fontWeight="medium"> (auto-detected)</Text>
                        }
                      </FormHelperText>
                    </FormControl>
                    
                    <FormControl isRequired>
                      <FormLabel htmlFor="longitude-select">Longitude Attribute</FormLabel>
                      <Select
                        id="longitude-select"
                        data-testid="longitude-select"
                        value={datasetConfig.longitudeAttribute || ""}
                        onChange={e => datasetConfig.setLongitudeAttribute(e.target.value)}
                        placeholder="Select longitude attribute"
                      >
                        {attributes.map(name => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </Select>
                      <FormHelperText>
                        Attribute containing longitude values
                        {autoSelectedDataset && datasetConfig.longitudeAttribute && 
                          <Text as="span" color="green.600" fontWeight="medium"> (auto-detected)</Text>
                        }
                      </FormHelperText>
                    </FormControl>
                    
                    <FormControl isRequired>
                      <FormLabel htmlFor="date-select">Date Attribute</FormLabel>
                      <Select
                        id="date-select"
                        data-testid="date-select"
                        value={datasetConfig.dateAttribute || ""}
                        onChange={e => datasetConfig.setDateAttribute(e.target.value)}
                        placeholder="Select date attribute"
                      >
                        {attributes.map(name => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </Select>
                      <FormHelperText>
                        Attribute containing date or time values
                        {autoSelectedDataset && datasetConfig.dateAttribute && 
                          <Text as="span" color="green.600" fontWeight="medium"> (auto-detected)</Text>
                        }
                      </FormHelperText>
                    </FormControl>
                  </Stack>
                )}
              </>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button 
            colorScheme="blue" 
            mr={3} 
            onClick={handleSaveConfig}
            isDisabled={!isConfigValid()}
          >
            Apply Configuration
          </Button>
          <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
});
