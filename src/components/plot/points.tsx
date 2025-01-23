import { observer } from "mobx-react-lite";
import React from "react";
import { codapData } from "../../models/codap-data";
import { convertDate } from "../../utilities/graph-utils";
import { Point } from "./point";

export const Points = observer(function Points() {
  return (
    <group>
      {codapData.cases.map((aCase, i) => {
        const { __id__:id, Latitude, Longitude } = aCase;
        return (
          <Point
            key={`point-${id}`}
            id={id}
            Latitude={Latitude ?? 0}
            Longitude={Longitude ?? 0}
            y={convertDate(aCase)}
          />
        );
      })}
    </group>
  );
});
