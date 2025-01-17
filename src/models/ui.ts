import { makeAutoObservable } from "mobx";

export type modeType = "pointer" | "marquee";

class UI {
  // The name of the orbit controls currently being used.
  // This prevents other orbit controls from updating the camera position.
  activeControls: string | null = null;

  mode: modeType = "pointer";
  displayLegend = true;
  displayXYControls = false;

  constructor() {
    makeAutoObservable(this);
  }

  setActiveControls(name: string) {
    this.activeControls = name;
  }

  setDisplayLegend(display: boolean) {
    this.displayLegend = display;
  }

  setDisplayXYControls(display: boolean) {
    this.displayXYControls = display;
  }

  setMode(mode: modeType) {
    this.mode = mode;
  }
}

export const ui = new UI();
