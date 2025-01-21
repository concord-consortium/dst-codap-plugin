import { observer } from "mobx-react-lite";
import React from "react";
import LegendIcon from "../assets/icons/display-hide-legend-icon.svg";
import MapControlsIcon from "../assets/icons/display-hide-map-controls-icon.svg";
import HomeIcon from "../assets/icons/home-icon.svg";
import FitAllIcon from "../assets/icons/fit-all-icon.svg";
import MapZoomInIcon from "../assets/icons/map-zoom-in-icon.svg";
import MapZoomOutIcon from "../assets/icons/map-zoom-out-icon.svg";
import MarqueeIcon from "../assets/icons/marquee-select-icon.svg";
import MinusIcon from "../assets/icons/minus.svg";
import PlusIcon from "../assets/icons/plus.svg";
import PointIcon from "../assets/icons/point-selection.svg";
import { dstCamera } from "../models/camera";
import { graph } from "../models/graph";
import { ui } from "../models/ui";
import { ScatterPlot } from "./plot/scatter-plot";
import { ArrowButton } from "./ui/arrow-button";
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
          active={ui.displayMapControls}
          className="top bottom"
          Icon={MapControlsIcon}
          onClick={() => ui.setDisplayMapControls(!ui.displayMapControls)}
          testId="button-xy-controls"
        />
      </UIButtonContainer>
      {ui.displayMapControls && (
        <>
          <UIButtonContainer className="map-controls horizontal">
            <UIButton
              className="horizontal left"
              disabled={!graph.canZoomIn}
              Icon={MapZoomInIcon}
              onClick={() => graph.zoomIn()}
              testId="button-map-zoom-in"
            />
            <UIButton
              className="horizontal right"
              disabled={!graph.canZoomOut}
              Icon={MapZoomOutIcon}
              onClick={() => graph.zoomOut()}
              testId="button-map-zoom-out"
            />
          </UIButtonContainer>
          <ArrowButton
            className="map-arrow"
            direction="left"
            disabled={!graph.canPanLeft}
            onClick={() => graph.panLeft()}
          />
          <ArrowButton
            className="map-arrow"
            direction="right"
            disabled={!graph.canPanRight}
            onClick={() => graph.panRight()}
          />
          <ArrowButton
            className="map-arrow"
            direction="up"
            disabled={!graph.canPanUp}
            onClick={() => graph.panUp()}
          />
          <ArrowButton
            className="map-arrow"
            direction="down"
            disabled={!graph.canPanDown}
            onClick={() => graph.panDown()}
          />
        </>
      )}
    </div>
  );
});
