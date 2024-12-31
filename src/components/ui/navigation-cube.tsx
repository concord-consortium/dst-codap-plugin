import { observer } from "mobx-react-lite";
import React from "react";
import { dstCamera } from "../../models/camera";
import { kUIPivotChange, kUIRotationChange } from "../../utilities/constants";
import { ArrowButton } from "./arrow-button";
import "./navigation-cube.scss";

export const NavigationCube = observer(function NavigationCube() {
  return (
    <div className="navigation-cube-container">
      <ArrowButton direction="left" onClick={() => dstCamera.setRotation(dstCamera.rotation + kUIRotationChange)} />
      <ArrowButton direction="right" onClick={() => dstCamera.setRotation(dstCamera.rotation - kUIRotationChange)} />
      <ArrowButton
        direction="up"
        disabled={!dstCamera.canPivotUp}
        onClick={() => dstCamera.setPivot(dstCamera.pivot + kUIPivotChange)}
      />
      <ArrowButton
        direction="down"
        disabled={!dstCamera.canPivotDown}
        onClick={() => dstCamera.setPivot(dstCamera.pivot - kUIPivotChange)}
      />
    </div>
  );
});
