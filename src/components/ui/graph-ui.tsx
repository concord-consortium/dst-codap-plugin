import { observer } from "mobx-react-lite";
import React from "react";
import LegendIcon from "../../assets/icons/display-hide-legend-icon.svg";
import MapControlsIcon from "../../assets/icons/display-hide-map-controls-icon.svg";
import HomeIcon from "../../assets/icons/home-icon.svg";
import FitAllIcon from "../../assets/icons/fit-all-icon.svg";
import MapResetIcon from "../../assets/icons/map-reset-icon.svg";
import MapZoomInIcon from "../../assets/icons/map-zoom-in-icon.svg";
import MapZoomOutIcon from "../../assets/icons/map-zoom-out-icon.svg";
import MarqueeIcon from "../../assets/icons/marquee-select-icon.svg";
import MinusIcon from "../../assets/icons/minus.svg";
import PlusIcon from "../../assets/icons/plus.svg";
import PointIcon from "../../assets/icons/point-selection.svg";
import { dstCamera } from "../../models/camera";
import { graph } from "../../models/graph";
import { ui } from "../../models/ui";
import { ArrowButton } from "./arrow-button";
import { NavigationControls } from "./navigation-controls/navigation-controls";
import { UIButton } from "./ui-button";
import { UIButtonContainer } from "./ui-button-container";

export const GraphUI = observer(function GraphUI() {
  return (
    <>
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
      <UIButtonContainer className="map-controls-toggle-container">
        <UIButton
          active={ui.displayMapControls}
          className="top bottom"
          Icon={MapControlsIcon}
          onClick={() => ui.setDisplayMapControls(!ui.displayMapControls)}
          testId="button-map-controls"
        />
      </UIButtonContainer>
      {ui.displayMapControls && (
        <>
          <UIButtonContainer className="map-reset-container">
            <UIButton
              className="top bottom"
              disabled={!graph.canReset}
              Icon={MapResetIcon}
              onClick={() => graph.reset()}
              testId="button-map-reset"
            />
          </UIButtonContainer>
          <UIButtonContainer className="map-controls-container horizontal">
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
    </>
  );
});
