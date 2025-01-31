import { observer } from "mobx-react-lite";
import React from "react";
import { graph } from "../../models/graph";
import { dstAttributeNumericValue, dstCaseIds } from "../../utilities/codap-utils";
import { Point } from "./point";

export const Points = observer(function Points() {
  return (
    <group>
      {dstCaseIds().map((caseId, i) => {
        return (
          <Point
            key={`point-${caseId}`}
            id={caseId}
            visible={graph.caseIsVisible(caseId)}
            x={graph.latitudeInGraphSpace(dstAttributeNumericValue("Latitude", caseId))}
            y={graph.convertCaseDateToGraph(caseId)}
            z={graph.longitudeInGraphSpace(dstAttributeNumericValue("Longitude", caseId))}
          />
        );
      })}
    </group>
  );
});
