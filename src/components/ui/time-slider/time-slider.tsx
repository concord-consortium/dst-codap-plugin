import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import MapSlider from "../../../assets/icons/map-slider.svg";
import PauseIcon from "../../../assets/icons/pause-icon.svg";
import PlayIcon from "../../../assets/icons/play-icon.svg";
import TimeSliderThumb from "../../../assets/icons/time-slider-thumb.svg";
import { formatDateString } from "../../../utilities/date-utils";
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
let lastFrameTime = Date.now();
const animationRate = 0.1;
let animationTimeout = 0;

interface ITimeSliderProps {
  dateMax: number;
  dateMin: number;
}
export const TimeSlider = observer(function TimeSlider({ dateMax, dateMin }: ITimeSliderProps) {
  const [upperRangePercent, setUpperRangePercent] = useState(1);
  const [lowerRangePercent, setLowerRangePercent] = useState(0);
  const [mapPercent, setMapPercent] = useState(0);
  const [timePercent, setTimePercent] = useState(1);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setMapPercent(value => Math.min(upperRangePercent, Math.max(lowerRangePercent, value)));
    setTimePercent(value => Math.min(upperRangePercent, Math.max(lowerRangePercent, value)));
  }, [upperRangePercent, lowerRangePercent]);

  useEffect(() => {
    if (animating && !animationTimeout) {
      animationTimeout = setTimeout(() => {
        animationTimeout = 0;
        const now = Date.now();
        const delta = (now - lastFrameTime) / 1000;
        lastFrameTime = now;
        const newMapPercent = Math.min(timePercent + animationRate * delta, upperRangePercent);
        setTimePercent(newMapPercent);
        if (newMapPercent >= upperRangePercent) {
          setAnimating(false);
        }
      });
    }
  }, [animating, timePercent, upperRangePercent]);

  const handlePlayButtonClick = () => {
    if (animating) {
      setAnimating(false);
      clearTimeout(animationTimeout);
      animationTimeout = 0;
    } else {
      setAnimating(true);
      lastFrameTime = Date.now();
    }
  };

  const labelFromPercentage = (percentage: number) => {
    const dateValue = dateMin + (dateMax - dateMin) * percentage;
    return formatDateString(new Date(dateValue));
  };

  return (
    <div className="time-slider-container">
      <div className="time-slider-title">z: Time</div>
      <TimeLine className="back-line" tickClassName="back-tick" />
      <TimeLine
        className="middle-line"
        lowerClip={(1 - upperRangePercent) * 100}
        tickClassName="middle-tick"
        upperClip={(1 - lowerRangePercent) * 100}
      />
      <TimeLine
        className="front-line"
        lowerClip={(1 - timePercent) * 100}
        tickClassName="front-tick"
        upperClip={(1 - lowerRangePercent) * 100}
      />
      {labelOffsets.map((offset, i) => {
        const percentage = (labelOffsets.length - 1 - i) / (labelOffsets.length - 1);
        return (
          <div key={`label-${i}`} className="time-label" style={{ top: `${labelBaseTop + offset}px` }}>
            {labelFromPercentage(percentage)}
          </div>
        );
      })}
      <SliderThumb
        className="map-slider-thumb-container left-rounded"
        label={labelFromPercentage(mapPercent)}
        maxPercent={upperRangePercent}
        minPercent={lowerRangePercent}
        percent={mapPercent}
        setPercent={setMapPercent}
        topOffset={mapSliderThumbOffset}
        ThumbIcon={MapSlider}
      />
      <DateRangeSliderThumb
        label={labelFromPercentage(upperRangePercent)}
        minPercent={lowerRangePercent}
        maxPercent={1}
        percent={upperRangePercent}
        setPercent={setUpperRangePercent}
      />
      <DateRangeSliderThumb
        label={labelFromPercentage(lowerRangePercent)}
        minPercent={0}
        maxPercent={upperRangePercent}
        percent={lowerRangePercent}
        setPercent={setLowerRangePercent}
      />
      <SliderThumb
        className="time-slider-thumb-container right-rounded"
        label={labelFromPercentage(timePercent)}
        maxPercent={upperRangePercent}
        minPercent={lowerRangePercent}
        percent={timePercent}
        setPercent={setTimePercent}
        topOffset={timeSliderThumbOffset}
        ThumbIcon={TimeSliderThumb}
      />
      <UIButtonContainer className="play-container">
        <UIButton
          className="play-button top bottom"
          disabled={timePercent >= upperRangePercent}
          Icon={animating ? PauseIcon : PlayIcon}
          onClick={handlePlayButtonClick}
          testId="button-play"
        />
      </UIButtonContainer>
      <div className="play-button-label">{animating ? "Pause" : "Play"}</div>
    </div>
  );
});
