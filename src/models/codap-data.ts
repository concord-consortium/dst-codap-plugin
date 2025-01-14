import { makeAutoObservable, observable } from "mobx";

export interface ICase {
  date?: string;
  Day?: number;
  id: number;
  Latitude?: number;
  Longitude?: number;
  Month?: number;
  Year?: number;
}

class CodapCases {
  caseMap = observable.map<number, ICase>();
  selectedCaseIds = observable.set<number>();

  constructor() {
    makeAutoObservable(this);
  }

  addCase(aCase: ICase) {
    this.caseMap.set(aCase.id, aCase);
  }

  addCaseToSelection(id?: number) {
    if (id != null) this.selectedCaseIds.add(id);
  }

  clearSelectedCases() {
    this.selectedCaseIds.clear();
  }

  get cases(): ICase[] {
    return Array.from(this.caseMap.values());
  }

  isSelected(id: number) {
    return this.selectedCaseIds.has(id);
  }

  removeCaseFromSelection(id?: number) {
    if (id != null) this.selectedCaseIds.delete(id);
  }

  replaceCases(newCases: Record<number, ICase>) {
    this.caseMap.replace(newCases);
  }

  replaceSelectedCases(newSelectedCaseIds: number[]) {
    this.selectedCaseIds.replace(newSelectedCaseIds);
  }
}

export const codapCases = new CodapCases();

export function getDate(aCase: ICase) {
  // // We need at least a year. To make things simple we just use 2000 for now
  return Date.UTC(aCase.Year || 2000, (aCase.Month ?? 1) - 1, aCase.Day);
}
