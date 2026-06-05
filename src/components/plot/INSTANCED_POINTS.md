# Instanced point rendering

`instanced-points.tsx` replaces the per-case React `Point` components (`points.tsx` /
`point.tsx`, now unused) with two `THREE.InstancedMesh`es — one for the fill, one for
the outline ring — so a dataset of ~500K rows renders as 2 draw calls instead of
N React components / N meshes.

## How it works

- **One React render per case-list change.** The component is an `observer` that reads
  only `codapData.caseIds`. Selection, camera, graph bounds, ui toggles and legend
  changes never re-render React; they're handled by three MobX `autorun`s inside an
  effect (see "Reactivity split" below). When `caseIds` changes, the instanced meshes
  remount (their `count` arg changes) and the effect re-runs.

- **Source caches.** On data/legend change (`rebuildData`), per-case `lat`, `lon`,
  `date` and `size` are read once into typed arrays and the fill `instanceColor` is set.
  The hot loop runs inside `untracked()` so it never registers 200K per-case MobX
  dependencies — reactivity comes from coarse signals (attribute names, legend config,
  attribute `changeCount`).

- **Per-frame matrices.** On graph/selection/ui change (`rebuildMatrices`), positions,
  scales, alphas and outline colors are recomputed from the caches with pure arithmetic
  (the same math as `graph.latitudeInGraphSpace` / `convertCaseDateToGraph` /
  `longitudeInGraphSpace`, inlined). Selection is read coarsely via the `.size` atom of
  `dataSet.selection` and `codapData.marqueeSelection`.

- **Per-instance opacity** is carried by a custom `instanceAlpha` buffer attribute,
  multiplied into `gl_FragColor.a` by a small `onBeforeCompile` patch — the only shader
  change. Hidden points are collapsed to scale 0 with alpha 0.

- **Color/size/visibility parity.** Colors come from `point-color-utils.ts`, extracted
  verbatim from `point.tsx` (categorical + numeric + choropleth fallback +
  `DEFAULT_POINT_COLOR`). Sizes come from `sizeDataConfiguration.getLegendSizeForCase`.
  Visibility is the exact AND of `graph.caseIsVisible` and `point.tsx`'s `pointVisible`.

- **Click round-trip** uses `event.instanceId → caseIds[instanceId] → caseId`, then the
  same `selectCases` / `setSelectedCases` calls as the old `Point`. Marquee selection was
  already independent of point rendering (it iterates `caseIds` and projects directly),
  so it is preserved unchanged.

## Reactivity split (why scrub and orbit are cheap)

Three `autorun`s drive the buffers, so each interaction only pays for what changed:

- **`rebuildData`** (data/legend change) — fills the `lat/lon/date/size` caches, the
  fill `instanceColor`, and the `id → index` map. The only loop that calls into the
  MST models. Runs on load and legend/value edits, never on interaction.
- **geometry `autorun`** (graph transform + ui toggles) — calls `writeInstanceFrame`.
  This is what a **date scrub** or pan/zoom hits.
- **selection `autorun`** (selection `.size` atoms) — refills the `selectedFlags`
  `Uint8Array`, then `writeInstanceFrame`.

**Camera orbit changes no observable any of these track, so it triggers zero buffer
rebuilds** — orbit is pure GPU draw. Selection is a typed-array flag (not a
`Set<string>` lookup) precisely so a scrub frame never does string hashing.

## Measured plugin-side performance (headless)

`writeInstanceFrame` is the per-frame hot loop. Its projection math is unit-tested to be
identical to `graph.latitudeInGraphSpace` / `convertCaseDateToGraph` /
`longitudeInGraphSpace` (`src/utilities/__tests__/instance-frame.test.ts`).

`node scripts/bench-instance-frame.mjs` (optimized V8, browser-representative):

> **~8.5 ms/frame for the full recompute at 200K rows (~117 fps recompute-only).**

That leaves ~24 ms of the 33 ms (30 fps) frame for GPU upload + draw on a scrub, and a
scrub is the *worst* case — orbit does no recompute at all. (The same loop measures ~63
ms under `ts-jest`; that is harness/cold-tiering overhead, not the shipped number — the
Jest perf test is only a loose O(n²) regression guard.)

## Measured GPU performance (real Chrome, real GPU)

`scripts/perf-harness.html` renders 200K instances through the *same* two-mesh / 8-seg /
instanceAlpha-shader path as the component, with a faithful scrub phase (direct matrix
writes, colors set once — no `Matrix4.compose`, no per-frame `setColorAt`). It's driven by
`cypress/e2e/instanced-perf.cy.js` in real Chrome (real GPU via ANGLE/Metal, not
SwiftShader). To reproduce:

```
python3 -m http.server 8088 --bind 127.0.0.1 &
npx cypress run --browser chrome --config baseUrl=http://127.0.0.1:8088 \
  --spec cypress/e2e/instanced-perf.cy.js
cat scripts/perf-result.json
```

Result on an Apple M1 Max dev laptop, 200K instances, 8-segment spheres:

> **orbit (draw only): 64 fps  ·  scrub (rewrite + upload + draw): 62 fps**

Both clear their targets (≥50 / ≥30) with headroom. Orbit is the GPU draw ceiling for the
two instanced meshes; scrub adds the full per-frame matrix rewrite + GPU re-upload. On a
weaker integrated GPU these will be lower — the lever is `SPHERE_SEGMENTS` (or dropping the
outline mesh / switching to billboards), and the harness takes `?count=` and `?seg=` query
params for re-measuring.

## Milestone 6 — remaining CODAP-host-gated verification

These three require a running CODAP host importing the 200K Severe NOAA dataset (the
plugin's data round-trip and `rebuildData`'s 200K MST reads can't be isolated without it).
Run `npm start`, load CODAP per the README, import `src/data/NOAA_Storm_Events_Severe.csv`:

- [ ] Initial render (load → first paint) ≤ 3 s. *(`rebuildData` does 200K MST reads once;
      strictly less work than the old per-case React mount.)*
- [ ] Set-aside of 1K cases: no plugin-originated rAF violation > 200 ms (Performance tab;
      ignore `events-*.esm.js` frames — those are CODAP's bundle).
- [ ] Reload Table at 200K rows ≤ 1 s end-to-end.
- [x] Date-range scrub ≥ 30 fps — **measured 62 fps** (see above).
- [x] Camera orbit ≥ 50 fps — **measured 64 fps** (see above).
- [ ] Visual parity vs the old `Point` renderer (swap `<InstancedPoints/>` back to
      `<Points/>` in `scatter-plot.tsx` to A/B): categorical + numeric color legend, size
      legend, selection highlight + outline, date filter, see-through mode, show
      selected / unselected toggles, click + marquee selection.

### Known approximations to tune visually

- **Outline thickness.** The old renderer used drei `<Outlines>`; here the ring is a
  slightly larger back-side instanced sphere. `OUTLINE_THICKNESS_UNSELECTED` /
  `OUTLINE_THICKNESS_SELECTED` are world-space constants picked to look right and may
  need a small tweak against the original.
- **No grow/shrink or hover scale animation.** Selected points jump to their larger size
  instead of tweening, and there is no hover 1.5× scale (hover hit-testing on a
  200K-instance mesh is a deliberately deferred side-quest per the plan's stop
  conditions). Steady-state appearance matches.
- **Missing-date points** are cached at `graph.defaultDate` at cache-build time rather
  than recomputed each frame; only affects cases with no parseable date.

If any color/selection/visibility behavior is meaningfully wrong and the fix isn't
isolated, stop and reassess before layering on more (plan stop condition).
