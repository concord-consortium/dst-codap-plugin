import {observer} from "mobx-react-lite";
import React, {createRef, RefObject, useCallback, useRef, useState, useEffect} from "react";
import { Select, Flex, Text, Spinner } from "@chakra-ui/react";
import { useDataDisplayLayout } from "../../codap/components/data-display/hooks/use-data-display-layout";
import { DataConfigurationContext } from "../../codap/components/data-display/hooks/use-data-configuration-context";
import { Legend } from "../../codap/components/data-display/components/legend/legend";
import { IBaseLayerModel } from "../../codap/components/data-display/models/base-data-display-content-model";
import { IAttribute } from "../../codap/models/data/attribute";
import { IDataSet } from "../../codap/models/data/data-set";
import { IDstDataConfigurationModel } from "../../models/dst-data-configuration-model";
import { useDstDataDisplayModelContext } from "../hooks/use-dst-data-display-model";
import { datasetConfig } from "../../models/dataset-config";
import { getDatasetAttributes } from "../../utilities/codap-dataset-utils";

interface IMultiLegendProps {
  divElt: HTMLDivElement | null
  onChangeAttribute: (dataSet: IDataSet, attrId: string, layer: IBaseLayerModel) => void
}

export const DstMultiLegend = observer(function MultiLegend({divElt, onChangeAttribute}: IMultiLegendProps) {
  const dataDisplayModel = useDstDataDisplayModelContext(),
    layout = useDataDisplayLayout(),
    legendRef = useRef() as React.RefObject<HTMLDivElement>,
    divRefs = useRef<RefObject<HTMLDivElement>[]>([]),
    extentsRef = useRef([] as number[]),
    firstDataConfiguration = dataDisplayModel.layers[0].dataConfiguration,
    dataset = firstDataConfiguration.dataset,
    metadata = firstDataConfiguration.metadata;
  
  // State for available attributes from the dataset
  const [availableAttributes, setAvailableAttributes] = useState<IAttribute[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load available attributes from the dataset when it changes
  useEffect(() => {
    if (dataset) {
      console.log("Dataset available in DstMultiLegend, loading attributes");
      console.log("Initial dataset attributes:", dataset.attributes.map(a => a.name));
      setAvailableAttributes(dataset.attributes);
      
      // Also load attribute names from the current CODAP dataset
      const loadAttributeNames = async () => {
        if (datasetConfig.dataContextName) {
          setIsLoading(true);
          try {
            console.log("Getting dataset attributes for:", datasetConfig.dataContextName);
            const names = await getDatasetAttributes(datasetConfig.dataContextName);
            console.log("Loaded attribute names from CODAP:", names);
            
            // Create attribute objects for any attributes from CODAP not already in the dataset
            const existingAttrNames = new Set(dataset.attributes.map(attr => attr.name));
            console.log("Existing attribute names in dataset:", Array.from(existingAttrNames));
            
            // First create a map of all existing attributes by name
            const attrMap = new Map<string, IAttribute>();
            dataset.attributes.forEach(attr => {
              attrMap.set(attr.name, attr);
            });
            
            // Check for any new attributes from CODAP that aren't in our dataset
            let hasNewAttributes = false;
            
            // For each name from CODAP
            for (const name of names) {
              // If we don't already have this attribute
              if (!existingAttrNames.has(name)) {
                console.log("Found new attribute from CODAP:", name);
                
                // First try to get the attribute by name
                const attrObj = dataset.getAttributeByName(name);
                
                if (attrObj) {
                  console.log("Successfully found attribute object for:", name);
                  attrMap.set(name, attrObj);
                  hasNewAttributes = true;
                } else {
                  // If getAttributeByName fails, create a new attribute object
                  // This handles the case where an attribute exists in CODAP but not in our dataset
                  try {
                    // Create a new temporary attribute - we just need the ID and name for the dropdown
                    const newAttr = {
                      id: `temp_${name.replace(/\s+/g, "_")}`,
                      name
                    };
                    
                    console.log("Created temporary attribute object:", newAttr);
                    
                    // Add this new attribute to our map 
                    // This will be used for display in the dropdown
                    attrMap.set(name, newAttr as IAttribute);
                    hasNewAttributes = true;
                  } catch (error) {
                    console.error("Error creating attribute for:", name, error);
                  }
                }
              }
            }
            
            // If we found any new attributes, update the available attributes
            if (hasNewAttributes) {
              const allAttributes = Array.from(attrMap.values());
              console.log("Updating available attributes:", allAttributes.map(a => a.name));
              setAvailableAttributes(allAttributes);
            } else {
              console.log("No new attributes found to add");
            }
            
            // Find and select the color and size attributes if they're set in the datasetConfig
            if (datasetConfig.colorAttribute && !dataDisplayModel.colorDataConfiguration.attributeID("legend")) {
              const colorAttr = dataset.attributes.find(attr => attr.name === datasetConfig.colorAttribute);
              if (colorAttr) {
                console.log("Setting color attribute from config:", colorAttr.name);
                dataDisplayModel.colorDataConfiguration.setAttribute("legend", {attributeID: colorAttr.id});
              }
            }
            
            if (datasetConfig.sizeAttribute && !dataDisplayModel.sizeDataConfiguration.attributeID("legend")) {
              const sizeAttr = dataset.attributes.find(attr => attr.name === datasetConfig.sizeAttribute);
              if (sizeAttr) {
                console.log("Setting size attribute from config:", sizeAttr.name);
                dataDisplayModel.sizeDataConfiguration.setAttribute("legend", {attributeID: sizeAttr.id});
              }
            }
          } catch (error) {
            console.error("Error loading attribute names:", error);
          } finally {
            setIsLoading(false);
          }
        }
      };
      
      loadAttributeNames();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataset, datasetConfig.dataContextName]);

  // Update layout when component mounts to ensure proper initial spacing
  useEffect(() => {
    // Initial layout setup
    const totalHeight = extentsRef.current.reduce((a, b) => a + b, 0);
    if (totalHeight > 0) {
      layout.setDesiredExtent("legend", totalHeight);
    } else {
      // Set a default initial height if no extents are calculated yet
      layout.setDesiredExtent("legend", 180); // Adjusted for the new window size
    }
    
    // When unmounting, reset the layout
    return () => {
      layout.setDesiredExtent("legend", 0);
    };
  }, [layout]);

  const setDesiredExtent = useCallback((layerIndex: number, extent: number) => {
    // Store the extent for this layer with a minimum height
    extentsRef.current[layerIndex] = Math.max(extent, 75); // Use 75px as minimum height

    // Calculate total height needed and update layout
    const totalHeight = extentsRef.current.reduce((a, b) => a + b, 0) + 10; // Add 10px for spacing
    layout.setDesiredExtent("legend", Math.max(totalHeight, 180)); // Ensure we use at least the minimum height

    // Update the height of the div if needed
    const theDivElt = divRefs.current[layerIndex]?.current;
    if (theDivElt) {
      // Let CSS handle flexible heights
      if (extent > 75) {
        theDivElt.style.height = `${extentsRef.current[layerIndex]}px`;
      } else {
        theDivElt.style.height = ""; // Let CSS flex handle it
      }
    }
  }, [layout]);

  const handleAttributeChange = (label: string, attributeId: string) => {
    if (!dataset) return;

    let dataConfiguration: Maybe<IDstDataConfigurationModel>;
    switch (label) {
      case "Color":
        dataConfiguration = dataDisplayModel.colorDataConfiguration;
        break;
      case "Size":
        dataConfiguration = dataDisplayModel.sizeDataConfiguration;
        break;
    }
    
    if (!dataConfiguration) return;

    if (attributeId) {
      console.log(`Setting ${label} attribute ID: ${attributeId}`);
      
      // Check if this is a temporary attribute (created for display purposes)
      const isTempAttribute = attributeId.startsWith("temp_");
      
      if (isTempAttribute) {
        console.log(`Selected a temporary attribute: ${attributeId}`);
        
        // Get the attribute name from the available attributes
        const attribute = availableAttributes.find(attr => attr.id === attributeId);
        
        if (attribute) {
          console.log(`Handling temporary attribute with name: ${attribute.name}`);
          
          // For temporary attributes, we store the name not the ID
          if (label === "Color") {
            datasetConfig.setColorAttribute(attribute.name);
            console.log(`Updated datasetConfig.colorAttribute to ${attribute.name}`);
          } else if (label === "Size") {
            datasetConfig.setSizeAttribute(attribute.name);
            console.log(`Updated datasetConfig.sizeAttribute to ${attribute.name}`);
          }
          
          // Still set the attribute on the configuration to show the legend
          dataConfiguration.setAttribute("legend", {attributeID: attributeId});
        }
        return;
      }
      
      // Regular attribute handling for non-temporary attributes
      // Set attribute and ensure proper binning type
      if (metadata) {
        metadata.setAttributeBinningType(attributeId, "quantile");
      }
      dataConfiguration.setAttribute("legend", {attributeID: attributeId});
      
      // If this is a color selection, update the datasetConfig color attribute
      if (label === "Color") {
        const attribute = dataset.getAttribute(attributeId);
        if (attribute) {
          datasetConfig.setColorAttribute(attribute.name);
          console.log(`Updated datasetConfig.colorAttribute to ${attribute.name}`);
        }
      }
      
      // If this is a size selection, update the datasetConfig size attribute
      if (label === "Size") {
        const attribute = dataset.getAttribute(attributeId);
        if (attribute) {
          datasetConfig.setSizeAttribute(attribute.name);
          console.log(`Updated datasetConfig.sizeAttribute to ${attribute.name}`);
        }
      }
    } else {
      console.log(`Clearing ${label} attribute`);
      // Reset the attribute when "None" is selected
      dataConfiguration.setAttribute("legend", undefined);
      
      // Reset the corresponding attribute in datasetConfig
      if (label === "Color") {
        datasetConfig.setColorAttribute(undefined);
      } else if (label === "Size") {
        datasetConfig.setSizeAttribute(undefined);
      }
    }
  };

  const renderLegend = (label: string, index: number, dataConfiguration?: IDstDataConfigurationModel) => {
    // Create a dropdown with available attributes
    const legendAttributeId = dataConfiguration?.attributeID("legend");
    const isTempAttribute = legendAttributeId ? legendAttributeId.startsWith("temp_") : false;
    const selectedAttribute = legendAttributeId && !isTempAttribute ? dataset?.getAttribute(legendAttributeId) : undefined;
    
    // For temp attributes, we need to find it in the availableAttributes
    const selectedTempAttribute = isTempAttribute && legendAttributeId 
      ? availableAttributes.find(attr => attr.id === legendAttributeId) 
      : undefined;
    
    const divRef = divRefs.current[index] || createRef<HTMLDivElement>();
    divRefs.current[index] = divRef;
    
    return (
      <div className="legend" key={index} ref={divRef}>
        <div className="legend-section">
          <Flex align="center" mb={1}>
            <Text fontWeight="bold" fontSize="sm" mr={2}>{label}:</Text>
            {isLoading ? (
              <Spinner size="sm" />
            ) : (
              <Select 
                size="xs"
                width="auto"
                value={legendAttributeId || ""}
                onChange={(e) => handleAttributeChange(label, e.target.value)}
                placeholder={`Select attribute`}
              >
                <option value="">None</option>
                {availableAttributes.map(attr => (
                  <option key={attr.id} value={attr.id}>{attr.name}</option>
                ))}
              </Select>
            )}
          </Flex>
          
          {/* Show attribute name for temporary attributes */}
          {selectedTempAttribute && (
            <div className="legend-display">
              <Text fontSize="xs" mt={1}>
                Using attribute: {selectedTempAttribute.name}
                <br />
                <Text as="em" fontSize="10px" color="gray.500">
                  (Full legend visualization not available for this attribute)
                </Text>
              </Text>
            </div>
          )}
          
          {/* For regular attributes, show the full legend */}
          {selectedAttribute && !isTempAttribute && (
            <div className="legend-display">
              <DataConfigurationContext.Provider value={dataConfiguration}>
                <Legend layerIndex={index}
                       setDesiredExtent={setDesiredExtent}
                       onDropAttribute={(place, dataSet, attributeID) => onChangeAttribute(dataSet, attributeID, dataDisplayModel.layers[index])}
                />
              </DataConfigurationContext.Provider>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div ref={legendRef} className="multi-legend">      
      {renderLegend("Color", 0, dataDisplayModel.colorDataConfiguration)}
      {renderLegend("Size", 1, dataDisplayModel.sizeDataConfiguration)}
    </div>
  );
});
