import React from "react";
import DateRangeSliderThumbIcon from "../../../assets/icons/date-range-slider-thumb.svg";
import { dateRangeSliderThumbHeight, timeLineHeight, timeLineTop } from "./time-slider-contsants";
import "./date-range-slider-thumb.scss";

interface IDateRangeSliderThumbProps {
  datePercentage: number;
}
export function DateRangeSliderThumb({ datePercentage }: IDateRangeSliderThumbProps) {
  const style = { top: `${timeLineTop - dateRangeSliderThumbHeight / 2 + timeLineHeight * datePercentage}px` };
  return (
    <div className="date-range-slider-thumb" style={style}>
      <DateRangeSliderThumbIcon />
    </div>
  );
}
