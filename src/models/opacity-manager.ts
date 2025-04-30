import { makeAutoObservable } from "mobx";

export class OpacityManager {
  private _isLocked: boolean = false;
  private _currentOpacity: number = 1;
  private _targetOpacity: number = 1;
  private _transitionDuration: number = 100; // milliseconds
  private _lockTimeout: number | null = null;
  private readonly _opacityPower: number = 1; // Linear scale for direct response

  constructor() {
    makeAutoObservable(this);
  }

  get isLocked(): boolean {
    return this._isLocked;
  }

  get currentOpacity(): number {
    return this._currentOpacity;
  }

  get targetOpacity(): number {
    return this._targetOpacity;
  }

  lockState(): void {
    this._isLocked = true;
  }

  unlockState(): void {
    this._isLocked = false;
  }

  // Transform linear slider value to non-linear opacity
  private transformOpacity(linearOpacity: number): number {
    // Use linear scale for direct response to slider
    return linearOpacity;
  }

  setTargetOpacity(opacity: number): void {
    if (!this._isLocked) {
      this._targetOpacity = Math.max(0, Math.min(1, opacity));
    }
  }

  getTransitioningOpacity(): number {
    // Simple linear interpolation between current and target opacity
    const progress = (Date.now() % this._transitionDuration) / this._transitionDuration;
    const interpolatedLinear = this._currentOpacity + (this._targetOpacity - this._currentOpacity) * progress;
    return this.transformOpacity(interpolatedLinear);
  }

  // Get the actual opacity value to use for rendering
  getDisplayOpacity(): number {
    return this.transformOpacity(this._targetOpacity);
  }

  completeTransition(): void {
    this._currentOpacity = this._targetOpacity;
  }

  handleSelectionChange(isSelected: boolean): void {
    this.lockState();
    
    // Clear any existing timeout
    if (this._lockTimeout) {
      clearTimeout(this._lockTimeout);
    }

    // Set a timeout to unlock the state
    this._lockTimeout = setTimeout(() => {
      this.unlockState();
    }, this._transitionDuration);
  }

  // Cleanup method to clear timeouts
  dispose(): void {
    if (this._lockTimeout) {
      clearTimeout(this._lockTimeout);
    }
  }
} 