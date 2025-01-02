import { observer } from "mobx-react-lite";
import React from "react";
import { dstCamera } from "../../models/camera";
import { kUIPivotChange, kUIRotationChange } from "../../utilities/constants";
import { ArrowButton } from "./arrow-button";
import "./navigation-cube.scss";

export const NavigationCube = observer(function NavigationCube() {
  return (
    <div className="navigation-cube-container">
      <ArrowButton direction="left" onClick={() => dstCamera.animateBy(0, 0, kUIRotationChange)} />
      <ArrowButton direction="right" onClick={() => dstCamera.animateBy(0, 0, -kUIRotationChange)} />
      <ArrowButton
        direction="up"
        disabled={!dstCamera.canPivotUp}
        onClick={() => dstCamera.animateBy(0, kUIPivotChange, 0)}
      />
      <ArrowButton
        direction="down"
        disabled={!dstCamera.canPivotDown}
        onClick={() => dstCamera.animateBy(0, -kUIPivotChange, 0)}
      />
    </div>
  );
});
