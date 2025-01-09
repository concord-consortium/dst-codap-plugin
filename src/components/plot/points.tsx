import { observer } from "mobx-react-lite";
import React from "react";
import { codapCases } from "../../models/codap-data";
import { convertDate } from "../../utilities/graph-utils";
import { Point } from "./point";

export const Points = observer(function Points() {
  return (
    <group>
      {codapCases.cases.map((aCase, i) => {
        const { id, Latitude, Longitude } = aCase;
        return (
          <Point
            key={id}
            id={id}
            isSelected={codapCases.isSelected(id)}
            Latitude={Latitude ?? 0}
            Longitude={Longitude ?? 0}
            y={convertDate(aCase)}
          />
        );
      })}
    </group>
  );
});
