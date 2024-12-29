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
import { ScatterPlot } from "./plot/ScatterPlot";
import { NavigationCube } from "./ui/navigation-cube";
import { UIButton } from "./ui/ui-button";
import { UIButtonContainer } from "./ui/ui-button-container";
import "./graph-tab.scss";

export const GraphTab = observer(function GraphTab() {
  return (
    <div className="graph-tab">
      <ScatterPlot />
      <NavigationCube />
      <UIButtonContainer className="zoom-container">
        <UIButton className="top" disabled={dstCamera.isHome} Icon={HomeIcon} onClick={() => dstCamera.resetHome()} />
        <UIButton disabled={true} Icon={FitAllIcon} />
        <UIButton
          disabled={!dstCamera.canZoomIn}
          Icon={PlusIcon}
          onClick={() => dstCamera.setRadius(dstCamera.radius - 1)}
        />
        <UIButton
          className="bottom"
          disabled={!dstCamera.canZoomOut}
          Icon={MinusIcon}
          onClick={() => dstCamera.setRadius(dstCamera.radius + 1)}
        />
      </UIButtonContainer>
      <UIButtonContainer className="mode-container">
        <UIButton className="top" Icon={PointIcon} />
        <UIButton className="bottom" disabled={true} Icon={MarqueeIcon} />
      </UIButtonContainer>
      <UIButtonContainer className="legend-container">
        <UIButton className="top bottom" Icon={LegendIcon} />
      </UIButtonContainer>
      <UIButtonContainer className="xy-container">
        <UIButton className="top bottom" Icon={XYIcon} />
      </UIButtonContainer>
    </div>
  );
});
