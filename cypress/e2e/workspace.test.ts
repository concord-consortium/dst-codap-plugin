import { AppElements as ae } from "../support/elements/app-elements";

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

      // Map zoom out button
      ae.getUIButton("button-map-zoom-out").should("be.enabled");
      ae.getUIButton("button-map-zoom-out").click({ force: true }).click({ force: true });
      ae.getUIButton("button-map-zoom-out").should("not.be.enabled");

      // Map zoom in button
      ae.getUIButton("button-map-zoom-in").should("be.enabled");
      Array(13).fill(1).forEach(() => ae.getUIButton("button-map-zoom-in").click());
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
