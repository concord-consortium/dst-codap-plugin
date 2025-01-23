import { observer } from "mobx-react-lite";
import React from "react";
import { TimeLine } from "./time-line";
import "./time-slider.scss";

export const TimeSlider = observer(function TimeSlider() {
  return (
    <div className="time-slider-container">
      <div className="time-slider-title">z: Time</div>
      <TimeLine className="back-line" tickClassName="back-tick" />
      <TimeLine className="middle-line" lowerClip={80} tickClassName="middle-tick" upperClip={20} />
      <TimeLine className="front-line" lowerClip={60} tickClassName="front-tick" upperClip={40} />
    </div>
  );
});
