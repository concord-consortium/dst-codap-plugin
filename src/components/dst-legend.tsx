import React from "react";
import { observer } from "mobx-react-lite";
import { DndContext, useSensors } from "@dnd-kit/core";

import { BaseDataDisplayModelContext } from "../codap/components/data-display/hooks/use-base-data-display-model";
import { ITileSelection, TileSelectionContext } from "../codap/hooks/use-tile-selection-context";
import { DataDisplayLayoutContext } from "../codap/components/data-display/hooks/use-data-display-layout";
import { DataDisplayLayout } from "../codap/components/data-display/models/data-display-layout";
import { legendComponentManager } from "../codap/components/data-display/components/legend/legend";
import { dstContainer } from "../models/dst-container";
import { IDstDataConfigurationModel } from "../models/dst-data-display-model";
import { CategoricalSizeLegend } from "./legend/categorical-size-legend";
import { MultiLegend } from "./legend/dst-multi-legend";

import "./dst-legend.scss";

// function UnsupportedNumericSize() {
//   return <text>Numeric attributes do not have a size legend yet</text>;
// }

// register our new legend
legendComponentManager.getLegendComponent = (dataConfig) => {
  const type = dataConfig.attributeType("legend");
  const representation = (dataConfig as IDstDataConfigurationModel).legendRepresentation;

  if (representation === "size" && type === "categorical") return CategoricalSizeLegend;

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

// TODO: dynamically compute this height better
// CODAP reduces the graph to give space to the legend. 
// I'm not sure if that has some eventual limits, but we 
// should probably follow the same pattern if so.
const dataDisplayLayout = new DataDisplayLayout({
  tileWidth: 500,
  tileHeight: 440,
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
            <MultiLegend divElt={null} 
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
