import { makeAutoObservable } from "mobx";

class CodapData {
  absoluteMinDate = 1578124800000;
  absoluteMaxDate = 1672358400000;

  constructor() {
    makeAutoObservable(this);
  }

  get absoluteDateRange() {
    return this.absoluteMaxDate - this.absoluteMinDate;
  }

  setAbsoluteDateRange(min: number, max: number) {
    this.absoluteMinDate = min;
    this.absoluteMaxDate = max;
  }
}

export const codapData = new CodapData();
