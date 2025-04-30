import { makeAutoObservable } from "mobx";
import { OpacityManager } from "./opacity-manager";

export type modeType = "pointer" | "marquee";

export class UI {
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
  // See-through mode for unselected points
  seeThroughMode = false;
  // Opacity level for unselected points (0-1) when in see-through mode
  unselectedPointsOpacity = 0.2;
  opacityManager: OpacityManager;

  constructor() {
    makeAutoObservable(this);
    this.opacityManager = new OpacityManager();
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
    if (!show) {
      this.opacityManager.setTargetOpacity(0);
    } else if (this.seeThroughMode) {
      this.opacityManager.setTargetOpacity(this.unselectedPointsOpacity);
    } else {
      this.opacityManager.setTargetOpacity(1);
    }
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

  /**
   * Toggles see-through mode for unselected points
   */
  toggleSeeThroughMode() {
    this.seeThroughMode = !this.seeThroughMode;
    if (this.seeThroughMode) {
      this.opacityManager.setTargetOpacity(this.unselectedPointsOpacity);
    } else {
      this.opacityManager.setTargetOpacity(1);
    }
  }

  /**
   * Sets the opacity level for unselected points when in see-through mode
   * @param opacity Opacity value between 0 and 1
   */
  setUnselectedPointsOpacity(opacity: number) {
    // Ensure opacity is between 0 and 1
    this.unselectedPointsOpacity = Math.max(0, Math.min(1, opacity));
    if (this.seeThroughMode && this.showUnselectedPoints) {
      this.opacityManager.setTargetOpacity(this.unselectedPointsOpacity);
    }
  }

  // Cleanup method
  dispose() {
    this.opacityManager.dispose();
  }
}

export const ui = new UI();
