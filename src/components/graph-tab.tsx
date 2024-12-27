import React from "react";
import { Button } from "@chakra-ui/react";
import { dstCamera } from "../models/camera";
import { ScatterPlot } from "./plot/ScatterPlot";

export function GraphTab() {
  return (
    <>
      <Button onClick={() => dstCamera.setLongitude(dstCamera.longitude + Math.PI / 12)}>
        Left
      </Button>
      <Button onClick={() => dstCamera.setLongitude(dstCamera.longitude - Math.PI / 12)}>
        Right
      </Button>
      <Button onClick={() => dstCamera.setLatitude(dstCamera.latitude - Math.PI / 12)}>
        Up
      </Button>
      <Button onClick={() => dstCamera.setLatitude(dstCamera.latitude + Math.PI / 12)}>
        Down
      </Button>
      <Button onClick={() => dstCamera.setRadius(dstCamera.radius - 1)}>
        Zoom in
      </Button>
      <Button onClick={() => dstCamera.setRadius(dstCamera.radius + 1)}>
        Zoom out
      </Button>
      <ScatterPlot />
    </>
  );
}
