class UIState {
  activeControls: string | null = null;

  setActiveControls(name: string) {
    this.activeControls = name;
  }
}

export const uiState = new UIState();
