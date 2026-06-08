import { makeAutoObservable, ObservableSet } from "mobx";
import { kCollectionName } from "../utilities/constants";
import { dstContainer } from "./dst-container";
import { datasetConfig } from "./dataset-config";
import { parseDate, createDateFromComponents } from "../utilities/date-utils";

class CodapData {
  absoluteMinDate = 1578124800000;
  absoluteMaxDate = 1672358400000;

  marqueeSelection = new ObservableSet<string>();

  constructor() {
    makeAutoObservable(this);
  }

  get absoluteDateRange() {
    return this.absoluteMaxDate - this.absoluteMinDate;
  }

  get caseIds() {
    // Prefer the leaf (last) collection, which is where the per-row cases live.
    // The legacy "Cases" name only matches the bundled tornado sample and the
    // seed dataset — imported CODAP datasets carry whatever name CODAP assigns.
    const collections = this.dataSet.collections;
    const leafCaseIds = collections && collections.length > 0
      ? collections[collections.length - 1]?.caseIds ?? []
      : this.dataSet.getCollectionByName(kCollectionName)?.caseIds ?? [];

    return leafCaseIds;
  }

  get dataSet() {
    return dstContainer.dataSet;
  }
  
  /**
   * Get a numeric value for an attribute
   * @param attributeName The name of the attribute
   * @param caseId The case ID
   * @returns The numeric value or undefined if not a number
   */
  getAttributeNumericValue(attributeName: string, caseId: string) {
    const value = this.getAttributeValue(attributeName, caseId);
    return value ? +value : undefined;
  }

  /**
   * Get the value of an attribute for a specific case
   * @param attributeName The name of the attribute
   * @param caseId The case ID
   * @returns The attribute value as a string or undefined
   */
  getAttributeValue(attributeName: string, caseId: string): string | undefined {
    const attributeId = this.dataSet.getAttributeByName(attributeName)?.id;
    const value = attributeId ? this.dataSet.getValue(caseId, attributeId) : undefined;
    
    // Ensure we return a string or undefined
    return value !== undefined ? String(value) : undefined;
  }
  
  /**
   * Get the timestamp for a case using the configured date attribute
   * If no date attribute is configured, tries to use Year, Month, Day attributes
   * @param caseId The case ID
   * @returns Timestamp (milliseconds since epoch)
   */
  // Hot path: called per-case on every render rebuild and during date-range
  // computation. It must NOT log per case — at 100K rows the previous per-case
  // console.warn calls produced hundreds of thousands of writes and noticeably
  // slowed loading. Callers handle the undefined return for unparseable dates.
  getCaseDate(caseId: string) {
    // If we have a configured date attribute, use it
    if (datasetConfig.dateAttribute) {
      const dateStr = this.getAttributeValue(datasetConfig.dateAttribute, caseId);
      if (dateStr) {
        const timestamp = parseDate(dateStr, datasetConfig.dateFormat);
        if (timestamp) {
          return timestamp;
        }
      }
    }

    // Fallback to Year, Month, Day attributes if date parsing fails
    const year = this.getAttributeNumericValue("Year", caseId);
    const month = this.getAttributeNumericValue("Month", caseId);
    const day = this.getAttributeNumericValue("Day", caseId);

    if (year !== undefined || month !== undefined || day !== undefined) {
      return createDateFromComponents(year, month, day);
    }

    return undefined;
  }

  /**
   * Get the latitude value for a case using the configured attribute
   * @param caseId The case ID
   * @returns The latitude value or undefined
   */
  getLatitude(caseId: string) {
    // Use configured latitude attribute if available
    if (datasetConfig.latitudeAttribute) {
      return this.getAttributeNumericValue(datasetConfig.latitudeAttribute, caseId);
    }
    // Fall back to default "Latitude" attribute
    return this.getAttributeNumericValue("Latitude", caseId);
  }

  /**
   * Get the longitude value for a case using the configured attribute
   * @param caseId The case ID
   * @returns The longitude value or undefined
   */
  getLongitude(caseId: string) {
    // Use configured longitude attribute if available
    if (datasetConfig.longitudeAttribute) {
      return this.getAttributeNumericValue(datasetConfig.longitudeAttribute, caseId);
    }
    // Fall back to default "Longitude" attribute
    return this.getAttributeNumericValue("Longitude", caseId);
  }

  /**
   * Get the color value for a case using the configured attribute
   * @param caseId The case ID
   * @returns The color value or undefined
   */
  getColor(caseId: string) {
    // Use configured color attribute if available
    if (datasetConfig.colorAttribute) {
      return this.getAttributeValue(datasetConfig.colorAttribute, caseId);
    }
    return undefined;
  }

  /**
   * Get the size value for a case using the configured attribute
   * @param caseId The case ID
   * @returns The size value or undefined
   */
  getSize(caseId: string) {
    // Use configured size attribute if available
    if (datasetConfig.sizeAttribute) {
      return this.getAttributeNumericValue(datasetConfig.sizeAttribute, caseId);
    }
    return undefined;
  }

  /**
   * Check if a case is selected
   * @param caseId The case ID
   * @returns True if the case is selected
   */
  isSelected(caseId: string) {
    if (this.marqueeSelection.size > 0) {
      return this.marqueeSelection.has(caseId);
    } else {
      return this.dataSet.isCaseSelected(caseId);
    }
  }

  /**
   * Set the absolute date range for the dataset
   * @param minDate Minimum date (milliseconds since epoch)
   * @param maxDate Maximum date (milliseconds since epoch)
   */
  setAbsoluteDateRange(minDate: number, maxDate: number) {
    this.absoluteMinDate = minDate;
    this.absoluteMaxDate = maxDate;
    
    // Debug log removed to reduce clutter
  }

  /**
   * Set the selection for the marquee tool
   * @param caseIds The selected case IDs or undefined to clear
   */
  setMarqueeSelection(caseIds?: string[]) {
    if (caseIds) {
      this.marqueeSelection.replace(caseIds);
    } else {
      this.marqueeSelection.clear();
    }
  }
}

export const codapData = new CodapData();
