import { observer } from "mobx-react-lite";
import React, { useState } from "react";
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
  const [upperRangePercent, setUpperRangePercent] = useState(1);
  const [lowerRangePercent, setLowerRangePercent] = useState(0);

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
      <TimeLine className="front-line" lowerClip={60} tickClassName="front-tick" upperClip={40} />
      {labelOffsets.map((offset, i) => {
        const percentage = (labelOffsets.length - 1 - i) / (labelOffsets.length - 1);
        return (
          <div key={`label-${i}`} className="time-label" style={{ top: `${labelBaseTop + offset}px` }}>
            {labelFromPercentage(percentage)}
          </div>
        );
      })}
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
    </div>
  );
});
