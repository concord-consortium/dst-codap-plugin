import { observer } from "mobx-react-lite";
import React from "react";
import LegendIcon from "../../assets/icons/display-hide-legend-icon.svg";
import HomeIcon from "../../assets/icons/home-icon.svg";
import MapResetIcon from "../../assets/icons/map-reset-icon.svg";
import MapZoomInIcon from "../../assets/icons/map-zoom-in-icon.svg";
import MapZoomOutIcon from "../../assets/icons/map-zoom-out-icon.svg";
import MarqueeIcon from "../../assets/icons/marquee-select-icon.svg";
import PointIcon from "../../assets/icons/point-selection.svg";
import { dstCamera } from "../../models/camera";
import { graph } from "../../models/graph";
import { ui } from "../../models/ui";
import { MapPanControls } from "./map-pan-controls";
import { NavigationControls } from "./navigation-controls/navigation-controls";
import { TimeSlider } from "./time-slider/time-slider";
import { UIButton } from "./ui-button";
import { UIButtonContainer } from "./ui-button-container";
import "./graph-ui.scss";

export const GraphUI = observer(function GraphUI() {
  return (
    <>
      <NavigationControls />
      <UIButtonContainer className="home-container">
        <UIButton
          className="top bottom"
          disabled={dstCamera.isHome}
          Icon={HomeIcon}
          onClick={() => dstCamera.resetHome()}
          testId="button-home"
        />
      </UIButtonContainer>
      <UIButtonContainer className="map-zoom-container">
        <UIButton
          className="top"
          disabled={!graph.canZoomIn}
          Icon={MapZoomInIcon}
          onClick={() => graph.zoomIn()}
          testId="button-map-zoom-in"
        />
        <UIButton
          className="bottom"
          disabled={!graph.canZoomOut}
          Icon={MapZoomOutIcon}
          onClick={() => graph.zoomOut()}
          testId="button-map-zoom-out"
        />
      </UIButtonContainer>
      <MapPanControls />
      <UIButtonContainer className="map-reset-container">
        <UIButton
          className="top bottom"
          disabled={!graph.canReset}
          Icon={MapResetIcon}
          onClick={() => graph.reset()}
          testId="button-map-reset"
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
      <UIButtonContainer className="mode-container horizontal">
        <UIButton
          active={ui.mode === "pointer"}
          className="horizontal left"
          Icon={PointIcon}
          onClick={() => ui.setMode("pointer")}
          noActiveHover={true}
          testId="button-pointer-mode"
        />
        <UIButton
          active={ui.mode === "marquee"}
          className="horizontal right"
          Icon={MarqueeIcon}
          onClick={() => ui.setMode("marquee")}
          noActiveHover={true}
          testId="button-marquee-mode"
        />
      </UIButtonContainer>
      <TimeSlider />
    </>
  );
});
