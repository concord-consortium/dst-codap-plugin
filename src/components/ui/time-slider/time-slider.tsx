import { observer } from "mobx-react-lite";
import React from "react";
import { formatDateString } from "../../../utilities/date-utils";
import { labelHeight, labelOffsets, timeLineTop } from "./time-slider-contsants";
import { TimeLine } from "./time-line";
import "./time-slider.scss";
import { DateRangeSliderThumb } from "./date-range-slider-thumb";

const labelBaseTop = timeLineTop - labelHeight / 2;

interface ITimeSliderProps {
  dateMax: number;
  dateMin: number;
}
export const TimeSlider = observer(function TimeSlider({ dateMax, dateMin }: ITimeSliderProps) {
  return (
    <div className="time-slider-container">
      <div className="time-slider-title">z: Time</div>
      <TimeLine className="back-line" tickClassName="back-tick" />
      <TimeLine className="middle-line" lowerClip={80} tickClassName="middle-tick" upperClip={20} />
      <TimeLine className="front-line" lowerClip={60} tickClassName="front-tick" upperClip={40} />
      {labelOffsets.map((offset, i) => {
        const percentage = (labelOffsets.length - 1 - i) / (labelOffsets.length - 1);
        const dateValue = dateMin + (dateMax - dateMin) * percentage;
        const label = formatDateString(new Date(dateValue));
        return (
          <div key={`label-${i}`} className="time-label" style={{ top: `${labelBaseTop + offset}px` }}>
            {label}
          </div>
        );
      })}
      <DateRangeSliderThumb datePercentage={0} />
      <DateRangeSliderThumb datePercentage={1} />
    </div>
  );
});
