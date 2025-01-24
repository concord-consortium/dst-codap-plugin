import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import MapSlider from "../../../assets/icons/map-slider.svg";
import TimeSliderThumb from "../../../assets/icons/time-slider-thumb.svg";
import { formatDateString } from "../../../utilities/date-utils";
import { DateRangeSliderThumb } from "./date-range-slider-thumb";
import { SliderThumb } from "./slider-thumb";
import {
  labelHeight, labelOffsets, mapSliderThumbOffset, timeLineTop, timeSliderThumbOffset
} from "./time-slider-contsants";
import { TimeLine } from "./time-line";
import "./time-slider.scss";

const labelBaseTop = timeLineTop - labelHeight / 2;

interface ITimeSliderProps {
  dateMax: number;
  dateMin: number;
}
export const TimeSlider = observer(function TimeSlider({ dateMax, dateMin }: ITimeSliderProps) {
  const [upperRangePercent, setUpperRangePercent] = useState(1);
  const [lowerRangePercent, setLowerRangePercent] = useState(0);
  const [mapPercent, setMapPercent] = useState(0);
  const [timePercent, setTimePercent] = useState(1);

  useEffect(() => {
    setMapPercent(value => Math.min(upperRangePercent, Math.max(lowerRangePercent, value)));
    setTimePercent(value => Math.min(upperRangePercent, Math.max(lowerRangePercent, value)));
  }, [upperRangePercent, lowerRangePercent]);

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
        containerClassName="map-slider-thumb-container"
        label={labelFromPercentage(mapPercent)}
        labelClassName="left-rounded"
        maxPercent={upperRangePercent}
        minPercent={lowerRangePercent}
        percent={mapPercent}
        setPercent={setMapPercent}
        topOffset={mapSliderThumbOffset}
        thumbClassName="left-rounded-slider-thumb"
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
        containerClassName="time-slider-thumb-container"
        label={labelFromPercentage(timePercent)}
        labelClassName="right-rounded"
        maxPercent={upperRangePercent}
        minPercent={lowerRangePercent}
        percent={timePercent}
        setPercent={setTimePercent}
        topOffset={timeSliderThumbOffset}
        ThumbIcon={TimeSliderThumb}
      />
    </div>
  );
});
