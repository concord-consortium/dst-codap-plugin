import { ui } from "./ui";

describe("UI Model", () => {
  it("should initialize with default values", () => {
    expect(ui.activeControls).toBeNull();
    expect(ui.activeMarquee).toBe(false);
    expect(ui.mode).toBe("pointer");
    expect(ui.displayLegend).toBe(true);
  });

  it("should set active controls", () => {
    ui.setActiveControls("testControls");
    expect(ui.activeControls).toBe("testControls");
  });

  it("should set active marquee", () => {
    ui.setActiveMarquee(true);
    expect(ui.activeMarquee).toBe(true);
  });

  it("should set display legend", () => {
    ui.setDisplayLegend(false);
    expect(ui.displayLegend).toBe(false);
  });

  it("should set mode", () => {
    ui.setMode("marquee");
    expect(ui.mode).toBe("marquee");
  });
});
