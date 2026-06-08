import { LockIcon, UnlockIcon } from "@chakra-ui/icons";
import clsx from "clsx";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { graph } from "../../../models/graph";
import { dateRangeSliderThumbOffset, timeLineHeight, timeLineTop } from "./time-slider-contsants";
import "./slice-lock.scss";

// Geometry of the date-range (triangle) thumbs, mirrored here so the connector
// line and lock land exactly on the triangle centers. The thumb container sits
// at left:-45 with the 32px icon at left:67 inside it, so the icon center x is
// -45 + 67 + 16 = 38. Its center y for a given percent is the thumb top
// (timeLineTop + offset + height*(1-percent)) plus half the icon.
const kTriangleIcon = 32;
const kCenterX = -45 + 67 + kTriangleIcon / 2;
const centerY = (percent: number) =>
  timeLineTop + dateRangeSliderThumbOffset + kTriangleIcon / 2 + timeLineHeight * (1 - percent);

// Connects the two range triangles with a dashed line and a lock at the
// midpoint. Appears whenever a slice exists; clicking the lock toggles whether
// the slice is locked (fixed separation, slidable as a unit).
export const SliceLock = observer(function SliceLock() {
  const [hovering, setHovering] = useState(false);
  const [lockHover, setLockHover] = useState(false);

  if (!graph.sliceExists) return null;

  const locked = graph.sliceLocked;
  const topY = centerY(graph.maxDatePercent); // upper triangle (smaller y)
  const bottomY = centerY(graph.minDatePercent); // lower triangle (larger y)
  const midY = (topY + bottomY) / 2;
  const active = hovering || lockHover || locked;

  const LockGlyph = locked ? LockIcon : UnlockIcon;

  return (
    <div
      className={clsx("slice-lock", { active, locked, hovering: hovering || lockHover })}
      onPointerOver={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
    >
      <div className="slice-lock-line" style={{ left: kCenterX, top: topY, height: bottomY - topY }} />
      <button
        type="button"
        className={clsx("slice-lock-button", { grow: lockHover })}
        style={{ left: kCenterX, top: midY }}
        onPointerOver={() => setLockHover(true)}
        onPointerLeave={() => setLockHover(false)}
        onClick={() => graph.toggleSliceLock()}
        aria-pressed={locked}
        aria-label={locked ? "Unlock time slice" : "Lock time slice"}
        title={locked ? "Unlock slice" : "Lock slice in place to slide it"}
        data-testid="slice-lock-button"
      >
        <LockGlyph className="slice-lock-icon" />
      </button>
    </div>
  );
});
