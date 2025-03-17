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
import { getAvailableDatasets, getDatasetAttributes, saveInteractiveState } from "../utilities/codap-dataset-utils";
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
        const availableDatasets = await getAvailableDatasets();
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
    // Map of common attribute name patterns
    const patterns: Record<string, RegExp[]> = {
      latitude: [/^lat(itude)?$/i, /^y$/i],
      longitude: [/^lon(g(itude)?)?$/i, /^x$/i],
      date: [/^date$/i, /^time$/i, /^timestamp$/i, /^day$/i]
    };

    // Check for latitude
    const latMatch = attrs.find(attr => patterns.latitude.some(pattern => pattern.test(attr)));
    if (latMatch) {
      datasetConfig.setLatitudeAttribute(latMatch);
    }

    // Check for longitude
    const longMatch = attrs.find(attr => patterns.longitude.some(pattern => pattern.test(attr)));
    if (longMatch) {
      datasetConfig.setLongitudeAttribute(longMatch);
    }

    // Check for date
    const dateMatch = attrs.find(attr => patterns.date.some(pattern => pattern.test(attr)));
    if (dateMatch) {
      datasetConfig.setDateAttribute(dateMatch);
    }
  }

  // Handler for dataset selection
  async function handleDatasetChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const dataContextName = e.target.value;
    datasetConfig.setDataContext(dataContextName);
    
    // Reset attribute mappings
    datasetConfig.resetAttributeMappings();
    
    // Fetch attributes for this dataset
    try {
      const datasetAttributes = await getDatasetAttributes(dataContextName);
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
                onChange={e => datasetConfig.setSizeAttribute(e.target.value || undefined)}
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
