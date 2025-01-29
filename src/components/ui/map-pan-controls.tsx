import { observer } from "mobx-react-lite";
import React from "react";
import MapControlsIcon from "../../assets/icons/display-hide-map-controls-icon.svg";
import MapPanArrowIcon from "../../assets/icons/map-pan-arrow-icon.svg";
import { dstCamera } from "../../models/camera";
import { graph } from "../../models/graph";
import { ArrowButton } from "./arrow-button";
import "./map-pan-controls.scss";

export const MapPanControls = observer(function MapPanControls() {
  return (
    <div className="map-arrow-container" style={{ rotate: `${-dstCamera.rotation * 180 / Math.PI}deg` }}>
      <div className="center-map-container">
        <MapControlsIcon className="center-map" />
      </div>
      <ArrowButton
        className="map-arrow"
        direction="left"
        disabled={!graph.canPanLeft}
        Icon={MapPanArrowIcon}
        onClick={() => graph.panLeft()}
      />
      <ArrowButton
        className="map-arrow"
        direction="right"
        disabled={!graph.canPanRight}
        Icon={MapPanArrowIcon}
        onClick={() => graph.panRight()}
      />
      <ArrowButton
        className="map-arrow"
        direction="up"
        disabled={!graph.canPanUp}
        Icon={MapPanArrowIcon}
        onClick={() => graph.panUp()}
      />
      <ArrowButton
        className="map-arrow"
        direction="down"
        disabled={!graph.canPanDown}
        Icon={MapPanArrowIcon}
        onClick={() => graph.panDown()}
      />
    </div>
  );
});
