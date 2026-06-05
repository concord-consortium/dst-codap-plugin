import React, { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { HStack, Button, IconButton, Spinner, Checkbox, VStack, Box, Text, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Divider, Switch } from "@chakra-ui/react";
import { SettingsIcon } from "@chakra-ui/icons";
import LegendIcon from "../../assets/icons/display-hide-legend-icon.svg";
import HomeIcon from "../../assets/icons/home-icon.svg";
import MapResetIcon from "../../assets/icons/map-reset-icon.svg";
import MapUSIcon from "../../assets/icons/map-us-icon.svg";
import MapZoomInIcon from "../../assets/icons/map-zoom-in-icon.svg";
import MapZoomOutIcon from "../../assets/icons/map-zoom-out-icon.svg";
import MarqueeIcon from "../../assets/icons/marquee-select-icon.svg";
import PointIcon from "../../assets/icons/point-selection.svg";
import { dstCamera } from "../../models/camera";
import { graph } from "../../models/graph";
import { ui } from "../../models/ui";
import { datasetConfig } from "../../models/dataset-config";
import { getAvailableDatasets } from "../../utilities/codap-interface-helpers";
import { loadConfiguredData, getDatasetAttributes } from "../../utilities/codap-dataset-utils";
import { resyncHiddenCasesFromCodap } from "../../utilities/codap-utils";
import { LegendAttributeSelectors } from "../legend/legend-attribute-selectors";
import { MapPanControls } from "./map-pan-controls";
import { NavigationControls } from "./navigation-controls/navigation-controls";
import { TimeSlider } from "./time-slider/time-slider";
import { UIButton } from "./ui-button";
import { UIButtonContainer } from "./ui-button-container";
import "./graph-ui.scss";

export const GraphUI = observer(function GraphUI() {
  const [isLoading, setIsLoading] = useState(false);
  const [isReloadingTable, setIsReloadingTable] = useState(false);

  const handleReloadTable = async () => {
    if (!datasetConfig.dataContextName) return;
    setIsReloadingTable(true);
    try {
      await resyncHiddenCasesFromCodap(datasetConfig.dataContextName);
    } finally {
      setIsReloadingTable(false);
    }
  };
  
  // Log dataset config status on component mount for debugging
  useEffect(() => {
    console.log("GraphUI component mounted");
    console.log("Dataset configuration status:", {
      isConfigured: datasetConfig.isConfigured,
      dataContextName: datasetConfig.dataContextName,
      latitudeAttribute: datasetConfig.latitudeAttribute,
      longitudeAttribute: datasetConfig.longitudeAttribute,
      dateAttribute: datasetConfig.dateAttribute,
      colorAttribute: datasetConfig.colorAttribute,
      sizeAttribute: datasetConfig.sizeAttribute
    });
  }, []);
  
  /**
   * Auto-detect attribute mappings based on attribute names
   * @param attributeList Array of attribute names
   * @returns Mapping of detected attributes
   */
  const autoDetectAttributes = (attributeList: string[]) => {
    console.log("Auto-detecting attribute mappings from:", attributeList);
    
    const mappings: Record<string, string | undefined> = {
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
    
    // Look for potential color attributes - prefer categorical attributes for color
    const colorKeywords = ["color", "category", "type", "species", "f_scale", "intensity"];
    for (const keyword of colorKeywords) {
      const match = lowercaseAttributes.find(attr => attr.includes(keyword));
      if (match) {
        const index = lowercaseAttributes.indexOf(match);
        mappings.color = attributeList[index];
        console.log("Color match:", mappings.color);
        break;
      }
    }
    
    // Look for potential size attributes
    const sizeKeywords = ["size", "weight", "magnitude", "depth", "width", "radius", "diameter", "length", "area"];
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
  
  // Handle the Load Data button click
  const handleLoadData = async () => {
    console.log("Load Data button clicked");
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // If dataset is already configured, just reload the data
      if (datasetConfig.isConfigured) {
        console.log("Dataset already configured, reloading data");
        await loadConfiguredData();
        graph.resetDateVisualization();
        console.log("Successfully reloaded configured dataset");
        setIsLoading(false);
        return;
      }
      
      // Get available datasets directly instead of using state
      console.log("Fetching available datasets directly...");
      const availableDatasets = await getAvailableDatasets();
      console.log("Available datasets when button clicked:", availableDatasets);
      
      // Check if we actually have datasets
      if (!availableDatasets || availableDatasets.length === 0) {
        console.log("No datasets available, showing config panel");
        ui.setShowDatasetConfig(true);
        setIsLoading(false);
        return;
      }
      
      // If multiple datasets, show config panel to let user choose
      if (availableDatasets.length > 1) {
        console.log("Multiple datasets found, showing config panel");
        ui.setShowDatasetConfig(true);
        setIsLoading(false);
        return;
      }
      
      // At this point we know there's exactly one dataset
      const datasetName = availableDatasets[0];
      console.log(`Processing single dataset: ${datasetName}`);
      
      // Set the dataset context name
      datasetConfig.setDataContext(datasetName);
      
      // Get attributes for the dataset
      console.log(`Getting attributes for dataset: ${datasetName}`);
      const attributeList = await getDatasetAttributes(datasetName);
      console.log("Available attributes:", attributeList);
      
      if (!attributeList || attributeList.length === 0) {
        console.log("No attributes found for dataset, showing config panel");
        ui.setShowDatasetConfig(true);
        setIsLoading(false);
        return;
      }
      
      // Auto-detect attribute mappings
      const mappings = autoDetectAttributes(attributeList);
      console.log("Auto-detected mappings:", mappings);
      
      // Track if we have all the required attributes
      const hasLatitude = !!mappings.latitude;
      const hasLongitude = !!mappings.longitude;
      const hasDate = !!mappings.date;
      const hasAllRequired = hasLatitude && hasLongitude && hasDate;
      
      console.log("Attribute detection results:", {
        hasLatitude,
        hasLongitude,
        hasDate,
        hasAllRequired
      });
      
      // Update dataset config with detected mappings
      if (hasLatitude) {
        datasetConfig.setLatitudeAttribute(mappings.latitude);
      }
      
      if (hasLongitude) {
        datasetConfig.setLongitudeAttribute(mappings.longitude);
      }
      
      if (hasDate) {
        datasetConfig.setDateAttribute(mappings.date);
      }
      
      // Optional attributes: color, size
      if (mappings.color) {
        datasetConfig.setColorAttribute(mappings.color);
      }
      
      if (mappings.size) {
        datasetConfig.setSizeAttribute(mappings.size);
      }
      
      // If we have all required attributes, auto-load the data
      if (hasAllRequired) {
        console.log("Auto-loading dataset with detected attributes");
        
        // Set configured flag to true BEFORE loading data
        datasetConfig.setIsConfigured(true);
        
        // Load the configured data
        await loadConfiguredData();
        
        // Reset the graph date visualization
        graph.resetDateVisualization();
        
        console.log("Auto-loaded dataset successfully");
      } else {
        console.log("Could not auto-detect all required attributes, showing config panel");
        ui.setShowDatasetConfig(true);
      }
    } catch (error) {
      console.error("Error in Load Data button handling:", error);
      ui.setShowDatasetConfig(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <NavigationControls />
      
      {/* Dataset control buttons in the tab gutter */}
      <HStack 
        position="absolute" 
        top="1px" 
        right="10px" 
        zIndex={10}
        spacing={2}
      >
        {datasetConfig.isConfigured && datasetConfig.dataContextName && (
          <Button
            size="xs"
            colorScheme="blue"
            variant="outline"
            onClick={handleReloadTable}
            data-testid="button-reload-table"
            isDisabled={isLoading || isReloadingTable}
            leftIcon={isReloadingTable ? <Spinner size="xs" /> : undefined}
          >
            {isReloadingTable ? "Reloading..." : "Reload Table"}
          </Button>
        )}
        <Button
          size="xs"
          colorScheme={datasetConfig.isConfigured ? "blue" : "teal"}
          onClick={handleLoadData}
          data-testid="button-load-data"
          variant={datasetConfig.isConfigured ? "outline" : "solid"}
          className="load-data-button"
          isDisabled={isLoading}
          leftIcon={isLoading ? <Spinner size="xs" /> : undefined}
        >
          {isLoading
            ? "Loading..."
            : datasetConfig.isConfigured
              ? "Reload Data"
              : "Load Data"
          }
        </Button>
        
        <IconButton
          size="xs"
          colorScheme="blue"
          onClick={() => ui.setShowDatasetConfig(true)}
          data-testid="button-configure-dataset"
          variant="outline"
          aria-label="Configure Dataset"
          icon={<SettingsIcon />}
        />
      </HStack>
      
      <UIButtonContainer className="home-container">
        <UIButton
          className="top bottom"
          disabled={dstCamera.isHome}
          Icon={HomeIcon}
          onClick={() => dstCamera.resetHome()}
          testId="button-home"
          tooltip="Reset Camera Position"
        />
      </UIButtonContainer>
      <UIButtonContainer className="map-zoom-container">
        <UIButton
          className="top"
          disabled={!graph.canZoomIn}
          Icon={MapZoomInIcon}
          onClick={() => graph.zoomIn()}
          testId="button-map-zoom-in"
          tooltip="Zoom In"
        />
        <UIButton
          className="bottom"
          disabled={!graph.canZoomOut}
          Icon={MapZoomOutIcon}
          onClick={() => graph.zoomOut()}
          testId="button-map-zoom-out"
          tooltip="Zoom Out"
        />
      </UIButtonContainer>
      <UIButtonContainer className="map-us-container">
        <UIButton
          className="top bottom"
          Icon={MapUSIcon}
          onClick={() => graph.viewContinentalUS()}
          testId="button-map-us"
          tooltip="Continental US"
        />
      </UIButtonContainer>
      <MapPanControls />
      <UIButtonContainer className="map-reset-container">
        <UIButton
          className="top bottom"
          disabled={!graph.canReset}
          Icon={MapResetIcon}
          onClick={() => graph.reset()}
          testId="button-map-reset"
          tooltip="Reset Map View"
        />
      </UIButtonContainer>
      <UIButtonContainer className="legend-container">
        <UIButton
          active={ui.displayLegend}
          className="top bottom"
          Icon={LegendIcon}
          onClick={() => ui.setDisplayLegend(!ui.displayLegend)}
          testId="button-legend"
          tooltip={ui.displayLegend ? "Hide Legend" : "Show Legend"}
        />
      </UIButtonContainer>
      <LegendAttributeSelectors />
      <Box className="visibility-controls">
        <VStack align="start" spacing={0.5}>
          <Text fontSize="xs" fontWeight="bold" mb={0.5}>Show Points:</Text>
          <Checkbox 
            isChecked={ui.showSelectedPoints}
            onChange={() => ui.toggleShowSelectedPoints()}
            data-testid="checkbox-selected-points"
            colorScheme="blue"
            size="sm"
            isDisabled={ui.seeThroughMode}
          >
            <Text fontSize="xs">Selected</Text>
          </Checkbox>
          <Checkbox 
            isChecked={ui.showUnselectedPoints}
            onChange={() => ui.toggleShowUnselectedPoints()}
            data-testid="checkbox-unselected-points"
            colorScheme="blue"
            size="sm"
            isDisabled={ui.seeThroughMode}
          >
            <Text fontSize="xs">Unselected</Text>
          </Checkbox>
          
          <Divider my={1} />
          
          <HStack width="100%" justify="space-between">
            <Text fontSize="xs" fontWeight="medium">See-Through Mode:</Text>
            <Switch 
              size="sm"
              colorScheme="blue"
              isChecked={ui.seeThroughMode}
              onChange={() => ui.toggleSeeThroughMode()}
              data-testid="switch-see-through-mode"
            />
          </HStack>
          
          {ui.seeThroughMode && (
            <Box pt={1} width="100%">
              <Text fontSize="xs" mb={1}>Unselected Points Opacity:</Text>
              <Slider
                aria-label="opacity-slider"
                min={0}
                max={1}
                step={0.01}
                value={ui.unselectedPointsOpacity}
                onChange={(val) => ui.setUnselectedPointsOpacity(val)}
                colorScheme="blue"
                size="sm"
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb boxSize={3} />
              </Slider>
              <HStack justify="space-between" mt={1}>
                <Text fontSize="9px">0%</Text>
                <Text fontSize="9px">{Math.round(ui.unselectedPointsOpacity * 100)}%</Text>
                <Text fontSize="9px">100%</Text>
              </HStack>
            </Box>
          )}
        </VStack>
      </Box>
      <UIButtonContainer className="mode-container horizontal">
        <UIButton
          active={ui.mode === "pointer"}
          className="horizontal left"
          Icon={PointIcon}
          onClick={() => ui.setMode("pointer")}
          noActiveHover={true}
          testId="button-pointer-mode"
          tooltip="Point Selection Mode"
        />
        <UIButton
          active={ui.mode === "marquee"}
          className="horizontal right"
          Icon={MarqueeIcon}
          onClick={() => ui.setMode("marquee")}
          noActiveHover={true}
          testId="button-marquee-mode"
          tooltip="Marquee Selection Mode"
        />
      </UIButtonContainer>
      <TimeSlider />
    </>
  );
});
