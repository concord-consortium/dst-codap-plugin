# Chromebook benchmark — spheres vs billboarded quads

The one proof I can't produce: orbit/scrub fps at 200K points on a representative
Chromebook. Everything else (geometry/selected/see-through parity, picking logic,
`npm test`, `npm run lint:build`) is green and committed on
`perf/billboarded-instanced-quads`.

## Run it (on the Chromebook, in Chrome)

The harness needs the repo root served (it imports `/node_modules/three` and
`/scripts`), so serve the repo and open the two URLs:

```bash
# in the repo root
python3 -m http.server 8080
```

Then open each and read the on-screen fps (also on `window.__perf`):

```
http://localhost:8080/scripts/perf-harness.html?count=200000&mode=spheres
http://localhost:8080/scripts/perf-harness.html?count=200000&mode=quads
```

If the Chromebook can't serve locally, push the branch and run the harness from
the deploy, or sideload the repo — the harness is a single static file plus
three.

## Pass bar (from the goal)

- **orbit ≥ 50 fps**, **scrub ≥ 30 fps** at 200K, `mode=quads`.
- And quads must **materially beat** spheres on that hardware (stop-condition 5:
  if they don't, the premise is wrong — tell me and we reconsider).

## Reference: local baseline (NOT the proof)

Apple M1 Max, ANGLE Metal, 200K points — for sanity only; a Chromebook iGPU will
be far lower, which is the whole point:

| mode    | orbit | scrub |
|---------|-------|-------|
| spheres | 57    | 59    |
| quads   | 120   | 120   |

Spheres are GPU-bound at ~57; quads hit the 120 Hz vsync cap. The gap should be
*larger* on a weak GPU (spheres bottleneck harder). Capture the Chromebook's two
numbers into a before/after note and send them back.

## State-by-state visual parity (already captured)

`cypress/benchmarks/quad-vs-sphere.cy.js` renders both modes in default,
`select=0.25` (selected), and `select=0.25&seethrough=1` (see-through). Run:

```bash
python3 -m http.server 8081
npx cypress run --browser chrome --spec cypress/benchmarks/quad-vs-sphere.cy.js \
  --config 'specPattern=cypress/benchmarks/**/*.cy.js,baseUrl=http://localhost:8081'
```

Screenshots land in `cypress/screenshots/quad-vs-sphere.cy.js/`.
