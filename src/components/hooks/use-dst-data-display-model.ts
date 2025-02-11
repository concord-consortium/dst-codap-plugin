import { Context, useContext } from "react";
import { IDstDataDisplayModel, isDstDataDisplayModel } from "../../models/dst-data-display-model";
import { BaseDataDisplayModelContext } from "../../codap/components/data-display/hooks/use-base-data-display-model";

export const DstDataDisplayModelContext = BaseDataDisplayModelContext as Context<IDstDataDisplayModel | undefined>;

export const useDstDataDisplayModelContext = () => {
  const context = useContext(BaseDataDisplayModelContext);
  if (!context || !isDstDataDisplayModel(context)) {
    throw new Error("useDstDataDisplayModelContext must be used within a DstDataDisplayModelContextProvider");
  }
  return context;
};
