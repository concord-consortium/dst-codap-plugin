import clsx from "clsx";
import React from "react";
import { tickOffsets } from "./time-slider-contsants";
import "./time-line.scss";

interface ITicksProps {
  className?: string;
}
function Ticks({ className }: ITicksProps) {
  return (
    <>
      {tickOffsets.map((top, i) => {
        return <div key={i} className={clsx("time-tick", className)} style={{ top }} />;
      })}
    </>
  );
}

interface ITimeLineProps {
  className?: string;
  lowerClip?: number; // Percent from the top to clip at the bottom. 0-100, should be greater than upperClip.
  tickClassName?: string;
  upperClip?: number; // Percent from the top to clip at the top. 0-100.
}
export function TimeLine({ className, lowerClip, tickClassName, upperClip }: ITimeLineProps) {
  const style = lowerClip != null || upperClip != null ? { clipPath:
    `polygon(0% ${upperClip ?? 0}%, 100% ${upperClip ?? 0}%, 100% ${lowerClip ?? 100}%, 0% ${lowerClip ?? 100}%)`
  } : undefined;
  return (
    <div className={clsx("time-line", className)} style={style}>
      <Ticks className={tickClassName} />
    </div>
  );
}
