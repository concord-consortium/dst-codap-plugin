import { getAllItems, getDataContext } from "@concord-consortium/codap-plugin-api";
import { kDataContextName } from "./constants";
import { items } from "../models/item";

export async function getData() {
  const result = await getDataContext(kDataContextName);

  if (result.success) {
    const itemsResult = await getAllItems(kDataContextName);

    if (itemsResult.success) {
      const is = itemsResult.values.map((item: any) => item.values);
      items.replace(is);
      // This code outputs the min and max lat and long.
      // It still might be useful but should eventually be removed.
      // const lats = is.map((item: any) => item.Latitude);
      // console.log(`--- min lat`, Math.min(...lats));
      // console.log(` -- max lat`, Math.max(...lats));
      // const longs = is.map((item: any) => item.Longitude);
      // console.log(`--- min long`, Math.min(...longs));
      // console.log(` -- max long`, Math.max(...longs));
    }
  }
}
