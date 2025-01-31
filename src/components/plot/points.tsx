import { observer } from "mobx-react-lite";
import React from "react";
import { graph } from "../../models/graph";
import { codapNumberValue, dstCases } from "../../utilities/codap-utils";
import { Point } from "./point";

export const Points = observer(function Points() {
  return (
    <group>
      {dstCases().map((aCase, i) => {
        const { __id__, Latitude, Longitude } = aCase;
        if (i % 100 === 0) console.log(`--- aCase`, aCase, Latitude, codapNumberValue(Latitude));
        return (
          <Point
            key={`point-${__id__}`}
            id={__id__}
            visible={graph.caseIsVisible(aCase)}
            x={graph.latitudeInGraphSpace(codapNumberValue(Latitude))}
            y={graph.convertCaseDate(aCase)}
            z={graph.longitudeInGraphSpace(codapNumberValue(Longitude))}
          />
        );
      })}
    </group>
  );
});
