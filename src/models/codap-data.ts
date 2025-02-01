import { makeAutoObservable } from "mobx";
import { kCollectionName } from "../utilities/constants";
import { dstContainer } from "./dst-container";

class CodapData {
  absoluteMinDate = 1578124800000;
  absoluteMaxDate = 1672358400000;

  constructor() {
    makeAutoObservable(this);
  }

  get absoluteDateRange() {
    return this.absoluteMaxDate - this.absoluteMinDate;
  }

  get caseIds() {
    return this.dataSet.getCollectionByName(kCollectionName)?.caseIds ?? [];
  }

  get dataSet() {
    return dstContainer.dataSet;
  }
  
  getAttributeNumericValue(attributeName: string, caseId: string) {
    const value = this.getAttributeValue(attributeName, caseId);
    return value ? +value : undefined;
  }

  getAttributeValue(attirbuteName: string, caseId: string) {
    const attributeId = this.dataSet.getAttributeByName(attirbuteName)?.id;
    return attributeId && this.dataSet.getValue(caseId, attributeId);
  }
  
  getCaseDate(caseId: string) {
    // We need at least a year. To make things simple we just use 2000 for now
    const year = this.getAttributeNumericValue("Year", caseId) || 2000;
    const month = (this.getAttributeNumericValue("Month", caseId) || 1) - 1;
    const day = this.getAttributeNumericValue("Day", caseId) || 1;
    return Date.UTC(year, month, day);
  }

  getLatitude(caseId: string) {
    return this.getAttributeNumericValue("Latitude", caseId);
  }

  getLongitude(caseId: string) {
    return this.getAttributeNumericValue("Longitude", caseId);
  }

  setAbsoluteDateRange(min: number, max: number) {
    this.absoluteMinDate = min;
    this.absoluteMaxDate = max;
  }
}

export const codapData = new CodapData();
