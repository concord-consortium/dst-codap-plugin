import { makeAutoObservable, observable } from "mobx";

export interface ICase {
  date?: string;
  Day?: number;
  __id__: string;
  Latitude?: number;
  Longitude?: number;
  Month?: number;
  Year?: number;
}

class CodapData {
  caseMap = observable.map<string, ICase>();

  constructor() {
    makeAutoObservable(this);
  }

  addCase(aCase: ICase) {
    this.caseMap.set(aCase.__id__, aCase);
  }

  get cases(): ICase[] {
    return Array.from(this.caseMap.values());
  }

  replaceCases(newCases: ICase[]) {
    this.caseMap.clear();
    newCases.forEach(aCase => {
      this.caseMap.set(aCase.__id__, aCase);
    });
  }
}

export const codapData = new CodapData();

export function getDate(aCase: ICase) {
  // // We need at least a year. To make things simple we just use 2000 for now
  return Date.UTC(aCase.Year || 2000, (aCase.Month ?? 1) - 1, aCase.Day);
}
