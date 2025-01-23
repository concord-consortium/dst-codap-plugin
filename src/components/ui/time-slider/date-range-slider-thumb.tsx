import clsx from "clsx";
import React, { useRef, useState } from "react";
import DateRangeSliderThumbIcon from "../../../assets/icons/date-range-slider-thumb.svg";
import { dateRangeSliderThumbOffset, timeLineHeight, timeLineTop } from "./time-slider-contsants";
import "./date-range-slider-thumb.scss";

interface IDateRangeSliderThumbProps {
  label: string;
  minPercent: number;
  maxPercent: number;
  percent: number;
  setPercent: (value: number) => void;
}
export function DateRangeSliderThumb({
  percent, label, minPercent, maxPercent, setPercent
}: IDateRangeSliderThumbProps) {
  const [hovering, setHovering] = useState(false);
  const [pointerDown, setPointerDown] = useState(false);
  const startingPercent = useRef<number>();
  const startingY = useRef<number>();
  const style = { top: `${timeLineTop + dateRangeSliderThumbOffset + timeLineHeight * (1 - percent)}px` };

  const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = event => {
    setPointerDown(true);
    startingPercent.current = percent;
    startingY.current = event.clientY;

    const updatePercent = (e: PointerEvent) => {
      if (startingPercent.current != null && startingY.current != null) {
        const deltaY = startingY.current - e.clientY;
        const newPercent =
          Math.min(maxPercent, Math.max(minPercent, startingPercent.current + deltaY / timeLineHeight));
        setPercent(newPercent);
      }
    };
    window.addEventListener("pointermove", updatePercent);

    const handlePointerUp = (e: PointerEvent) => {
      updatePercent(e);
      setPointerDown(false);
      startingPercent.current = undefined;
      startingY.current = undefined;

      window.removeEventListener("pointermove", updatePercent);
      window.removeEventListener("pointerup", handlePointerUp);
    };
    window.addEventListener("pointerup", handlePointerUp);
  };
  const handlePointerLeave = () => setHovering(false);
  const handlePointerOver = () => setHovering(true);

  const extraClass = pointerDown ? "active" : hovering ? "hover" : "";
  const labelClass = clsx("date-range-slider-thumb-label", extraClass);
  const thumbClass = clsx("date-range-slider-thumb", extraClass);

  return (
    <div className="date-range-slider-thumb-container" style={style}>
      <div className={labelClass}>{label}</div>
      <div
        className={thumbClass}
        onPointerDown={handlePointerDown}
        onPointerLeave={handlePointerLeave}
        onPointerOver={handlePointerOver}
      >
        <DateRangeSliderThumbIcon />
      </div>
    </div>
  );
}
