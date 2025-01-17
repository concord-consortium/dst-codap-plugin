import React from "react";
import "./plane-controls.scss";

interface PlaneControlsProps {
  zPosition: number;
  onZPositionChange: (value: number) => void;
}

export function PlaneControls({ zPosition, onZPositionChange }: PlaneControlsProps) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-800/80 p-4 rounded-lg plane-controls">
      <label className="flex gap-4">
        <span className="text-white">Z Position: {zPosition.toFixed(1)}</span>
        <input
          type="range"
          min="-5"
          max="5"
          step="0.1"
          value={zPosition}
          onChange={(e) => onZPositionChange(parseFloat(e.target.value))}
          className="w-48"
        />
      </label>
    </div>
  );
}
