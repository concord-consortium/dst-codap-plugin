import React from "react";
import { createRoot } from "react-dom/client";

import "./index.scss";
import { ScatterPlot } from "./components/plot/ScatterPlot";

const container = document.getElementById("app");
if (container) {
  const root = createRoot(container);
  root.render(<ScatterPlot />);
}
