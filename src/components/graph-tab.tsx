import {
  createDataContext, createItems, createNewCollection, createTable, getAllItems, getDataContext
} from "@concord-consortium/codap-plugin-api";
import React, { useState } from "react";
import { kDataContextName } from "../utilities/constants";

interface IGraphTabProps {
  listenerNotification?: string
}
export function GraphTab({ listenerNotification }: IGraphTabProps) {
  const [codapResponse, setCodapResponse] = useState<any>(undefined);
  const [dataContext, setDataContext] = useState<any>(null);

  const handleOpenTable = async () => {
    const res = await createTable(kDataContextName);
    setCodapResponse(res);
  };

  const handleCreateData = async() => {
    const existingDataContext = await getDataContext(kDataContextName);
    let createDC, createNC, createI;
    if (!existingDataContext.success) {
      createDC = await createDataContext(kDataContextName);
      setDataContext(createDC.values);
    }
    if (existingDataContext?.success || createDC?.success) {
      createNC = await createNewCollection(kDataContextName, "Pets", [
        { name: "animal", type: "categorical" },
        { name: "count", type: "numeric" }
      ]);
      createI = await createItems(kDataContextName, [
        { animal: "dog", count: 5 },
        { animal: "cat", count: 4 },
        { animal: "fish", count: 20 },
        { animal: "horse", count: 1 },
        { animal: "bird", count: 2 },
        { animal: "snake", count: 1 }
      ]);
    }

    setCodapResponse(`
      Data context created: ${JSON.stringify(createDC)}
      New collection created: ${JSON.stringify(createNC)}
      New items created: ${JSON.stringify(createI)}
    `);
  };

  const handleGetResponse = async () => {
    const result = await getAllItems(kDataContextName);
    setCodapResponse(result);
  };

  return (
    <>
      <div className="buttons">
        <button onClick={handleCreateData}>
          Create some data
        </button>
        <button onClick={handleOpenTable} disabled={!dataContext}>
          Open Table
        </button>
        <button onClick={handleGetResponse}>
          See getAllItems response
        </button>
        <div className="response-area">
          <span>Response:</span>
          <div className="response">
            {codapResponse && `${JSON.stringify(codapResponse, null, "  ")}`}
          </div>
        </div>
      </div>
      <div className="response-area">
          <span>Listener Notification:</span>
          <div className="response">
            {listenerNotification && listenerNotification}
          </div>
      </div>
    </>
  );
}
