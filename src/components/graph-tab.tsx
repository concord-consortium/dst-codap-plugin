import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import LegendIcon from "../assets/icons/display-hide-legend-icon.svg";
import XYIcon from "../assets/icons/display-hide-xy-controls-icon.svg";
import HomeIcon from "../assets/icons/home-icon.svg";
import FitAllIcon from "../assets/icons/fit-all-icon.svg";
import MarqueeIcon from "../assets/icons/marquee-select-icon.svg";
import MinusIcon from "../assets/icons/minus.svg";
import PlusIcon from "../assets/icons/plus.svg";
import PointIcon from "../assets/icons/point-selection.svg";
import { dstCamera } from "../models/camera";
import { modeType } from "../types/ui-types";
import { ScatterPlot } from "./plot/scatter-plot";
import { NavigationControls } from "./ui/navigation-controls/navigation-controls";
import { UIButton } from "./ui/ui-button";
import { UIButtonContainer } from "./ui/ui-button-container";
import { DstLegend } from "./dst-legend";
import "./graph-tab.scss";

export const GraphTab = observer(function GraphTab() {
  const [mode, setMode] = useState<modeType>("pointer");
  const [displayLegend, setDisplayLegend] = useState(true);
  const [displayXYControls, setDisplayXYControls] = useState(false);

  return (
    <div className="graph-tab portal-parent">
      <ScatterPlot mode={mode} />
      <NavigationControls />
      <UIButtonContainer className="zoom-container">
        <UIButton
          className="top"
          disabled={dstCamera.isHome}
          Icon={HomeIcon}
          onClick={() => dstCamera.resetHome()}
          testId="button-home"
        />
        <UIButton disabled={true} Icon={FitAllIcon} testId="button-fit-all" />
        <UIButton
          disabled={!dstCamera.canZoomIn}
          Icon={PlusIcon}
          onClick={() => dstCamera.zoomIn()}
          testId="button-zoom-in"
        />
        <UIButton
          className="bottom"
          disabled={!dstCamera.canZoomOut}
          Icon={MinusIcon}
          onClick={() => dstCamera.zoomOut()}
          testId="button-zoom-out"
        />
      </UIButtonContainer>
      <UIButtonContainer className="mode-container">
        <UIButton
          active={mode === "pointer"}
          className="top"
          Icon={PointIcon}
          onClick={() => setMode("pointer")}
          noActiveHover={true}
          testId="button-pointer-mode"
        />
        <UIButton
          active={mode === "marquee"}
          className="bottom"
          Icon={MarqueeIcon}
          onClick={() => setMode("marquee")}
          noActiveHover={true}
          testId="button-marquee-mode"
        />
      </UIButtonContainer>
      <UIButtonContainer className="legend-container">
        <UIButton
          active={displayLegend}
          className="top bottom"
          Icon={LegendIcon}
          onClick={() => setDisplayLegend(!displayLegend)}
          testId="button-legend"
        />
      </UIButtonContainer>
      <UIButtonContainer className="xy-container">
        <UIButton
          active={displayXYControls}
          className="top bottom"
          Icon={XYIcon}
          onClick={() => setDisplayXYControls(!displayXYControls)}
          testId="button-xy-controls"
        />
      </UIButtonContainer>
      <DstLegend/>
    </div>
  );
});
