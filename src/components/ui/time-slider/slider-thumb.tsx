import clsx from "clsx";
import React, { useRef, useState } from "react";
import { graph } from "../../../models/graph";
import { timeLineHeight, timeLineTop } from "./time-slider-contsants";
import "./slider-thumb.scss";

interface ISliderThumbProps {
  className?: string;
  minPercent: number;
  maxPercent: number;
  percent: number;
  setPercent: (value: number) => void;
  topOffset?: number;
  ThumbIcon: React.FC<React.SVGProps<SVGSVGElement>>;
}
export function SliderThumb({
  className, minPercent, maxPercent, percent, setPercent, topOffset, ThumbIcon
}: ISliderThumbProps) {
  const [hovering, setHovering] = useState(false);
  const [pointerDown, setPointerDown] = useState(false);
  const startingPercent = useRef<number>();
  const startingY = useRef<number>();
  const style = { top: `${timeLineTop + (topOffset ?? 0) + timeLineHeight * (1 - percent)}px` };

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
  const labelClass = clsx("slider-thumb-label", extraClass);
  const thumbClass = clsx("slider-thumb", extraClass);

  return (
    <div className={clsx("slider-thumb-container", className)} style={style}>
      <div className={labelClass}>{graph.getDateStringFromPercent(percent)}</div>
      <div
        className={thumbClass}
        onPointerDown={handlePointerDown}
        onPointerLeave={handlePointerLeave}
        onPointerOver={handlePointerOver}
      >
        <ThumbIcon />
      </div>
    </div>
  );
}
