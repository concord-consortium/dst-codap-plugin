import { AppElements as ae } from "../support/elements/app-elements";

context("Test the overall app", () => {
  beforeEach(() => {
    cy.visit("");
  });

  describe("Desktop functionalities", () => {
    it("renders with text", () => {
      // Since the cypress tests are not running in CODAP, the plugin will not receive responses to API requests,
      // which might cause errors that will display in an overlay, failing the tests.
      ae.getApp().should("contain.text", "CODAP Starter Plugin");
    });
  });
});
