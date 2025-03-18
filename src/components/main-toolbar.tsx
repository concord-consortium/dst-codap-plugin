import React from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Spacer,
  Tooltip
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { ui } from "../models/ui";
import { graph } from "../models/graph";
import { updateMapBoundsFromData } from "../utilities/codap-dataset-utils";
import { datasetConfig } from "../models/dataset-config";

/**
 * Main toolbar component for the application
 */
export const MainToolbar = observer(function MainToolbar() {
  /**
   * Handle the reset map view button click
   */
  const handleResetMapView = () => {
    // Using the current dataset context name
    if (datasetConfig.dataContextName) {
      // Update the map bounds and reset to show all data
      updateMapBoundsFromData(datasetConfig.dataContextName);
    } else {
      // If no dataset is configured, just reset to default view
      graph.resetToHomeView();
    }
  };

  return (
    <Flex 
      as="header" 
      align="center" 
      justify="space-between"
      wrap="wrap"
      padding="1.0rem"
      bg="gray.100"
      color="gray.500"
      borderBottom="1px"
      borderColor="gray.200"
    >
      <Box
        fontWeight="bold"
        letterSpacing="tight"
        fontSize="xl"
        color="teal.500"
      >
        CODAP Map Plugin
      </Box>
      
      <Spacer />
      
      <ButtonGroup spacing={2} mr={2}>
        <Tooltip label="Reset the map to show all data points">
          <Button 
            colorScheme="teal" 
            size="sm"
            onClick={handleResetMapView}
          >
            Reset Map View
          </Button>
        </Tooltip>

        <Button 
          colorScheme="blue" 
          size="sm"
          onClick={() => ui.setShowDatasetConfig(true)}
        >
          Configure Dataset
        </Button>
      </ButtonGroup>
    </Flex>
  );
}); 


