import {observer} from "mobx-react-lite";
import React, {createRef, RefObject, useCallback, useRef, useState, useEffect} from "react";
import { Select, Flex, Text } from "@chakra-ui/react";
import { useDataDisplayLayout } from "../../codap/components/data-display/hooks/use-data-display-layout";
import { DataConfigurationContext } from "../../codap/components/data-display/hooks/use-data-configuration-context";
import { Legend } from "../../codap/components/data-display/components/legend/legend";
import { IBaseLayerModel } from "../../codap/components/data-display/models/base-data-display-content-model";
import { IAttribute } from "../../codap/models/data/attribute";
import { IDataSet } from "../../codap/models/data/data-set";
import { IDstDataConfigurationModel } from "../../models/dst-data-configuration-model";
import { useDstDataDisplayModelContext } from "../hooks/use-dst-data-display-model";
import { datasetConfig } from "../../models/dataset-config";

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

  // Load available attributes from the dataset when it changes
  useEffect(() => {
    if (dataset) {
      const attrs = dataset.attributes;
      setAvailableAttributes(attrs);
    }
  }, [dataset]);

  // Update layout when component mounts to ensure proper initial spacing
  useEffect(() => {
    // Initial layout setup
    const totalHeight = extentsRef.current.reduce((a, b) => a + b, 0);
    if (totalHeight > 0) {
      layout.setDesiredExtent("legend", totalHeight);
    } else {
      // Set a default initial height if no extents are calculated yet
      layout.setDesiredExtent("legend", 320); // Default for two legends (150px each) plus spacing (20px)
    }
    
    // When unmounting, reset the layout
    return () => {
      layout.setDesiredExtent("legend", 0);
    };
  }, [layout]);

  const setDesiredExtent = useCallback((layerIndex: number, extent: number) => {
    // Store the extent for this layer
    extentsRef.current[layerIndex] = Math.max(extent, 150); // Minimum height of 150px to match CSS min-height

    // Calculate total height needed and update layout
    const totalHeight = extentsRef.current.reduce((a, b) => a + b, 0) + 20; // Add 20px for spacing
    layout.setDesiredExtent("legend", totalHeight);

    // Update the height of the div
    const theDivElt = divRefs.current[layerIndex]?.current;
    if (theDivElt) {
      theDivElt.style.height = `${extentsRef.current[layerIndex]}px`;
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
        }
      }
      
      // If this is a size selection, update the datasetConfig size attribute
      if (label === "Size") {
        const attribute = dataset.getAttribute(attributeId);
        if (attribute) {
          datasetConfig.setSizeAttribute(attribute.name);
        }
      }
    } else {
      console.log(`Clearing ${label} attribute`);
      // Reset the attribute when "None" is selected
      dataConfiguration.setAttribute("legend", undefined);
      
      // Reset the corresponding attribute in datasetConfig
      if (label === "Color") {
        datasetConfig.setColorAttribute("");
      } else if (label === "Size") {
        datasetConfig.setSizeAttribute("");
      }
    }
  };

  const renderLegend = (label: string, index: number, dataConfiguration?: IDstDataConfigurationModel) => {
    // Create a dropdown with available attributes
    const legendAttributeId = dataConfiguration?.attributeID("legend");
    const selectedAttribute = legendAttributeId ? dataset?.getAttribute(legendAttributeId) : undefined;
    
    const divRef = divRefs.current[index] || createRef<HTMLDivElement>();
    divRefs.current[index] = divRef;
    
    return (
      <div className="legend" key={index} ref={divRef} style={{flex: "0 0 auto", minHeight: "150px", marginTop: 0}}>
        <div className="legend-section">
          <Flex align="center" mb={2}>
            <Text fontWeight="bold" fontSize="md" mr={2}>{label}:</Text>
            <Select 
              size="sm"
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
          </Flex>
        </div>
        
        {selectedAttribute && (
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
    );
  };

  return (
    <div ref={legendRef} className="multi-legend" style={{overflow: "visible", height: "auto"}}>      
      {renderLegend("Color", 0, dataDisplayModel.colorDataConfiguration)}
      {renderLegend("Size", 1, dataDisplayModel.sizeDataConfiguration)}
    </div>
  );
});
