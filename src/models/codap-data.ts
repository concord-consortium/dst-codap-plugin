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
  selectedCaseIds = observable.set<string>();

  constructor() {
    makeAutoObservable(this);
  }

  addCase(aCase: ICase) {
    this.caseMap.set(aCase.__id__, aCase);
  }

  addCaseToSelection(id?: string) {
    if (id != null) this.selectedCaseIds.add(id);
  }

  clearSelectedCases() {
    this.selectedCaseIds.clear();
  }

  get cases(): ICase[] {
    return Array.from(this.caseMap.values());
  }

  isSelected(id: string) {
    return this.selectedCaseIds.has(id);
  }

  removeCaseFromSelection(id?: string) {
    if (id != null) this.selectedCaseIds.delete(id);
  }

  replaceCases(newCases: ICase[]) {
    this.caseMap.clear();
    newCases.forEach(aCase => {
      this.caseMap.set(aCase.__id__, aCase);
    });
  }

  replaceSelectedCases(newSelectedCaseIds: string[]) {
    this.selectedCaseIds.replace(newSelectedCaseIds);
  }
}

export const codapData = new CodapData();

export function getDate(aCase: ICase) {
  // // We need at least a year. To make things simple we just use 2000 for now
  return Date.UTC(aCase.Year || 2000, (aCase.Month ?? 1) - 1, aCase.Day);
}
