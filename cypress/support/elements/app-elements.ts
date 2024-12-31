export const AppElements = {
  getApp() {
    return cy.get(".App");
  },
  getTabButton(label: string) {
    return this.getApp().get("button").contains(label);
  },
  getUIButton(testId: string) {
    return this.getApp().get(`[data-testid="${testId}"`);
  }
};
