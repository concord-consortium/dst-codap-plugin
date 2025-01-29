import React from "react";
import DateRangeSliderThumbIcon from "../../../assets/icons/date-range-slider-thumb.svg";
import { SliderThumb } from "./slider-thumb";
import { dateRangeSliderThumbOffset } from "./time-slider-contsants";

interface IDateRangeSliderThumbProps {
  label: string;
  maxPercent: number;
  minPercent: number;
  percent: number;
  setPercent: (value: number) => void;
}
export function DateRangeSliderThumb({
  percent, label, maxPercent, minPercent, setPercent
}: IDateRangeSliderThumbProps) {
  return (
    <SliderThumb
      className="date-range-slider-thumb-container left-rounded"
      label={label}
      maxPercent={maxPercent}
      minPercent={minPercent}
      percent={percent}
      setPercent={setPercent}
      topOffset={dateRangeSliderThumbOffset}
      ThumbIcon={DateRangeSliderThumbIcon}
    />
  );
}
