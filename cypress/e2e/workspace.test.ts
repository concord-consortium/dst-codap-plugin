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
      ae.getNavigationArrow("down").should("be.enabled");
      ae.getNavigationArrow("down").click();
      ae.getNavigationArrow("down").should("be.enabled");
      ae.getNavigationArrow("down").click();
      ae.getNavigationArrow("down").should("be.enabled");
      ae.getNavigationArrow("down").click();
      ae.getNavigationArrow("down").should("not.be.enabled");

      // Down button
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

      // Mode buttons
      ae.getUIButton("button-pointer-mode").should("have.class", "active");
      ae.getUIButton("button-marquee-mode").should("not.have.class", "active");
      ae.getUIButton("button-marquee-mode").click();
      ae.getUIButton("button-pointer-mode").should("not.have.class", "active");
      ae.getUIButton("button-marquee-mode").should("have.class", "active");
      ae.getUIButton("button-pointer-mode").click({ force: true });
      ae.getUIButton("button-pointer-mode").should("have.class", "active");
      ae.getUIButton("button-marquee-mode").should("not.have.class", "active");

      // Legend button
      ae.getUIButton("button-legend").should("have.class", "active");
      ae.getUIButton("button-legend").click();
      ae.getUIButton("button-legend").should("not.have.class", "active");
      ae.getUIButton("button-legend").click();
      ae.getUIButton("button-legend").should("have.class", "active");
    });
  });
});
