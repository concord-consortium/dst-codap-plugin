import { observer } from "mobx-react-lite";
import React, { createRef, RefObject, useCallback, useEffect, useMemo, useRef } from "react";
import {
  DataDisplayLayoutContext, useDataDisplayLayout
} from "../../codap/components/data-display/hooks/use-data-display-layout";
import { DataConfigurationContext } from "../../codap/components/data-display/hooks/use-data-configuration-context";
import { legendComponentManager } from "../../codap/components/data-display/components/legend/legend";
import { IBaseLayerModel } from "../../codap/components/data-display/models/base-data-display-content-model";
import { IDataSet } from "../../codap/models/data/data-set";
import { IDstDataConfigurationModel } from "../../models/dst-data-configuration-model";
import { useDstDataDisplayModelContext } from "../hooks/use-dst-data-display-model";

interface IMultiLegendProps {
  divElt: HTMLDivElement | null
  // Retained for API compatibility with DstLegend; attribute changes are now
  // made via the cube-space dropdowns, so the bottom-pane legend titles are
  // plain (non-interactive) text.
  onChangeAttribute: (dataSet: IDataSet, attrId: string, layer: IBaseLayerModel) => void
}

// Reserved height for each plain legend title, above its legend graphic.
const kLegendTitleHeight = 18;

export const DstMultiLegend = observer(function MultiLegend(_props: IMultiLegendProps) {
  const dataDisplayModel = useDstDataDisplayModelContext();
  const layout = useDataDisplayLayout();
  const legendRef = useRef() as React.RefObject<HTMLDivElement>;
  const divRefs = useRef<RefObject<HTMLDivElement>[]>([]);
  const extentsRef = useRef([] as number[]);

  // The color legend body should render 25px narrower than the size legend.
  // Its width comes from useDataDisplayLayout().tileWidth, shared with the size
  // legend, so wrap only the color body in a layout that reports a reduced
  // tileWidth while delegating everything else (height/extent management,
  // actions) to the real shared layout instance.
  const kColorLegendWidthReduction = 25;
  const colorLayout = useMemo(() => new Proxy(layout, {
    get(target, prop, receiver) {
      if (prop === "tileWidth") {
        return Math.max(0, target.tileWidth - kColorLegendWidthReduction);
      }
      const value = Reflect.get(target, prop, target);
      return typeof value === "function" ? value.bind(target) : value;
    }
  }), [layout]);

  // Legend bodies stack vertically — pane height is the sum of their extents.
  const kLegendMinHeight = 60;

  useEffect(() => {
    const sum = extentsRef.current.reduce((a, b) => a + (b || 0), 0);
    layout.setDesiredExtent("legend", Math.max(sum, kLegendMinHeight));
    return () => {
      layout.setDesiredExtent("legend", 0);
    };
  }, [layout]);

  // The legend component reports the height of its graphic; reserve extra space
  // for the title above it.
  const setDesiredExtent = useCallback((layerIndex: number, extent: number) => {
    extentsRef.current[layerIndex] = Math.max(extent, 40) + kLegendTitleHeight;
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
    // Derive the legend straight from the config (reactive via observer) rather
    // than from the async attribute-loader state, so the legend appears as soon as
    // a legend attribute is set — regardless of selection order or load timing.
    if (!dataConfiguration) return null;
    const attrId = dataConfiguration.attributeID("legend");
    if (!attrId) return null;
    const attrName = dataConfiguration.dataset?.getAttribute(attrId)?.name ?? label;

    const divRef = divRefs.current[index] || createRef<HTMLDivElement>();
    divRefs.current[index] = divRef;

    const LegendComponent = legendComponentManager.getLegendComponent(dataConfiguration);

    return (
      <div className="legend-body" key={`body-${index}`} ref={divRef}>
        <div className="legend-title" title={attrName}>{attrName}</div>
        <div className="legend-display">
          <DataDisplayLayoutContext.Provider value={label === "Color" ? colorLayout : layout}>
            <DataConfigurationContext.Provider value={dataConfiguration}>
              {/* Render the legend graphic directly (no LegendAttributeLabel),
                  so the title above is a plain, non-interactive label. */}
              {/* eslint-disable-next-line react/no-unknown-property */}
              <svg className="legend-component" data-testid="legend-component">
                {LegendComponent &&
                  <LegendComponent layerIndex={index} setDesiredExtent={setDesiredExtent} />}
              </svg>
            </DataConfigurationContext.Provider>
          </DataDisplayLayoutContext.Provider>
        </div>
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
