import { observer } from "mobx-react-lite";
import React from "react";
import { ScatterPlot } from "./plot/scatter-plot";
import { GraphUI } from "./ui/graph-ui";
import { DstLegend } from "./dst-legend";
import "./graph-tab.scss";

export const GraphTab = observer(function GraphTab() {
  return (
    <div className="graph-tab portal-parent">
      <ScatterPlot />
      <GraphUI />
      <DstLegend/>
    </div>
  );
});
