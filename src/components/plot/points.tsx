import { observer } from "mobx-react-lite";
import React from "react";
import { codapData } from "../../models/codap-data";
import { graph } from "../../models/graph";
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
            visible={graph.caseIsVisible(aCase)}
            x={graph.latitudeInGraphSpace(Latitude)}
            y={graph.convertCaseDate(aCase)}
            z={graph.longitudeInGraphSpace(Longitude)}
          />
        );
      })}
    </group>
  );
});
