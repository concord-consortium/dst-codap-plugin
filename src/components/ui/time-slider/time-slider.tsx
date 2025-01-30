import { observer } from "mobx-react-lite";
import React from "react";
import MapSlider from "../../../assets/icons/map-slider.svg";
import PauseIcon from "../../../assets/icons/pause-icon.svg";
import PlayIcon from "../../../assets/icons/play-icon.svg";
import TimeSliderThumb from "../../../assets/icons/time-slider-thumb.svg";
import { graph } from "../../../models/graph";
import { UIButton } from "../ui-button";
import { UIButtonContainer } from "../ui-button-container";
import { DateRangeSliderThumb } from "./date-range-slider-thumb";
import { SliderThumb } from "./slider-thumb";
import { TimeLine } from "./time-line";
import {
  labelHeight, labelOffsets, mapSliderThumbOffset, timeLineTop, timeSliderThumbOffset
} from "./time-slider-contsants";
import "./time-slider.scss";

const labelBaseTop = timeLineTop - labelHeight / 2;

interface ITimeSliderProps {
  dateMax: number;
  dateMin: number;
}
export const TimeSlider = observer(function TimeSlider({ dateMax, dateMin }: ITimeSliderProps) {
  const handlePlayButtonClick = () => graph.setAnimatingDate(!graph.animatingDate);

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
      <DateRangeSliderThumb
        minPercent={graph.minDatePercent}
        maxPercent={1}
        percent={graph.maxDatePercent}
        setPercent={percent => graph.setMaxDatePercent(percent)}
      />
      <DateRangeSliderThumb
        minPercent={0}
        maxPercent={graph.maxDatePercent}
        percent={graph.minDatePercent}
        setPercent={percent => graph.setMinDatePercent(percent)}
      />
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
          onClick={handlePlayButtonClick}
          testId="button-play"
        />
      </UIButtonContainer>
      <div className="play-button-label">{graph.animatingDate ? "Pause" : "Play"}</div>
    </div>
  );
});
