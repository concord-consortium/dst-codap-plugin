import {observer} from "mobx-react-lite";
import React, {createRef, RefObject, useCallback, useRef} from "react";
import { useBaseDataDisplayModelContext } from "../../codap/components/data-display/hooks/use-base-data-display-model";
import { useDataDisplayLayout } from "../../codap/components/data-display/hooks/use-data-display-layout";
import { DataConfigurationContext } from "../../codap/components/data-display/hooks/use-data-configuration-context";
import { Legend } from "../../codap/components/data-display/components/legend/legend";
import { IBaseLayerModel } from "../../codap/components/data-display/models/base-data-display-content-model";
import { IDataSet } from "../../codap/models/data/data-set";

interface IMultiLegendProps {
  divElt: HTMLDivElement | null
  onChangeAttribute: (dataSet: IDataSet, attrId: string, layer: IBaseLayerModel) => void
}

export const MultiLegend = observer(function MultiLegend({divElt, onChangeAttribute}: IMultiLegendProps) {
  const dataDisplayModel = useBaseDataDisplayModelContext(),
    layout = useDataDisplayLayout(),
    legendRef = useRef() as React.RefObject<HTMLDivElement>,
    divRefs = useRef<RefObject<HTMLDivElement>[]>([]),
    extentsRef = useRef([] as number[]);

  const legendBoundsTop = layout?.computedBounds?.legend?.top ?? 0;

  const setDesiredExtent = useCallback((layerIndex: number, extent: number) => {
      extentsRef.current[layerIndex] = extent;
      layout.setDesiredExtent("legend", extentsRef.current.reduce((a, b) => a + b, 0));
      const theDivElt = divRefs.current[layerIndex].current;
      if (theDivElt) {
        theDivElt.style.height = `${extent}px`;
      }
    }, [layout]);

  const renderLegends = () => {
    return (
      Array.from(dataDisplayModel.layers).filter(aLayer => !!aLayer.dataConfiguration.attributeID("legend"))
        .map(layer => {
            const
              index = layer.layerIndex,
              divRef = divRefs.current[index] || createRef<HTMLDivElement>();
            divRefs.current[index] = divRef;
            return (
              <div className="legend" key={layer.id} ref={divRef} style={{height: `${extentsRef.current[index]}px`}}>
                <DataConfigurationContext.Provider value={layer.dataConfiguration}>
                  <Legend layerIndex={index}
                          setDesiredExtent={setDesiredExtent}
                          onDropAttribute={(place, dataSet, attributeID) => onChangeAttribute(dataSet, attributeID, layer)}
                  />
                </DataConfigurationContext.Provider>
              </div>
            );
          }
        ));
  };

  return (
    <div ref={legendRef} className="multi-legend" style={{top: legendBoundsTop}}>      
      {renderLegends()}
    </div>
  );
});
