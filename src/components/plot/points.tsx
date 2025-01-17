import { observer } from "mobx-react-lite";
import React from "react";
import { codapData } from "../../models/codap-data";
import { dataRanges } from "../../utilities/graph-utils";
import { Point } from "./point";

export const Points = observer(function Points() {
  return (
    <group>
      {codapData.cases.map((aCase, i) => {
        const { id, Latitude, Longitude } = aCase;
        return (
          <Point
            key={`point-${id}`}
            id={id}
            isSelected={codapData.isSelected(id)}
            x={dataRanges.convertLat(Latitude)}
            y={dataRanges.convertDate(aCase)}
            z={dataRanges.convertLong(Longitude)}
          />
        );
      })}
    </group>
  );
});
