import { observer } from "mobx-react-lite";
import React from "react";
import { dstCamera } from "../../models/camera";
import { ArrowButton } from "./arrow-button";
import "./navigation-cube.scss";

export const NavigationCube = observer(function NavigationCube() {
  return (
    <div className="navigation-cube-container">
      <ArrowButton direction="left" onClick={() => dstCamera.setLongitude(dstCamera.longitude + Math.PI / 12)} />
      <ArrowButton direction="right" onClick={() => dstCamera.setLongitude(dstCamera.longitude - Math.PI / 12)} />
      <ArrowButton
        direction="up"
        disabled={!dstCamera.canPivotUp}
        onClick={() => dstCamera.setLatitude(dstCamera.latitude + Math.PI / 12)}
      />
      <ArrowButton
        direction="down"
        disabled={!dstCamera.canPivotDown}
        onClick={() => dstCamera.setLatitude(dstCamera.latitude - Math.PI / 12)}
      />
    </div>
  );
});
