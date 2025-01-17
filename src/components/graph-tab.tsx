import { observer } from "mobx-react-lite";
import React from "react";
import LegendIcon from "../assets/icons/display-hide-legend-icon.svg";
import XYIcon from "../assets/icons/display-hide-xy-controls-icon.svg";
import HomeIcon from "../assets/icons/home-icon.svg";
import FitAllIcon from "../assets/icons/fit-all-icon.svg";
import MarqueeIcon from "../assets/icons/marquee-select-icon.svg";
import MinusIcon from "../assets/icons/minus.svg";
import PlusIcon from "../assets/icons/plus.svg";
import PointIcon from "../assets/icons/point-selection.svg";
import { dstCamera } from "../models/camera";
import { ui } from "../models/ui";
import { dataRanges } from "../utilities/graph-utils";
import { ScatterPlot } from "./plot/scatter-plot";
import { NavigationControls } from "./ui/navigation-controls/navigation-controls";
import { UIButton } from "./ui/ui-button";
import { UIButtonContainer } from "./ui/ui-button-container";
import "./graph-tab.scss";

export const GraphTab = observer(function GraphTab() {
  return (
    <div className="graph-tab">
      <ScatterPlot />
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
          active={ui.mode === "pointer"}
          className="top"
          Icon={PointIcon}
          onClick={() => ui.setMode("pointer")}
          noActiveHover={true}
          testId="button-pointer-mode"
        />
        <UIButton
          active={ui.mode === "marquee"}
          className="bottom"
          Icon={MarqueeIcon}
          onClick={() => ui.setMode("marquee")}
          noActiveHover={true}
          testId="button-marquee-mode"
        />
      </UIButtonContainer>
      <UIButtonContainer className="legend-container">
        <UIButton
          active={ui.displayLegend}
          className="top bottom"
          Icon={LegendIcon}
          onClick={() => ui.setDisplayLegend(!ui.displayLegend)}
          testId="button-legend"
        />
      </UIButtonContainer>
      <UIButtonContainer className="xy-container">
        <UIButton
          active={ui.displayXYControls}
          className="top bottom"
          Icon={XYIcon}
          onClick={() => ui.setDisplayXYControls(!ui.displayXYControls)}
          testId="button-xy-controls"
        />
      </UIButtonContainer>
      <UIButtonContainer className="map-container">
        <UIButton
          active={ui.mode === "map"}
          className="top bottom"
          Icon={XYIcon}
          onClick={() => ui.setMode("map")}
          testId="button-map-mode"
        />
      </UIButtonContainer>
      {ui.mode === "map" && (
        <UIButtonContainer className="map-controls horizontal">
          <UIButton
            className="horizontal left"
            disabled={!dataRanges.canZoomIn}
            Icon={PlusIcon}
            onClick={() => dataRanges.zoomIn()}
            testId="button-map-zoom-in"
          />
          <UIButton
            className="horizontal right"
            disabled={!dataRanges.canZoomOut}
            Icon={MinusIcon}
            onClick={() => dataRanges.zoomOut()}
            testId="button-map-zoom-out"
          />
        </UIButtonContainer>
      )}
    </div>
  );
});
