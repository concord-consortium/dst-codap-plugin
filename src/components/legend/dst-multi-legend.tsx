import {observer} from "mobx-react-lite";
import React, {createRef, RefObject, useCallback, useRef} from "react";
import { useDataDisplayLayout } from "../../codap/components/data-display/hooks/use-data-display-layout";
import { DataConfigurationContext } from "../../codap/components/data-display/hooks/use-data-configuration-context";
import { Legend } from "../../codap/components/data-display/components/legend/legend";
import { IBaseLayerModel } from "../../codap/components/data-display/models/base-data-display-content-model";
import { IAttribute } from "../../codap/models/data/attribute";
import { IDataSet } from "../../codap/models/data/data-set";
import { IDstDataConfigurationModel } from "../../models/dst-data-configuration-model";
import { useDstDataDisplayModelContext } from "../hooks/use-dst-data-display-model";

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

  const legendBoundsTop = 385;

  const setDesiredExtent = useCallback((layerIndex: number, extent: number) => {
    extentsRef.current[layerIndex] = extent;
    layout.setDesiredExtent("legend", extentsRef.current.reduce((a, b) => a + b, 0));
    const theDivElt = divRefs.current[layerIndex].current;
    if (theDivElt) {
      theDivElt.style.height = `${extent}px`;
    }
  }, [layout]);

  const handleAddLegend = (label: string) => {
    if (!dataset) return;

    let attribute: Maybe<IAttribute>;
    let dataConfiguration: Maybe<IDstDataConfigurationModel>;
    switch (label) {
      case "Color":
        attribute = dataset.getAttributeByName("Magnitude (0-5)");
        dataConfiguration = dataDisplayModel.colorDataConfiguration;
        break;
      case "Size":
        attribute = dataset.getAttributeByName("Injuries");
        dataConfiguration = dataDisplayModel.sizeDataConfiguration;
        break;
    }
    if (!attribute || !dataConfiguration || !metadata) return;

    metadata.setAttributeBinningType(attribute.id, "quantize");    
    dataConfiguration.setAttribute("legend", {attributeID: attribute.id});
  };

  const renderLegend = (label: string, index: number, dataConfiguration?: IDstDataConfigurationModel) => {
    if (!dataConfiguration || !dataConfiguration.attributeID("legend")) {
      return <div onClick={() => handleAddLegend(label)}>To create a {label} Legend click here</div>;
    }

    const divRef = divRefs.current[index] || createRef<HTMLDivElement>();
    divRefs.current[index] = divRef;
    return (
      <div className="legend" key={index} ref={divRef} style={{height: `${extentsRef.current[index]}px`}}>
        <DataConfigurationContext.Provider value={dataConfiguration}>
          <Legend layerIndex={index}
                  setDesiredExtent={setDesiredExtent}
                  onDropAttribute={(place, dataSet, attributeID) => onChangeAttribute(dataSet, attributeID, dataDisplayModel.layers[index])}
          />
        </DataConfigurationContext.Provider>
      </div>
    );
  };

  return (
    <div ref={legendRef} className="multi-legend" style={{top: legendBoundsTop}}>      
      {renderLegend("Color", 0, dataDisplayModel.colorDataConfiguration)}
      {renderLegend("Size", 1, dataDisplayModel.sizeDataConfiguration)}
    </div>
  );
});
