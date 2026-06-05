import { runInAction } from "mobx";
import { graph } from "../models/graph";
import { codapInterface } from "./codap-interface";
import { codapData } from "../models/codap-data";
import {
  CodapApiResult,
  CodapAttribute,
  isCollectionResponse,
  isCaseArray
} from "./codap-types";

export interface Bounds {
  minLat: number;
  maxLat: number;
  minLong: number;
  maxLong: number;
}

export class MapBoundsManager {
  private readonly ABSOLUTE_MIN_LAT = -90;
  private readonly ABSOLUTE_MAX_LAT = 90;
  private readonly ABSOLUTE_MIN_LONG = -180;
  private readonly ABSOLUTE_MAX_LONG = 180;
  
  private readonly VISIBLE_MIN_LAT = -85;
  private readonly VISIBLE_MAX_LAT = 85;
  private readonly VISIBLE_MIN_LONG = -175;
  private readonly VISIBLE_MAX_LONG = 175;

  private readonly MARGIN_FACTOR = 0.15; // 15% margin
  private readonly MIN_VIEW_SPAN = 0.1; // Minimum view span to prevent over-zoom
  private readonly ASPECT_RATIO = 2.0; // Standard map aspect ratio (2:1 for equirectangular)

  /**
   * Updates the map bounds based on the dataset's coordinate ranges
   * Uses data already in memory for immediate response
   * 
   * @param dataContextName The name of the CODAP data context (unused, kept for compatibility)
   * @param latAttr The name of the latitude attribute (unused, kept for compatibility)
   * @param longAttr The name of the longitude attribute (unused, kept for compatibility)
   */
  public async updateMapBounds(
    _dataContextName?: string,
    _latAttr?: string,
    _longAttr?: string
  ): Promise<void> {
    try {
      // First set absolute bounds to allow unlimited panning
      this.setWorldMapBounds();
      console.log("Set absolute bounds for unlimited panning");

      // Calculate bounds from existing data
      const bounds = this.calculateBoundsFromExistingData();
      
      if (bounds) {
        console.log("Found valid bounds in existing data:", bounds);
        
        // Calculate optimal view bounds with proper aspect ratio
        const optimalBounds = this.calculateOptimalViewBounds(bounds);
        
        // Animate to the optimal view
        graph.animateTo({
          minLatitude: optimalBounds.minLat,
          maxLatitude: optimalBounds.maxLat,
          minLongitude: optimalBounds.minLong,
          maxLongitude: optimalBounds.maxLong
        });
        
        console.log("Adjusted view to optimal bounds:", optimalBounds);
      } else {
        console.log("No valid bounds found in existing data, keeping current view");
      }
    } catch (error) {
      console.error("Error updating map bounds:", error);
      // World map is already shown from setWorldMapBounds, so no need for additional fallback
    }
  }

  /**
   * Sets the map bounds to show the entire world
   * Uses slightly inset visible bounds to avoid projection distortion at poles
   */
  private setWorldMapBounds(): void {
    runInAction(() => {
      // Set absolute boundaries (maximum possible extent)
      graph.absoluteMinLatitude = this.ABSOLUTE_MIN_LAT;
      graph.absoluteMaxLatitude = this.ABSOLUTE_MAX_LAT;
      graph.absoluteMinLongitude = this.ABSOLUTE_MIN_LONG;
      graph.absoluteMaxLongitude = this.ABSOLUTE_MAX_LONG;

      // Keep current view bounds if they exist, otherwise use visible bounds
      if (graph.minLatitude === 0 && graph.maxLatitude === 0) {
        graph.minLatitude = this.VISIBLE_MIN_LAT;
        graph.maxLatitude = this.VISIBLE_MAX_LAT;
        graph.minLongitude = this.VISIBLE_MIN_LONG;
        graph.maxLongitude = this.VISIBLE_MAX_LONG;

        // Set home boundaries to match
        graph.homeMinLatitude = this.VISIBLE_MIN_LAT;
        graph.homeMaxLatitude = this.VISIBLE_MAX_LAT;
        graph.homeMinLongitude = this.VISIBLE_MIN_LONG;
        graph.homeMaxLongitude = this.VISIBLE_MAX_LONG;
      }
    });
  }

  /**
   * Calculates bounds from data already in memory
   * @returns The coordinate bounds if valid data found, null otherwise
   */
  private calculateBoundsFromExistingData(): Bounds | null {
    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLong = Infinity;
    let maxLong = -Infinity;
    let hasValidCoords = false;

    for (const caseId of codapData.caseIds) {
      const lat = codapData.getLatitude(caseId);
      const long = codapData.getLongitude(caseId);
      
      if (lat !== undefined && long !== undefined && 
          !isNaN(lat) && !isNaN(long)) {
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
        minLong = Math.min(minLong, long);
        maxLong = Math.max(maxLong, long);
        hasValidCoords = true;
      }
    }

    return hasValidCoords ? { 
      minLat, maxLat, minLong, maxLong 
    } : null;
  }

  /**
   * Calculates optimal view bounds based on data extents
   * Maintains proper aspect ratio and adds margins
   * @param bounds The raw data bounds
   * @returns The optimal view bounds
   */
  private calculateOptimalViewBounds(bounds: Bounds): Bounds {
    // Calculate data spans
    const latSpan = Math.max(this.MIN_VIEW_SPAN, bounds.maxLat - bounds.minLat);
    const longSpan = Math.max(this.MIN_VIEW_SPAN, bounds.maxLong - bounds.minLong);
    
    // Calculate centers
    const centerLat = (bounds.maxLat + bounds.minLat) / 2;
    const centerLong = (bounds.maxLong + bounds.minLong) / 2;

    // Add margins
    const latMargin = latSpan * this.MARGIN_FACTOR;
    const longMargin = longSpan * this.MARGIN_FACTOR;
    
    // Calculate initial spans with margins
    let viewLatSpan = latSpan + (2 * latMargin);
    let viewLongSpan = longSpan + (2 * longMargin);

    // Adjust spans to maintain aspect ratio
    // Standard equirectangular maps use 2:1 ratio (longitude:latitude)
    const currentAspectRatio = viewLongSpan / viewLatSpan;
    
    if (currentAspectRatio < this.ASPECT_RATIO) {
      // Too tall, need to widen
      viewLongSpan = viewLatSpan * this.ASPECT_RATIO;
    } else {
      // Too wide, need to increase height
      viewLatSpan = viewLongSpan / this.ASPECT_RATIO;
    }

    // Calculate final bounds, ensuring they stay within absolute limits
    return {
      minLat: Math.max(this.ABSOLUTE_MIN_LAT, centerLat - (viewLatSpan / 2)),
      maxLat: Math.min(this.ABSOLUTE_MAX_LAT, centerLat + (viewLatSpan / 2)),
      minLong: Math.max(this.ABSOLUTE_MIN_LONG, centerLong - (viewLongSpan / 2)),
      maxLong: Math.min(this.ABSOLUTE_MAX_LONG, centerLong + (viewLongSpan / 2))
    };
  }
} 
