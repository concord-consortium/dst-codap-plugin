import { observer } from "mobx-react-lite";
import React, { createRef, RefObject, useCallback, useEffect, useRef } from "react";
import { Text } from "@chakra-ui/react";
import { useDataDisplayLayout } from "../../codap/components/data-display/hooks/use-data-display-layout";
import { DataConfigurationContext } from "../../codap/components/data-display/hooks/use-data-configuration-context";
import { Legend } from "../../codap/components/data-display/components/legend/legend";
import { IBaseLayerModel } from "../../codap/components/data-display/models/base-data-display-content-model";
import { IDataSet } from "../../codap/models/data/data-set";
import { IDstDataConfigurationModel } from "../../models/dst-data-configuration-model";
import { useDstDataDisplayModelContext } from "../hooks/use-dst-data-display-model";
import { useLegendAttributes } from "./use-legend-attributes";

interface IMultiLegendProps {
  divElt: HTMLDivElement | null
  onChangeAttribute: (dataSet: IDataSet, attrId: string, layer: IBaseLayerModel) => void
}

export const DstMultiLegend = observer(function MultiLegend({divElt, onChangeAttribute}: IMultiLegendProps) {
  const dataDisplayModel = useDstDataDisplayModelContext();
  const layout = useDataDisplayLayout();
  const legendRef = useRef() as React.RefObject<HTMLDivElement>;
  const divRefs = useRef<RefObject<HTMLDivElement>[]>([]);
  const extentsRef = useRef([] as number[]);

  const { selectedColorAttribute, selectedSizeAttribute } = useLegendAttributes();

  // Legend bodies stack vertically — pane height is the sum of their extents.
  const kLegendMinHeight = 60;

  useEffect(() => {
    const sum = extentsRef.current.reduce((a, b) => a + (b || 0), 0);
    layout.setDesiredExtent("legend", Math.max(sum, kLegendMinHeight));
    return () => {
      layout.setDesiredExtent("legend", 0);
    };
  }, [layout]);

  const setDesiredExtent = useCallback((layerIndex: number, extent: number) => {
    extentsRef.current[layerIndex] = Math.max(extent, 40);
    const sum = extentsRef.current.reduce((a, b) => a + (b || 0), 0);
    layout.setDesiredExtent("legend", Math.max(sum, kLegendMinHeight));
    const theDivElt = divRefs.current[layerIndex]?.current;
    if (theDivElt) {
      if (extent > 40) {
        theDivElt.style.height = `${extentsRef.current[layerIndex]}px`;
      } else {
        theDivElt.style.height = "";
      }
    }
  }, [layout]);

  const renderLegendBody = (label: "Color" | "Size", index: number,
                            dataConfiguration?: IDstDataConfigurationModel) => {
    const selectedAttribute = label === "Color" ? selectedColorAttribute : selectedSizeAttribute;
    if (!selectedAttribute) return null;

    const divRef = divRefs.current[index] || createRef<HTMLDivElement>();
    divRefs.current[index] = divRef;

    return (
      <div className="legend-body" key={`body-${index}`} ref={divRef}>
        {!selectedAttribute.isTemporary && (
          <div className="legend-display">
            <DataConfigurationContext.Provider value={dataConfiguration}>
              <Legend layerIndex={index}
                     setDesiredExtent={setDesiredExtent}
                     onDropAttribute={(place, dataSet, attributeID) =>
                       onChangeAttribute(dataSet, attributeID, dataDisplayModel.layers[index])}
              />
            </DataConfigurationContext.Provider>
          </div>
        )}
        {selectedAttribute.isTemporary && (
          <div className="legend-display">
            <Text fontSize="xs" mt={1}>
              {label} attribute: {selectedAttribute.name}
              <Text as="em" fontSize="10px" color="gray.500" ml={2}>
                (preview unavailable)
              </Text>
            </Text>
          </div>
        )}
      </div>
    );
  };

  return (
    <div ref={legendRef} className="multi-legend">
      <div className="legend-bodies">
        {renderLegendBody("Color", 0, dataDisplayModel.colorDataConfiguration)}
        {renderLegendBody("Size", 1, dataDisplayModel.sizeDataConfiguration)}
      </div>
    </div>
  );
});
