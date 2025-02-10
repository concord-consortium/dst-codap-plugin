import React from "react";
import { observer } from "mobx-react-lite";
import { DndContext, useSensors } from "@dnd-kit/core";

import { BaseDataDisplayModelContext } from "../codap/components/data-display/hooks/use-base-data-display-model";
import { ITileSelection, TileSelectionContext } from "../codap/hooks/use-tile-selection-context";
import { DataDisplayLayoutContext } from "../codap/components/data-display/hooks/use-data-display-layout";
import { DataDisplayLayout } from "../codap/components/data-display/models/data-display-layout";
import { legendComponentManager } from "../codap/components/data-display/components/legend/legend";
import { IBaseLegendProps } from "../codap/components/data-display/components/legend/legend-common";
import { dstContainer } from "../models/dst-container";
import { IDstDataConfigurationModel } from "../models/dst-data-configuration-model";
import { kInitialDimensions } from "../utilities/constants";
import { CategoricalSizeLegend } from "./legend/categorical-size-legend";
import { DstMultiLegend } from "./legend/dst-multi-legend";
import { NumericSizeLegend } from "./legend/numeric-size-legend";

import "./dst-legend.scss";

const sizeLegendComponentMap: Partial<Record<string, React.ComponentType<IBaseLegendProps>>> = {
  categorical: CategoricalSizeLegend,
  numeric: NumericSizeLegend
};

// register our new legends
legendComponentManager.getLegendComponent = (dataConfig) => {
  const type = dataConfig.attributeType("legend");
  const representation = (dataConfig as IDstDataConfigurationModel).legendRepresentation;

  if (representation === "size" && type) {
    const component = sizeLegendComponentMap[type];
    if (component) return component;
  }

  // If the representation is size by the type is numeric or date then the result is currently
  // broken. The legend will show as color numeric legend. But the points will get rendered
  // based on a size scale
  return type && legendComponentManager.legendComponentMap[type];
};

const tileSelection: ITileSelection = {
  isTileSelected() {
    throw new Error("Function not implemented.");
  },
  selectTile() {
    throw new Error("Function not implemented.");
  }
};

// TODO: handle this height better
// CODAP reduces the graph to give space to the legend, but the DST cube is not responsive.
const dataDisplayLayout = new DataDisplayLayout({
  tileWidth: kInitialDimensions.width,
  // Need to subtract off the size of the tabs
  tileHeight: kInitialDimensions.height - 50
});

export const DstLegend = observer(function DstLegend() {

  // Disable Drag and Drop
  const sensors = useSensors(
  );

  return (
    <DndContext
      sensors={sensors}
    >
      <DataDisplayLayoutContext.Provider value={dataDisplayLayout}>
        <TileSelectionContext.Provider value={tileSelection}>
          <BaseDataDisplayModelContext.Provider value={dstContainer.dataDisplayModel}>
            <DstMultiLegend divElt={null} 
              onChangeAttribute={function (dataSet, attrId, layer): void {
                // TODO: handle mis-matched dataSet
                if (!layer) {
                  console.warn("No layer available when changing legend attribute");
                  return;
                }
                const configuration = layer.dataConfiguration;
                configuration.setAttribute("legend", {attributeID: attrId});              
              } }    
            />
          </BaseDataDisplayModelContext.Provider>
        </TileSelectionContext.Provider>
      </DataDisplayLayoutContext.Provider>
    </DndContext>

  );
});
