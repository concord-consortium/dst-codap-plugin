// Manual A/B for the billboarded-quad point renderer vs the current spheres.
// Not in cypress/e2e, so CI skips it. Run against a static server of the repo
// root on :8080 (the harness needs /node_modules + /scripts):
//   python3 -m http.server 8080
//   npx cypress run --browser chrome --spec cypress/benchmarks/quad-vs-sphere.cy.js \
//     --config 'specPattern=cypress/benchmarks/**/*.cy.js,baseUrl=http://localhost:8080'
//
// Captures a screenshot of each mode at a low count (discs/spheres visible) and
// the orbit/scrub fps at 200K for both, writing them to scripts/.
describe("quad vs sphere point renderer", () => {
  const modes = ["spheres", "quads"];

  modes.forEach(mode => {
    it(`renders ${mode} (visual)`, () => {
      cy.visit(`/scripts/perf-harness.html?count=150&mode=${mode}`);
      cy.window({ timeout: 30000 }).its("__perf").should("exist");
      cy.screenshot(`points-${mode}`, { capture: "viewport" });
    });

    it(`benchmarks ${mode} @200K (fps)`, () => {
      cy.visit(`/scripts/perf-harness.html?count=200000&mode=${mode}`);
      cy.window({ timeout: 30000 }).its("__perf").should("exist");
      cy.window().then(win => {
        const p = win.__perf;
        cy.writeFile(`scripts/perf-${mode}.json`, p);
        cy.log(`${mode}: orbit=${p.orbitFps}fps scrub=${p.scrubFps}fps gpu=${p.unmasked}`);
      });
    });
  });
});
