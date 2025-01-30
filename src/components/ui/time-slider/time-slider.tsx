import clsx from "clsx";
import { observer } from "mobx-react-lite";
import React from "react";
import MapSlider from "../../../assets/icons/map-slider.svg";
import PauseIcon from "../../../assets/icons/pause-icon.svg";
import PlayIcon from "../../../assets/icons/play-icon.svg";
import TimeSliderThumb from "../../../assets/icons/time-slider-thumb.svg";
import { graph } from "../../../models/graph";
import { UIButton } from "../ui-button";
import { UIButtonContainer } from "../ui-button-container";
import { MaxDateRangeSliderThumb, MinDateRangeSliderThumb } from "./date-range-slider-thumb";
import { SliderThumb } from "./slider-thumb";
import { TimeLine } from "./time-line";
import {
  labelHeight, labelOffsets, mapSliderThumbOffset, timeLineTop, timeSliderThumbOffset
} from "./time-slider-contsants";
import "./time-slider.scss";

const labelBaseTop = timeLineTop - labelHeight / 2;

export const TimeSlider = observer(function TimeSlider() {
  // When the max slider is near the bottom of the timeline, we render it above the min slider so the user can
  // move it up.
  const minMaxSlider = graph.maxDatePercent < .03;
  
  return (
    <div className="time-slider-container">
      <div className="time-slider-title">z: Time</div>
      <TimeLine className="back-line" tickClassName="back-tick" />
      <TimeLine
        className="middle-line"
        lowerClip={(1 - graph.maxDatePercent) * 100}
        tickClassName="middle-tick"
        upperClip={(1 - graph.minDatePercent) * 100}
      />
      <TimeLine
        className="front-line"
        lowerClip={(1 - graph.currentDatePercent) * 100}
        tickClassName="front-tick"
        upperClip={(1 - graph.minDatePercent) * 100}
      />
      {labelOffsets.map((offset, i) => {
        const percent = (labelOffsets.length - 1 - i) / (labelOffsets.length - 1);
        return (
          <div key={`label-${i}`} className="time-label" style={{ top: `${labelBaseTop + offset}px` }}>
            {graph.getDateStringFromPercent(percent)}
          </div>
        );
      })}
      <SliderThumb
        className="map-slider-thumb-container left-rounded"
        maxPercent={graph.maxDatePercent}
        minPercent={graph.minDatePercent}
        percent={graph.mapDatePercent}
        setPercent={percent => graph.setMapDatePercent(percent)}
        topOffset={mapSliderThumbOffset}
        ThumbIcon={MapSlider}
      />
      {!minMaxSlider && <MaxDateRangeSliderThumb />}
      <MinDateRangeSliderThumb />
      {minMaxSlider && <MaxDateRangeSliderThumb />}
      <SliderThumb
        className="time-slider-thumb-container right-rounded"
        maxPercent={graph.maxDatePercent}
        minPercent={graph.minDatePercent}
        percent={graph.currentDatePercent}
        setPercent={percent => graph.setCurrentDatePercent(percent)}
        topOffset={timeSliderThumbOffset}
        ThumbIcon={TimeSliderThumb}
      />
      <UIButtonContainer className="play-container">
        <UIButton
          className="play-button top bottom"
          disabled={!graph.canAnimateDate}
          Icon={graph.animatingDate ? PauseIcon : PlayIcon}
          onClick={() => graph.setAnimatingDate(!graph.animatingDate)}
          testId="button-play"
        />
      </UIButtonContainer>
      <div className={clsx("play-button-label", { disabled: !graph.canAnimateDate })}>
        {graph.animatingDate ? "Pause" : "Play"}
      </div>
    </div>
  );
});
