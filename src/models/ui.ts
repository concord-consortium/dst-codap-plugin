import { makeAutoObservable } from "mobx";

export type modeType = "pointer" | "marquee";

class UI {
  // The name of the orbit controls currently being used.
  // This prevents other orbit controls from updating the camera position.
  activeControls: string | null = null;
  // True if we're actively selecting points using the marquee.
  // Suppresses updating selection from codap notifications.
  activeMarquee = false;

  mode: modeType = "pointer";
  displayLegend = true;

  constructor() {
    makeAutoObservable(this);
  }

  setActiveControls(name: string) {
    this.activeControls = name;
  }

  setActiveMarquee(active: boolean) {
    this.activeMarquee = active;
  }

  setDisplayLegend(display: boolean) {
    this.displayLegend = display;
  }

  setMode(mode: modeType) {
    this.mode = mode;
  }
}

export const ui = new UI();
