import { Instance, types } from "mobx-state-tree";

/**
 * DatasetConfiguration model stores the mapping between dataset attributes and visualization requirements.
 * It tracks which attributes in the CODAP dataset correspond to latitude, longitude, date, etc.
 */
export const DatasetConfiguration = types
  .model("DatasetConfiguration", {
    dataContextName: types.maybe(types.string),
    latitudeAttribute: types.maybe(types.string),
    longitudeAttribute: types.maybe(types.string),
    dateAttribute: types.maybe(types.string),
    colorAttribute: types.maybe(types.string),
    sizeAttribute: types.maybe(types.string),
    dateFormat: types.optional(types.string, "auto"),
    isConfigured: types.optional(types.boolean, false)
  })
  .views(self => ({
    /**
     * Validates if the configuration has all required attributes set
     */
    get isValid(): boolean {
      return !!(
        self.dataContextName &&
        self.latitudeAttribute &&
        self.longitudeAttribute &&
        self.dateAttribute
      );
    }
  }))
  .actions(self => ({
    /**
     * Sets the CODAP data context name
     */
    setDataContext(name: string) {
      self.dataContextName = name;
    },

    /**
     * Sets the attribute name for latitude values
     */
    setLatitudeAttribute(name?: string) {
      self.latitudeAttribute = name;
    },

    /**
     * Sets the attribute name for longitude values
     */
    setLongitudeAttribute(name?: string) {
      self.longitudeAttribute = name;
    },

    /**
     * Sets the attribute name for date/time values
     */
    setDateAttribute(name?: string) {
      self.dateAttribute = name;
    },

    /**
     * Sets the attribute name for color mapping
     */
    setColorAttribute(name?: string) {
      self.colorAttribute = name;
    },

    /**
     * Sets the attribute name for size mapping
     */
    setSizeAttribute(name?: string) {
      self.sizeAttribute = name;
    },

    /**
     * Sets the date format for parsing date strings
     */
    setDateFormat(format: string) {
      self.dateFormat = format;
    },

    /**
     * Sets whether the dataset is fully configured
     */
    setIsConfigured(configured: boolean) {
      self.isConfigured = configured;
    },

    /**
     * Resets all attribute mappings to undefined
     */
    resetAttributeMappings() {
      self.latitudeAttribute = undefined;
      self.longitudeAttribute = undefined;
      self.dateAttribute = undefined;
      self.colorAttribute = undefined;
      self.sizeAttribute = undefined;
      self.dateFormat = "auto";
    }
  }));

/**
 * Type definition for the dataset configuration instance
 */
export interface IDatasetConfiguration extends Instance<typeof DatasetConfiguration> {}

/**
 * Default dataset configuration instance
 */
export const datasetConfig = DatasetConfiguration.create();

// Make datasetConfig available in the browser console for debugging
if (typeof window !== "undefined") {
  (window as any).datasetConfig = datasetConfig;
} 
