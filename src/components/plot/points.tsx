import { observer } from "mobx-react-lite";
import React from "react";
import { graph } from "../../models/graph";
import { codapNumberValue, dstAttributeValue, dstCaseIds } from "../../utilities/codap-utils";
import { Point } from "./point";

export const Points = observer(function Points() {
  return (
    <group>
      {dstCaseIds().map((caseId, i) => {
        if (i % 100 === 0) console.log(`--- aCase`, caseId);
        return (
          <Point
            key={`point-${caseId}`}
            id={caseId}
            visible={graph.caseIsVisible(caseId)}
            x={graph.latitudeInGraphSpace(codapNumberValue(dstAttributeValue("Latitude", caseId)))}
            y={graph.convertCaseDate(caseId)}
            z={graph.longitudeInGraphSpace(codapNumberValue(dstAttributeValue("Longitude", caseId)))}
          />
        );
      })}
    </group>
  );
});
