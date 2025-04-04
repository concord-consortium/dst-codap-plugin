import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Select,
  Stack,
  VStack
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
  const [loading, setLoading] = useState(true);
  // Use an ESLint disable comment for this specific state variable
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [datasetDetails, setDatasetDetails] = useState<any>(null);

  // Load available datasets when component mounts
  useEffect(() => {
    async function fetchDatasets() {
      setLoading(true);
      try {
        console.log("Fetching available datasets...");
        const availableDatasets = await getAvailableDatasets();
        console.log("Available datasets:", availableDatasets);
        setDatasets(availableDatasets);
      } catch (error) {
        console.error("Error fetching datasets:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDatasets();
  }, []);

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
      
      // Hide config panel
      ui.setShowDatasetConfig(false);
    } catch (error) {
      console.error("Error saving configuration:", error);
    }
  }

  return (
    <Box p={4} maxW="600px" mx="auto">
      <VStack spacing={6} align="stretch">
        <Heading as="h2" size="lg">Configure Dataset</Heading>
        
        <FormControl>
          <FormLabel htmlFor="dataset-select">Select Dataset</FormLabel>
          <Select
            id="dataset-select"
            value={datasetConfig.dataContextName || ""}
            onChange={handleDatasetChange}
            placeholder="Select dataset"
            isDisabled={loading}
          >
            {datasets.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </Select>
          <FormHelperText>Choose a dataset from CODAP to visualize</FormHelperText>
        </FormControl>
        
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
              <FormHelperText>Attribute containing latitude values</FormHelperText>
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
              <FormHelperText>Attribute containing longitude values</FormHelperText>
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
              <FormHelperText>Attribute containing date or time values</FormHelperText>
            </FormControl>
            
            <Flex justify="flex-end" mt={4}>
              <Button
                colorScheme="blue"
                onClick={handleSaveConfig}
                isDisabled={!datasetConfig.isValid}
                mr={2}
              >
                Apply Configuration
              </Button>
            </Flex>
          </Stack>
        )}
      </VStack>
    </Box>
  );
});
