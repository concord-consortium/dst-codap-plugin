import { createDataContextFromURL, getAllItems, getDataContext } from "@concord-consortium/codap-plugin-api";
import { getDate, items } from "../models/item";
import { dataRanges } from "./graph-utils";

import tornadoTracks20to22 from "../data/Tornado_Tracks_2020-2022.csv";

const dataContextName = "Tornado_Tracks_2020-2022";

export async function getData() {
  try {
    const result = await getDataContext(dataContextName);

    if (!result.success) {
      const newDataContextResult = await createDataContextFromURL(tornadoTracks20to22);
      if (!newDataContextResult.success) {
        console.error("Couldn't load dataset");
        return;
      }      
    }

    const itemsResult = await getAllItems(dataContextName);

    if (!itemsResult.success) {
      console.error("Couldn't load items from dataset");
      return;
    }

    const is = itemsResult.values.map((item: any) => item.values);

    // Update data ranges
    const dates = is.map((item: any) => getDate(item)).filter((time: number) => isFinite(time));
    dataRanges.setDateRange(Math.min(...dates), Math.max(...dates));
    // const lats = is.map((item: any) => item.Latitude);
    // dataRanges.latMin = Math.min(...lats);
    // dataRanges.latMax = Math.max(...lats);
    // const longs = is.map((item: any) => item.Longitude);
    // dataRanges.longMin = Math.min(...longs);
    // dataRanges.longMax = Math.max(...longs);

    items.replace(is);
  } catch (error) {
    // This will happen if not embedded in CODAP
    console.warn("Not embedded in CODAP", error);
  }
}
