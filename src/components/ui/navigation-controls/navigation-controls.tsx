import { observer } from "mobx-react-lite";
import React from "react";
import { dstCamera } from "../../../models/camera";
import { kUIPivotChange, kUIRotationChange } from "../../../utilities/constants";
import { ArrowButton } from "../arrow-button";
import "./navigation-controls.scss";
import { NavigationCubeContainer } from "./navigation-cube-container";

export const NavigationControls = observer(function NavigationControls() {
  return (
    <div className="navigation-controls">
      <ArrowButton
        className="navigation-cube-arrow"
        direction="left"
        onClick={() => dstCamera.animateBy(0, 0, -kUIRotationChange)}
      />
      <ArrowButton
        className="navigation-cube-arrow"
        direction="right"
        onClick={() => dstCamera.animateBy(0, 0, kUIRotationChange)}
      />
      <ArrowButton
        className="navigation-cube-arrow"
        direction="up"
        disabled={!dstCamera.canPivotDown}
        onClick={() => dstCamera.animateBy(0, -kUIPivotChange, 0)}
      />
      <ArrowButton
        className="navigation-cube-arrow"
        direction="down"
        disabled={!dstCamera.canPivotUp}
        onClick={() => dstCamera.animateBy(0, kUIPivotChange, 0)}
      />
      <NavigationCubeContainer />
    </div>
  );
});
