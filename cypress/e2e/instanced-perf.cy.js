// GPU benchmark driver for the instanced point renderer. Visits the standalone
// WebGL harness (scripts/perf-harness.html) in real Chrome (real GPU) and reads
// the measured fps it writes to window.__perf. This is the milestone-6 GPU-side
// evidence the CPU benchmark (scripts/bench-instance-frame.mjs) cannot provide.
//
// Run against a static server of the repo root on :8080, e.g.
//   python3 -m http.server 8080
//   npx cypress run --browser chrome --spec cypress/e2e/instanced-perf.cy.js

describe("instanced points GPU performance @ 200K", () => {
  it("measures orbit and scrub fps", () => {
    cy.visit("/scripts/perf-harness.html?count=200000&seg=8");
    // The harness runs two 3s phases plus warmup; allow generous time.
    cy.window({ timeout: 30000 }).its("__perf").should("exist");
    cy.window().then((win) => {
      const p = win.__perf;
      cy.writeFile("scripts/perf-result.json", p);
      cy.log(`orbit=${p.orbitFps}fps scrub=${p.scrubFps}fps gpu=${p.unmasked}`);
      expect(p.count).to.eq(200000);
    });
  });
});
