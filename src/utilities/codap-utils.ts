import {
  addDataContextChangeListener, createDataContextFromURL, getCaseByFormulaSearch, getDataContext,
  getSelectionList, initializePlugin, selectCases
} from "@concord-consortium/codap-plugin-api";
import { codapData, getDate, ICase } from "../models/codap-data";
import { graph } from "../models/graph";
import { ui } from "../models/ui";
import { kInitialDimensions, kPluginName, kVersion } from "./constants";

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
  updateSelection();

  addDataContextChangeListener(dataContextName, notification => {
    const { operation } = notification.values;

    if (operation === "selectCases") {
      updateSelection();
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

    const cases: ICase[] = casesResult.values.map((aCase: any) => ({ id: aCase.id, ...aCase.values }));

    // Update date range
    const dates = cases.map(aCase => getDate(aCase)).filter((time: number) => isFinite(time));
    graph.setAbsoluteDateRange(Math.min(...dates), Math.max(...dates));

    codapData.replaceCases(cases);
  } catch (error) {
    // This will happen if not embedded in CODAP
    console.warn("Not embedded in CODAP", error);
  }
}

export async function updateSelection() {
  // If the user is selecting using a marquee, ignore updates from codap.
  if (ui.activeMarquee) return;

  try {
    const selectionListResult = await getSelectionList(dataContextName);
    if (selectionListResult.success) {
      codapData.clearSelectedCases();
      codapData.replaceSelectedCases(selectionListResult.values.map((aCase: any) => aCase.caseID));
    }
  } catch (error) {
    // This will happen if not embedded in CODAP
    console.warn("Not embedded in CODAP", error);
  }
}

export async function dstSelectCases(caseIds: number[]) {
  codapData.replaceSelectedCases(caseIds);
  return await selectCases(dataContextName, caseIds);
}

export async function dstAddCaseToSelection(caseId: number) {
  codapData.addCaseToSelection(caseId);
  return await selectCases(dataContextName, Array.from(codapData.selectedCaseIds));
}

export async function dstRemoveCaseFromSelection(caseId: number) {
  codapData.removeCaseFromSelection(caseId);
  return await selectCases(dataContextName, Array.from(codapData.selectedCaseIds));
}
