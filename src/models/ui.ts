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
  // Whether to show the dataset configuration panel
  showDatasetConfig = false;
  // Whether to show selected and unselected points in the visualization
  showSelectedPoints = true;
  showUnselectedPoints = true;

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

  /**
   * Sets whether to show the dataset configuration panel
   */
  setShowDatasetConfig(show: boolean) {
    this.showDatasetConfig = show;
  }

  /**
   * Sets whether to show selected points in the visualization
   */
  setShowSelectedPoints(show: boolean) {
    this.showSelectedPoints = show;
  }

  /**
   * Sets whether to show unselected points in the visualization
   */
  setShowUnselectedPoints(show: boolean) {
    this.showUnselectedPoints = show;
  }

  /**
   * Toggles whether to show selected points in the visualization
   */
  toggleShowSelectedPoints() {
    this.showSelectedPoints = !this.showSelectedPoints;
  }

  /**
   * Toggles whether to show unselected points in the visualization
   */
  toggleShowUnselectedPoints() {
    this.showUnselectedPoints = !this.showUnselectedPoints;
  }
}

export const ui = new UI();
