type directionType = "up" | "down" | "left" | "right";
export const AppElements = {
  getApp() {
    return cy.get(".App");
  },
  getTabButton(label: string) {
    return this.getApp().get("button").contains(label);
  },
  getUIButton(testId: string) {
    return this.getApp().get(`[data-testid="${testId}"`);
  },
  getNavigationArrow(direction: directionType) {
    return this.getApp().get(`.navigation-cube-arrow.${direction}`);
  },
  getMapPanButton(direction: directionType) {
    return this.getApp().get(`.map-arrow.${direction}`);
  }
};
