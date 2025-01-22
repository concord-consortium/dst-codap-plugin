import { observer } from "mobx-react-lite";
import React, { PointerEventHandler, useRef, useState } from "react";
import { Frustum, Matrix4, Vector2, Vector3 } from "three";
import { codapData } from "../../models/codap-data";
import { graph } from "../../models/graph";
import { ui } from "../../models/ui";
import { dstSelectCases } from "../../utilities/codap-utils";
import "./marquee-overlay.scss";

let throttleUpdate = false;

interface IMarqueeOverlayProps {
  cameraRef: React.MutableRefObject<any>;
  containerRef: React.RefObject<HTMLDivElement>;
}
export const MarqueeOverlay = observer(function MarqueeOverlay({ cameraRef, containerRef }: IMarqueeOverlayProps) {
  const [marqueeStartPoint, setMarqueeStartPoint] = useState<Maybe<Vector2>>();
  const [marqueeEndPoint, setMarqueeEndPoint] = useState<Maybe<Vector2>>();
  const ref = useRef<HTMLDivElement>(null);

  const adjustClientX = (clientX: number) => containerRef.current
    ? clientX - containerRef.current.offsetLeft : clientX;
  const adjustClientY = (clientY: number) => containerRef.current
    ? clientY - containerRef.current.offsetTop - 28 : clientY;
  
  const handlePointerDown: PointerEventHandler<HTMLDivElement> = event => {
    if (ui.mode === "marquee" && containerRef.current) {
      setMarqueeStartPoint(new Vector2(adjustClientX(event.clientX), adjustClientY(event.clientY)));
      ui.setActiveMarquee(true);
    }
  };

  const updateMarquee = (event: React.PointerEvent<HTMLDivElement>, forceUpdate = false) => {
    if (ui.mode === "marquee" && marqueeStartPoint && cameraRef.current && ref.current) {
      const adjustedX = adjustClientX(event.clientX);
      const adjustedY = adjustClientY(event.clientY);
      setMarqueeEndPoint(new Vector2(adjustedX, adjustedY));

      const startPoint = new Vector2(
        (marqueeStartPoint.x / ref.current.clientWidth) * 2 - 1,
        -(marqueeStartPoint.y / ref.current.clientHeight) * 2 + 1
      );
      const endPoint = new Vector2(
        (adjustedX / ref.current.clientWidth) * 2 - 1,
        -(adjustedY / ref.current.clientHeight) * 2 + 1
      );

      const frustrum = new Frustum();
      const tempMatrix = new Matrix4();
      cameraRef.current.updateProjectionMatrix();
      cameraRef.current.updateMatrixWorld();
      tempMatrix.multiplyMatrices(cameraRef.current.projectionMatrix, cameraRef.current.matrixWorldInverse);
      frustrum.setFromProjectionMatrix(tempMatrix);

      const selectingPoints = new Set(codapData.cases.filter((aCase) => {
        if (graph.caseIsVisible(aCase)) {
          const x = graph.latitudeInGraphSpace(aCase.Latitude);
          const y = graph.convertDate(aCase);
          const z = graph.longitudeInGraphSpace(aCase.Longitude);
          const ndcPoint = new Vector3(x, y, z).project(cameraRef.current);
          return ndcPoint.x >= Math.min(startPoint.x, endPoint.x) &&
            ndcPoint.x <= Math.max(startPoint.x, endPoint.x) &&
            ndcPoint.y >= Math.min(startPoint.y, endPoint.y) &&
            ndcPoint.y <= Math.max(startPoint.y, endPoint.y);
        }
      }).map((aCase) => aCase.id));

      codapData.replaceSelectedCases(Array.from(selectingPoints));
      if (!throttleUpdate || forceUpdate) {
        throttleUpdate = true;
        dstSelectCases(Array.from(selectingPoints));
        setTimeout(() => throttleUpdate = false, 250);
      }
    }
  };

  const handlePointerMove: PointerEventHandler<HTMLDivElement> = event => {
    updateMarquee(event);
  };

  const handlePointerUp: PointerEventHandler<HTMLDivElement> = event => {
    updateMarquee(event, true);
    setMarqueeStartPoint(undefined);
    setMarqueeEndPoint(undefined);
    ui.setActiveMarquee(false);
  };

  const marqueeStyle = marqueeStartPoint && marqueeEndPoint ? {
    left: `${Math.min(marqueeStartPoint.x, marqueeEndPoint.x)}px`,
    top: `${Math.min(marqueeStartPoint.y, marqueeEndPoint.y)}px`,
    width: `${Math.abs(marqueeEndPoint.x - marqueeStartPoint.x)}px`,
    height: `${Math.abs(marqueeEndPoint.y - marqueeStartPoint.y)}px`,
  } : undefined;

  return (
    <div
      className="marquee-overlay"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      ref={ref}
    >
      {marqueeStyle && <div className="marquee" style={marqueeStyle} />}
    </div>
  );
});
