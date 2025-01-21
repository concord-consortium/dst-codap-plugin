import { makeAutoObservable } from "mobx";

export type modeType = "pointer" | "marquee";

class UI {
  // The name of the orbit controls currently being used.
  // This prevents other orbit controls from updating the camera position.
  activeControls: string | null = null;

  mode: modeType = "pointer";
  displayLegend = true;
  displayMapControls = false;

  constructor() {
    makeAutoObservable(this);
  }

  setActiveControls(name: string) {
    this.activeControls = name;
  }

  setDisplayLegend(display: boolean) {
    this.displayLegend = display;
  }

  setDisplayMapControls(display: boolean) {
    this.displayMapControls = display;
  }

  setMode(mode: modeType) {
    this.mode = mode;
  }
}

export const ui = new UI();
