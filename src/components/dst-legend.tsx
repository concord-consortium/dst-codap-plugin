import React from "react";
import { observer } from "mobx-react-lite";
import { DndContext, useSensors } from "@dnd-kit/core";

import { MultiLegend } from "../codap/components/data-display/components/legend/multi-legend";
import { GraphPlace } from "../codap/components/axis-graph-shared";
import { IDataSet } from "../codap/models/data/data-set";
import { BaseDataDisplayModelContext } from "../codap/components/data-display/hooks/use-base-data-display-model";
import { ITileSelection, TileSelectionContext } from "../codap/hooks/use-tile-selection-context";
import { DataDisplayLayoutContext } from "../codap/components/data-display/hooks/use-data-display-layout";
import { DataDisplayLayout } from "../codap/components/data-display/models/data-display-layout";
import { dstContainer } from "../models/dst-container";
import { legendComponentMap } from "../codap/components/data-display/components/legend/legend";
import { CategoricalSizeLegend } from "./legend/categorical-size-legend";

import "./dst-legend.scss";

// register our new legend
legendComponentMap.categoricalSize = CategoricalSizeLegend;

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
  tileHeight: 470,
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
              onDropAttribute={function (place: GraphPlace, dataSet: IDataSet, attrId: string): void {
                // TODO: handle mis-matched dataSet
                const configuration = dstContainer.dataDisplayModel.layers[0].dataConfiguration;
                if (place !== "legend") return;
                configuration.setAttribute(place, {attributeID: attrId});              
              } }    
            />
          </BaseDataDisplayModelContext.Provider>
        </TileSelectionContext.Provider>
      </DataDisplayLayoutContext.Provider>
    </DndContext>

  );
});
