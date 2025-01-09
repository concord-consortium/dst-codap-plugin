import {
  addDataContextChangeListener, createDataContextFromURL, getCaseByFormulaSearch, getDataContext,
  initializePlugin
} from "@concord-consortium/codap-plugin-api";
import { getDate, codapCases } from "../models/codap-data";
import { kInitialDimensions, kPluginName, kVersion } from "./constants";
import { dataRanges } from "./graph-utils";

import dataURL from "../data/Tornado_Tracks_2020-2022.csv";

const dataContextName = "Tornado_Tracks_2020-2022";
const collectionName = "Cases";

export async function initializeDST() {
  initializePlugin({pluginName: kPluginName, version: kVersion, dimensions: kInitialDimensions})
    .catch(reason => {
      // This will happen if not embedded in CODAP
      console.warn("Not embedded in CODAP");
    });

  getData();

  addDataContextChangeListener(dataContextName, notification => {
    const { operation, result } = notification.values;

    if (operation === "selectCases") {
      const { extend, cases, removedCases } = result;
      if (!extend) codapCases.clearSelectedCases();
      if (cases) cases.forEach((aCase: any) => codapCases.addCaseToSelection(aCase.id));
      if (removedCases) removedCases.forEach((aCase: any) => codapCases.removeCaseFromSelection(aCase.id));
    }
  });
}

export async function getData() {
  try {
    const result = await getDataContext(dataContextName);

    if (!result.success) {
      const newDataContextResult = await createDataContextFromURL(dataURL);
      if (!newDataContextResult.success) {
        console.error("Couldn't load dataset");
        return;
      }      
    }

    const casesResult = await getCaseByFormulaSearch(dataContextName, collectionName, "true");

    if (!casesResult.success) {
      console.error("Couldn't load cases from dataset");
      return;
    }

    casesResult.values.forEach((aCase: any) => codapCases.addCase({ id: aCase.id, ...aCase.values }));

    // Update data ranges
    const dates = codapCases.cases.map((item: any) => getDate(item)).filter((time: number) => isFinite(time));
    dataRanges.dateMin = Math.min(...dates);
    dataRanges.dateMax = Math.max(...dates);
    // const lats = is.map((item: any) => item.Latitude);
    // dataRanges.latMin = Math.min(...lats);
    // dataRanges.latMax = Math.max(...lats);
    // const longs = is.map((item: any) => item.Longitude);
    // dataRanges.longMin = Math.min(...longs);
    // dataRanges.longMax = Math.max(...longs);
  } catch (error) {
    // This will happen if not embedded in CODAP
    console.warn("Not embedded in CODAP", error);
  }
}
