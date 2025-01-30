import React from "react";
import DateRangeSliderThumbIcon from "../../../assets/timeslider/date-range-slider-thumb.svg";
import { graph } from "../../../models/graph";
import { SliderThumb } from "./slider-thumb";
import { dateRangeSliderThumbOffset } from "./time-slider-contsants";

interface IDateRangeSliderThumbProps {
  maxPercent: number;
  minPercent: number;
  percent: number;
  setPercent: (value: number) => void;
}
export function DateRangeSliderThumb({
  percent, maxPercent, minPercent, setPercent
}: IDateRangeSliderThumbProps) {
  return (
    <SliderThumb
      className="date-range-slider-thumb-container left-rounded"
      maxPercent={maxPercent}
      minPercent={minPercent}
      percent={percent}
      setPercent={setPercent}
      topOffset={dateRangeSliderThumbOffset}
      ThumbIcon={DateRangeSliderThumbIcon}
    />
  );
}

export function MaxDateRangeSliderThumb() {
  return (
    <DateRangeSliderThumb
      minPercent={graph.minDatePercent + 0.01}
      maxPercent={1}
      percent={graph.maxDatePercent}
      setPercent={percent => graph.setMaxDatePercent(percent)}
    />
  );
}

export function MinDateRangeSliderThumb() {
  return (
    <DateRangeSliderThumb
      minPercent={0}
      maxPercent={graph.maxDatePercent - 0.01}
      percent={graph.minDatePercent}
      setPercent={percent => graph.setMinDatePercent(percent)}
    />
  );
}
