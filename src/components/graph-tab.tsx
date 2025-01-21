import { observer } from "mobx-react-lite";
import React from "react";
import { ScatterPlot } from "./plot/scatter-plot";
import "./graph-tab.scss";
import { GraphUI } from "./ui/graph-ui";

export const GraphTab = observer(function GraphTab() {
  return (
    <div className="graph-tab">
      <ScatterPlot />
      <GraphUI />
    </div>
  );
});
