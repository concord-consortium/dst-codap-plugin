import { observer } from "mobx-react-lite";
import React from "react";
import { codapData } from "../../models/codap-data";
import { graph } from "../../models/graph";
import { QUAD_LOD_THRESHOLD } from "./quad-instanced-points";

// Diagnostic overlay, shown only with ?debug=1 on the plugin URL. Surfaces the
// state needed to tell apart "data didn't load" vs "date range broken" vs
// "points filtered out" vs "renderer not drawing" without console spelunking.
function fmtDate(ms: number) {
  if (!isFinite(ms)) return "NaN";
  try { return new Date(ms).toISOString().slice(0, 10); } catch { return String(ms); }
}

export const DebugHud = observer(function DebugHud() {
  if (typeof window === "undefined") return null;
  if (new URLSearchParams(window.location.search).get("debug") !== "1") return null;

  const ids = codapData.caseIds;
  const count = ids.length;
  const mode = count >= QUAD_LOD_THRESHOLD ? "quads" : "spheres";

  // Bounded sample so the HUD itself never dominates a 100K-row frame.
  const sample = Math.min(count, 3000);
  let withDate = 0, withGeo = 0, visible = 0;
  for (let i = 0; i < sample; i++) {
    const id = ids[i];
    const d = codapData.getCaseDate(id);
    if (d !== undefined && isFinite(d)) withDate++;
    const lat = codapData.getLatitude(id), lon = codapData.getLongitude(id);
    if (lat != null && lon != null) withGeo++;
    if (graph.caseIsVisible(id)) visible++;
  }

  const lines = [
    `cases: ${count}  mode: ${mode}`,
    `absDate: ${fmtDate(codapData.absoluteMinDate)} … ${fmtDate(codapData.absoluteMaxDate)}`,
    `dateRange: ${codapData.absoluteDateRange}`,
    `datePct min/cur/max: ${graph.minDatePercent.toFixed(2)}/${graph.currentDatePercent.toFixed(2)}/${graph.maxDatePercent.toFixed(2)}`,
    `of ${sample} sampled → withDate:${withDate} withGeo:${withGeo} visible:${visible}`,
  ];

  return (
    <div style={{
      position: "absolute", top: 4, left: 4, zIndex: 9999,
      background: "rgba(0,0,0,0.82)", color: "#3f6", font: "11px/1.5 monospace",
      padding: "6px 9px", whiteSpace: "pre", pointerEvents: "none", borderRadius: 4
    }}>
      {lines.join("\n")}
    </div>
  );
});
