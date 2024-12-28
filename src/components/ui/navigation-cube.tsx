import React from "react";
import { dstCamera } from "../../models/camera";
import { ArrowButton } from "./arrow-button";
import "./navigation-cube.scss";

export function NavigationCube() {
  return (
    <div className="navigation-cube-container">
      <ArrowButton direction="left" onClick={() => dstCamera.setLongitude(dstCamera.longitude + Math.PI / 12)} />
      <ArrowButton direction="right" onClick={() => dstCamera.setLongitude(dstCamera.longitude - Math.PI / 12)} />
      <ArrowButton direction="up" onClick={() => dstCamera.setLatitude(dstCamera.latitude - Math.PI / 12)} />
      <ArrowButton direction="down" onClick={() => dstCamera.setLatitude(dstCamera.latitude + Math.PI / 12)} />
    </div>
  );
}
