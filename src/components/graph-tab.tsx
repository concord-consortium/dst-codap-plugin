import { observer } from "mobx-react-lite";
import React from "react";
import HomeIcon from "../assets/icons/home-icon.svg";
import FitAllIcon from "../assets/icons/fit-all-icon.svg";
import MinusIcon from "../assets/icons/minus.svg";
import PlusIcon from "../assets/icons/plus.svg";
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
    </div>
  );
});
