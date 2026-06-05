// Standalone, browser-representative benchmark of the instanced point renderer's
// per-frame hot loop (src/utilities/instance-frame.ts), run under plain optimized
// V8 rather than ts-jest (whose CJS transform + cold tiering inflates the number
// ~7x). This is the real evidence for the milestone-6 plugin-side perf budget:
// the per-frame CPU recompute at 200K rows must fit well inside a 33 ms (30 fps)
// frame with headroom for GPU upload + draw.
//
//   node scripts/bench-instance-frame.mjs
//
// The loop body is kept byte-for-byte equivalent to writeInstanceFrame so the
// number tracks the shipped code. If you change instance-frame.ts, mirror it here.

const count = 200_000;
const lat = new Float64Array(count), lon = new Float64Array(count);
const date = new Float64Array(count), size = new Float32Array(count);
const flags = new Uint8Array(count);
for (let i = 0; i < count; i++) {
  lat[i] = 20 + ((i * 7919) % 1000) / 1000 * 30;
  lon[i] = -125 + ((i * 104729) % 1000) / 1000 * 60;
  date[i] = 1.5e12 + ((i % 1000) / 1000) * 1e11;
  size[i] = 6;
  if (i % 10 === 0) flags[i] = 1; // ~10% selected
}
const fillM = new Float32Array(count * 16), outM = new Float32Array(count * 16);
const fillA = new Float32Array(count), outA = new Float32Array(count), outC = new Float32Array(count * 3);

function writeMatrix(arr, base, x, y, z, s) {
  arr[base] = s; arr[base + 1] = 0; arr[base + 2] = 0; arr[base + 3] = 0;
  arr[base + 4] = 0; arr[base + 5] = s; arr[base + 6] = 0; arr[base + 7] = 0;
  arr[base + 8] = 0; arr[base + 9] = 0; arr[base + 10] = s; arr[base + 11] = 0;
  arr[base + 12] = x; arr[base + 13] = y; arr[base + 14] = z; arr[base + 15] = 1;
}

function frame(p) {
  const { count: n, flags: fl, lat: la_, lon: lo_, date: dt_, size: sz_,
    minLat, latRange, maxLat, minLon, lonRange, maxLon, centerX, centerZ,
    absMinDate, absDateRange, minDatePercent, currentDatePercent, datePercentSpan, graphMin, graphRange,
    showSelected, showUnselected, seeThrough, unselectedOpacity, pxToWorld, selExtra, otU, otS,
    fillM: fM, outM: oM, fillA: fA, outA: oA, outC: oC } = p;
  for (let i = 0; i < n; i++) {
    const mB = i * 16, cB = i * 3;
    const la = la_[i], lo = lo_[i], dm = dt_[i];
    const sel = fl[i] === 1;
    let hidden = false;
    if (sel && !showSelected) hidden = true;
    else if (!sel && !showUnselected) hidden = true;
    else if (Number.isNaN(la) || Number.isNaN(lo) || Number.isNaN(dm)) hidden = true;
    const dp = (dm - absMinDate) / absDateRange;
    if (!hidden) {
      const inB = la >= minLat && la <= maxLat && lo >= minLon && lo <= maxLon &&
        dp >= minDatePercent && dp <= currentDatePercent;
      if (!inB) hidden = true;
      else if (!sel && seeThrough && unselectedOpacity <= 0) hidden = true;
    }
    if (hidden) { writeMatrix(fM, mB, 0, 0, 0, 0); writeMatrix(oM, mB, 0, 0, 0, 0); fA[i] = 0; oA[i] = 0; continue; }
    const x = ((la - minLat) / latRange) * graphRange + graphMin - centerX;
    const z = ((lo - minLon) / lonRange) * graphRange + graphMin - centerZ;
    const y = ((dp - minDatePercent) / datePercentSpan) * graphRange + graphMin;
    const fr = sz_[i] * pxToWorld + (sel ? selExtra : 0);
    const op = sel ? 1 : (seeThrough ? unselectedOpacity : (showUnselected ? 1 : 0));
    const or = fr + (sel ? otS : otU);
    writeMatrix(fM, mB, x, y, z, fr); writeMatrix(oM, mB, x, y, z, or);
    fA[i] = op; oA[i] = op;
    if (sel) { oC[cB] = 1; oC[cB + 1] = 0; oC[cB + 2] = 0; } else { oC[cB] = 1; oC[cB + 1] = 1; oC[cB + 2] = 1; }
  }
}

const p = {
  count, flags, lat, lon, date, size,
  minLat: 20, latRange: 30, maxLat: 50, minLon: -125, lonRange: 60, maxLon: -65,
  centerX: 0, centerZ: 0, absMinDate: 1.5e12, absDateRange: 1e11,
  minDatePercent: 0, currentDatePercent: 1, datePercentSpan: 1, graphMin: -5, graphRange: 10,
  showSelected: true, showUnselected: true, seeThrough: false, unselectedOpacity: 0.2,
  pxToWorld: 0.0195, selExtra: 0.02, otU: 0.012, otS: 0.03, fillM, outM, fillA, outA, outC,
};

for (let f = 0; f < 50; f++) frame(p); // warm up V8
const N = 200;
const t = performance.now();
for (let f = 0; f < N; f++) frame(p);
const per = (performance.now() - t) / N;
console.log(`per-frame CPU recompute: ${per.toFixed(2)} ms at ${count.toLocaleString()} rows  (~${Math.round(1000 / per)} fps recompute-only; budget is 33 ms for 30 fps)`);
