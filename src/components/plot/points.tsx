import { observer } from "mobx-react-lite";
import React from "react";
import { codapData } from "../../models/codap-data";
import { graph } from "../../models/graph";
import { Point } from "./point";

export const Points = observer(function Points() {
  return (
    <group>
      {codapData.caseIds.map((caseId, i) => {
        return (
          <Point
            key={`point-${caseId}`}
            id={caseId}
            visible={graph.caseIsVisible(caseId)}
            x={graph.latitudeInGraphSpace(codapData.getAttributeNumericValue("Latitude", caseId))}
            y={graph.convertCaseDateToGraph(caseId)}
            z={graph.longitudeInGraphSpace(codapData.getAttributeNumericValue("Longitude", caseId))}
          />
        );
      })}
    </group>
  );
});
