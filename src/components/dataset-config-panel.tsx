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
  getAvailableDatasets, 
  getDatasetAttributes, 
  saveInteractiveState, 
  getAttributesFromItemSearch,
  exploreDataset,
  getDatasetDetails,
  loadConfiguredData
} from "../utilities/codap-dataset-utils";
import { ui } from "../models/ui";

/**
 * Panel for configuring which dataset to use and mapping attributes
 */
export const DatasetConfigPanel = observer(function DatasetConfigPanel() {
  const [datasets, setDatasets] = useState<string[]>([]);
  const [attributes, setAttributes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Auto-detect attribute mappings based on common naming patterns
  function autoDetectAttributeMappings(attrs: string[]) {
    console.log("Auto-detecting attribute mappings from:", attrs);
    
    // Map of common attribute name patterns with expanded patterns
    const patterns: Record<string, RegExp[]> = {
      latitude: [
        /^lat(itude)?$/i,         // lat, latitude
        /^y$/i,                   // y coordinate
        /^location[_\s-]?lat/i,   // location lat, location_lat
        /lat(itude)?[_\s-]?\d*$/i, // latitude, latitude_1, etc.
        /^coord[_\s-]?y$/i        // coord y, coord_y
      ],
      longitude: [
        /^lon(g(itude)?)?$/i,     // lon, long, longitude
        /^x$/i,                   // x coordinate
        /^location[_\s-]?lon/i,   // location lon, location_lon
        /lon(g(itude)?)?[_\s-]?\d*$/i, // longitude, longitude_1, etc.
        /^coord[_\s-]?x$/i        // coord x, coord_x
      ],
      date: [
        /^date$/i,                // date
        /^time$/i,                // time
        /^timestamp$/i,           // timestamp
        /^day$/i,                 // day
        /^year$/i,                // year
        /^month$/i,               // month
        /^datetime$/i,            // datetime
        /date[_\s-]?\w*$/i,       // date_field, date_time, etc.
        /time[_\s-]?\w*$/i        // time_field, time_stamp, etc.
      ]
    };

    // Check for latitude
    const latMatch = attrs.find(attr => patterns.latitude.some(pattern => pattern.test(attr)));
    console.log("Latitude match:", latMatch);
    if (latMatch) {
      datasetConfig.setLatitudeAttribute(latMatch);
    }

    // Check for longitude
    const longMatch = attrs.find(attr => patterns.longitude.some(pattern => pattern.test(attr)));
    console.log("Longitude match:", longMatch);
    if (longMatch) {
      datasetConfig.setLongitudeAttribute(longMatch);
    }

    // Check for date
    const dateMatch = attrs.find(attr => patterns.date.some(pattern => pattern.test(attr)));
    console.log("Date match:", dateMatch);
    if (dateMatch) {
      datasetConfig.setDateAttribute(dateMatch);
    }
    
    // Log attribute matching results
    console.log("Attribute mapping results:", {
      latitude: datasetConfig.latitudeAttribute,
      longitude: datasetConfig.longitudeAttribute,
      date: datasetConfig.dateAttribute
    });
  }

  // Handler for dataset selection
  async function handleDatasetChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const dataContextName = e.target.value;
    console.log("Dataset selected:", dataContextName);
    datasetConfig.setDataContext(dataContextName);
    
    // Reset attribute mappings
    datasetConfig.resetAttributeMappings();
    
    // Get detailed dataset information for debugging
    let datasetDetails: any = null;
    try {
      const details = await getDatasetDetails(dataContextName);
      datasetDetails = details; // Store for later use
      console.log("Dataset details:", JSON.stringify(details, null, 2));
      
      // If there are collections, log the attributes in each collection
      if (details?.collections?.length) {
        details.collections.forEach((collection: any) => {
          console.log(`Collection ${collection.name} attributes:`, 
            collection.attributes.map((attr: any) => attr.name || "unnamed"));
        });
      } else {
        console.warn("No collections found in dataset");
      }
    } catch (error) {
      console.error("Error getting dataset details:", error);
    }
    
    // Fetch attributes for this dataset using multiple methods
    try {
      // Try multiple approaches to get the attributes, using the first one that succeeds
      console.log("Attempting to get attributes for dataset using multiple methods...");
      
      // Method 1: Main get attributes function (includes direct extraction from context)
      console.log("Method 1: Using getDatasetAttributes...");
      let datasetAttributes = await getDatasetAttributes(dataContextName);
      
      // Method 2: If that fails, try itemSearch
      if (!datasetAttributes.length) {
        console.log("Method 2: Using getAttributesFromItemSearch...");
        datasetAttributes = await getAttributesFromItemSearch(dataContextName);
      }
      
      // Method 3: If that fails, try direct exploration
      if (!datasetAttributes.length) {
        console.log("Method 3: Using exploreDataset...");
        datasetAttributes = await exploreDataset(dataContextName);
      }
      
      // Method 4: Last resort - try to manually extract from dataset details
      if (!datasetAttributes.length && datasetDetails?.context?.collections) {
        console.log("Method 4: Manually extracting from dataset details...");
        
        const allAttributes: string[] = [];
        let collectionCount = 0;
        
        try {
          datasetDetails.context.collections.forEach((collection: any) => {
            if (collection && collection.attrs && Array.isArray(collection.attrs)) {
              collectionCount++;
              collection.attrs.forEach((attr: any) => {
                if (attr && attr.name) {
                  allAttributes.push(attr.name);
                }
              });
            }
          });
          
          console.log(`Extracted ${allAttributes.length} attributes from ${collectionCount} collections`);
          datasetAttributes = allAttributes;
        } catch (err) {
          console.error("Error in manual extraction:", err);
        }
      }
      
      console.log("Final retrieved attributes:", datasetAttributes);
      setAttributes(datasetAttributes);
      
      // Auto-detect potential mappings
      autoDetectAttributeMappings(datasetAttributes);
    } catch (error) {
      console.error("Error fetching dataset attributes:", error);
    }
  }

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
            
            <FormControl>
              <FormLabel htmlFor="color-select">Color Attribute (Optional)</FormLabel>
              <Select
                id="color-select"
                data-testid="color-select"
                value={datasetConfig.colorAttribute || ""}
                onChange={e => datasetConfig.setColorAttribute(e.target.value || undefined)}
                placeholder="Select color attribute"
              >
                <option value="">None</option>
                {attributes.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </Select>
              <FormHelperText>Attribute to use for coloring points</FormHelperText>
            </FormControl>
            
            <FormControl>
              <FormLabel htmlFor="size-select">Size Attribute (Optional)</FormLabel>
              <Select
                id="size-select"
                data-testid="size-select"
                value={datasetConfig.sizeAttribute || ""}
                onChange={evt => datasetConfig.setSizeAttribute(evt.target.value || undefined)}
                placeholder="Select size attribute"
              >
                <option value="">None</option>
                {attributes.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </Select>
              <FormHelperText>Attribute to use for sizing points</FormHelperText>
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
