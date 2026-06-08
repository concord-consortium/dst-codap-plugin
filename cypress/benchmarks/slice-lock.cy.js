// Throwaway visual-verification spec for the slice-lock feature. Not in
// cypress/e2e, so CI skips it. Forms a slice by dragging the lower triangle up,
// screenshots the unlocked affordance, then locks and screenshots again.
describe("slice lock visual check", () => {
  it("forms, then locks a slice", () => {
    cy.visit("/");
    cy.get(".time-slider-container").should("exist");

    // Lower (min) triangle is the 2nd date-range thumb in DOM order.
    cy.get(".date-range-slider-thumb-container").eq(1).find(".slider-thumb").then($t => {
      const r = $t[0].getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy0 = r.top + r.height / 2;
      cy.wrap($t).trigger("pointerdown", { clientX: cx, clientY: cy0, force: true });
      cy.window().trigger("pointermove", { clientX: cx, clientY: cy0 - 70 });
      cy.window().trigger("pointermove", { clientX: cx, clientY: cy0 - 90 });
      cy.window().trigger("pointerup", { clientX: cx, clientY: cy0 - 90 });
    });

    cy.get('[data-testid="slice-lock-button"]').should("exist");
    cy.screenshot("slice-unlocked", { capture: "viewport" });

    cy.get('[data-testid="slice-lock-button"]').click();
    cy.focused().blur();
    cy.window().then(w => w.scrollTo(0, 0));
    cy.wait(150);
    cy.screenshot("slice-locked", { capture: "viewport" });
  });
});
