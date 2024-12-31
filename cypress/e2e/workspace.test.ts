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
      // Up button
      ae.getUIButton("button-up").should("be.enabled");
      ae.getUIButton("button-up").click();
      ae.getUIButton("button-up").should("be.enabled");
      ae.getUIButton("button-up").click();
      ae.getUIButton("button-up").should("be.enabled");
      ae.getUIButton("button-up").click();
      ae.getUIButton("button-up").should("not.be.enabled");

      // Down button
      ae.getUIButton("button-down").should("be.enabled");
      ae.getUIButton("button-down").click();
      ae.getUIButton("button-up").should("be.enabled");
      Array(10).fill(1).forEach(() => ae.getUIButton("button-down").click());
      ae.getUIButton("button-down").should("be.enabled");
      ae.getUIButton("button-down").click();
      ae.getUIButton("button-down").should("not.be.enabled");

      // Left button
      ae.getUIButton("button-left").should("be.enabled");
      ae.getUIButton("button-left").click();

      // Right button
      ae.getUIButton("button-right").should("be.enabled");
      ae.getUIButton("button-right").click();

      // Home button
      ae.getUIButton("button-home").should("be.enabled");
      ae.getUIButton("button-home").click();

      // Fit all button
      ae.getUIButton("button-fit-all").should("exist");

      // Zoom in button
      ae.getUIButton("button-zoom-in").should("be.enabled");
      ae.getUIButton("button-zoom-in").click();
      Array(15).fill(1).forEach(() => ae.getUIButton("button-zoom-in").click());
      ae.getUIButton("button-zoom-in").should("be.enabled");
      ae.getUIButton("button-zoom-in").click();
      ae.getUIButton("button-zoom-in").should("not.be.enabled");

      // Zoom out button
      ae.getUIButton("button-home").click();
      ae.getUIButton("button-zoom-out").should("be.enabled");
      ae.getUIButton("button-zoom-out").click();
      Array(11).fill(1).forEach(() => ae.getUIButton("button-zoom-out").click());
      ae.getUIButton("button-zoom-out").should("be.enabled");
      ae.getUIButton("button-zoom-out").click();
      ae.getUIButton("button-zoom-out").should("not.be.enabled");

      // Mode buttons
      ae.getUIButton("button-pointer-mode").should("have.class", "active");
      ae.getUIButton("button-marquee-mode").should("not.have.class", "active");
      ae.getUIButton("button-marquee-mode").click();
      ae.getUIButton("button-pointer-mode").should("not.have.class", "active");
      ae.getUIButton("button-marquee-mode").should("have.class", "active");
      ae.getUIButton("button-pointer-mode").click();
      ae.getUIButton("button-pointer-mode").should("have.class", "active");
      ae.getUIButton("button-marquee-mode").should("not.have.class", "active");

      // Legend button
      ae.getUIButton("button-legend").should("have.class", "active");
      ae.getUIButton("button-legend").click();
      ae.getUIButton("button-legend").should("not.have.class", "active");
      ae.getUIButton("button-legend").click();
      ae.getUIButton("button-legend").should("have.class", "active");

      // XY Controls button
      ae.getUIButton("button-xy-controls").should("not.have.class", "active");
      ae.getUIButton("button-xy-controls").click();
      ae.getUIButton("button-xy-controls").should("have.class", "active");
      ae.getUIButton("button-xy-controls").click();
      ae.getUIButton("button-xy-controls").should("not.have.class", "active");
    });
  });
});
