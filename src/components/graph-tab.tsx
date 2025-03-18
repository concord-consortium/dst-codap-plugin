import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { ScatterPlot } from "./plot/scatter-plot";
import { GraphUI } from "./ui/graph-ui";
import { DstLegend } from "./dst-legend";
import "./graph-tab.scss";

export const GraphTab = observer(function GraphTab() {
  // Add logging to check component rendering
  console.log("Rendering GraphTab component");
  
  useEffect(() => {
    console.log("GraphTab useEffect - component mounted");
  }, []);

  return (
    <div className="graph-tab portal-parent">
      <div className="content-wrapper">
        {/* Map and controls */}
        <div className="map-area">
          <ScatterPlot />
          <GraphUI />
        </div>
        
        {/* Legend at the bottom */}
        <div className="legend-area">
          <DstLegend />
        </div>
      </div>
    </div>
  );
});
