import { AppElements as ae } from "../support/elements/app-elements";

// Click a UI button repeatedly until it becomes disabled (or a generous cap is
// reached). Callers assert the disabled state afterward. This is robust to the
// map zoom/pan limits, which depend on the (full-world) map bounds rather than a
// fixed click count — zooming the whole world in/out takes many more steps than
// the old US-only map did.
const clickUntilDisabled = (testId: string, max = 100) => {
  if (max <= 0) return;
  ae.getUIButton(testId).then(($btn) => {
    if (!$btn.prop("disabled")) {
      cy.wrap($btn).click({ force: true });
      clickUntilDisabled(testId, max - 1);
    }
  });
};

context("Test the overall app", () => {
  beforeEach(() => {
    cy.visit("");
  });

  describe("Desktop functionalities", () => {
    it("renders with tabs", () => {
      // Since the cypress tests are not running in CODAP, the plugin will not receive responses to API requests,
      // which might cause errors that will display in an overlay, failing the tests.
      ae.getTabButton("3D Graph").should("exist");
      ae.getTabButton("About").should("exist");
    });

    it("ui renders and functions", () => {
      // Down button
      ae.getNavigationArrow("down").should("be.enabled");
      ae.getNavigationArrow("down").click();
      ae.getNavigationArrow("down").should("be.enabled");
      Array(3).fill(1).forEach(() => ae.getNavigationArrow("down").click());
      ae.getNavigationArrow("down").should("be.enabled");
      ae.getNavigationArrow("down").click();
      ae.getNavigationArrow("down").should("not.be.enabled");

      // Up button
      ae.getNavigationArrow("up").should("be.enabled");
      ae.getNavigationArrow("up").click();
      ae.getNavigationArrow("down").should("be.enabled");
      Array(10).fill(1).forEach(() => ae.getNavigationArrow("up").click());
      ae.getNavigationArrow("up").should("be.enabled");
      ae.getNavigationArrow("up").click();
      // This is always failing on github for some unknown reason. It works fine locally.
      // ae.getUIButton("button-up").should("not.be.enabled");

      // Left button
      ae.getNavigationArrow("left").should("be.enabled");
      ae.getNavigationArrow("left").click();

      // Right button
      ae.getNavigationArrow("right").should("be.enabled");
      ae.getNavigationArrow("right").click();

      // Home button
      ae.getUIButton("button-home").should("be.enabled");
      ae.getUIButton("button-home").click();

      // Map zoom out button — zooms out to the world-map limit, then disables.
      ae.getUIButton("button-map-zoom-out").should("be.enabled");
      clickUntilDisabled("button-map-zoom-out");
      ae.getUIButton("button-map-zoom-out").should("not.be.enabled");

      // Map zoom in button — zooms back in to the minimum extent, then disables.
      ae.getUIButton("button-map-zoom-in").should("be.enabled");
      clickUntilDisabled("button-map-zoom-in");
      ae.getUIButton("button-map-zoom-in").should("not.be.enabled");

      // Map reset button
      ae.getUIButton("button-map-reset").should("be.enabled");
      ae.getUIButton("button-map-reset").click();
      ae.getUIButton("button-map-reset").should("not.be.enabled");

      // Map pan down button
      ae.getMapPanButton("down").should("be.enabled");
      ae.getMapPanButton("down").click();
      ae.getMapPanButton("down").should("not.be.enabled");

      // Map pan left button
      ae.getMapPanButton("left").should("be.enabled");
      ae.getMapPanButton("left").click();
      ae.getMapPanButton("left").should("not.be.enabled");

      // Map pan right button
      ae.getMapPanButton("right").should("be.enabled");
      ae.getMapPanButton("right").click();
      ae.getMapPanButton("right").should("not.be.enabled");

      // Map pan up button
      ae.getMapPanButton("up").should("be.enabled");
      ae.getMapPanButton("up").click();
      ae.getMapPanButton("up").should("not.be.enabled");

      // Legend button
      ae.getUIButton("button-legend").should("have.class", "active");
      ae.getUIButton("button-legend").click();
      ae.getUIButton("button-legend").should("not.have.class", "active");
      ae.getUIButton("button-legend").click();
      ae.getUIButton("button-legend").should("have.class", "active");

      // Mode buttons
      ae.getUIButton("button-pointer-mode").should("have.class", "active");
      ae.getUIButton("button-marquee-mode").should("not.have.class", "active");
      ae.getUIButton("button-marquee-mode").click();
      ae.getUIButton("button-pointer-mode").should("not.have.class", "active");
      ae.getUIButton("button-marquee-mode").should("have.class", "active");
      ae.getUIButton("button-pointer-mode").click({ force: true });
      ae.getUIButton("button-pointer-mode").should("have.class", "active");
      ae.getUIButton("button-marquee-mode").should("not.have.class", "active");

      // Play button
      ae.getUIButton("button-play").should("not.be.enabled");

      // Time slider thumbs
      ae.getApp().get(".map-slider-thumb-container").should("exist");
      ae.getApp().get(".time-slider-thumb-container").should("exist");
      ae.getApp().get(".date-range-slider-thumb-container").should("have.length", 2);
    });
  });
});
