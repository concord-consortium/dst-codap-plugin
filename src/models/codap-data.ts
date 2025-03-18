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
    return this.dataSet.getCollectionByName(kCollectionName)?.caseIds ?? [];
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
  getCaseDate(caseId: string) {
    // If we have a configured date attribute, use it
    if (datasetConfig.dateAttribute) {
      const dateStr = this.getAttributeValue(datasetConfig.dateAttribute, caseId);
      if (dateStr) {
        console.log(`Parsing date "${dateStr}" from case ${caseId} with format ${datasetConfig.dateFormat || "auto"}`);
        const timestamp = parseDate(dateStr, datasetConfig.dateFormat);
        if (timestamp) {
          console.log(`Parsed timestamp: ${timestamp}, date: ${new Date(timestamp).toISOString()}`);
          return timestamp;
        } else {
          console.warn(`Failed to parse date from "${dateStr}"`);
        }
      }
    }
    
    // Fallback to Year, Month, Day attributes if date parsing fails
    const year = this.getAttributeNumericValue("Year", caseId);
    const month = this.getAttributeNumericValue("Month", caseId);
    const day = this.getAttributeNumericValue("Day", caseId);
    
    if (year !== undefined || month !== undefined || day !== undefined) {
      console.log(`Using Year/Month/Day components: ${year}/${month}/${day}`);
      const timestamp = createDateFromComponents(year, month, day);
      if (timestamp) {
        console.log(`Created timestamp from components: ${timestamp}, date: ${new Date(timestamp).toISOString()}`);
      } else {
        console.warn(`Failed to create date from components ${year}/${month}/${day}`);
      }
      return timestamp;
    }
    
    console.warn(`No valid date found for case ${caseId}`);
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
    
    // Debug log for date range
    console.log("SETTING DATE RANGE:", {
      minDate,
      maxDate,
      absoluteMinDate: this.absoluteMinDate,
      absoluteMaxDate: this.absoluteMaxDate,
      absoluteDateRange: this.absoluteDateRange,
      minDateFormatted: new Date(minDate).toISOString(),
      maxDateFormatted: new Date(maxDate).toISOString()
    });
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
