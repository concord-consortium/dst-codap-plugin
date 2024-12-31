import { getAllItems, getDataContext } from "@concord-consortium/codap-plugin-api";
import { kDataContextName } from "./constants";
import { getDate, items } from "../models/item";
import { dataRanges } from "./graph-utils";

export async function getData() {
  try {
    const result = await getDataContext(kDataContextName);

    if (result.success) {
      const itemsResult = await getAllItems(kDataContextName);

      if (itemsResult.success) {
        const is = itemsResult.values.map((item: any) => item.values);
        items.replace(is);

        // Update data ranges
        const dates = is.map((item: any) => getDate(item)).filter((time: number) => isFinite(time));
        dataRanges.dateMin = Math.min(...dates);
        dataRanges.dateMax = Math.max(...dates);
        // const lats = is.map((item: any) => item.Latitude);
        // dataRanges.latMin = Math.min(...lats);
        // dataRanges.latMax = Math.max(...lats);
        // const longs = is.map((item: any) => item.Longitude);
        // dataRanges.longMin = Math.min(...longs);
        // dataRanges.longMax = Math.max(...longs);
      }
    }
  } catch (error) {
    // This will happen if not embedded in CODAP
    console.warn("Not embedded in CODAP", error);
  }
}
