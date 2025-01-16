import { codapCases } from "../models/codap-data";
import { getData } from "./codap-utils";
import { createDataContextFromURL, getCaseByFormulaSearch, getDataContext } from "@concord-consortium/codap-plugin-api";
import { dataRanges } from "./graph-utils";

jest.mock("@concord-consortium/codap-plugin-api");

const mockedGetDataContext = getDataContext as jest.MockedFunction<typeof getDataContext>;
const mockedGetCaseByFormulaSearch = getCaseByFormulaSearch as jest.MockedFunction<typeof getCaseByFormulaSearch>;
const mockedCreateDataContextFromURL = createDataContextFromURL as jest.MockedFunction<typeof createDataContextFromURL>;

describe("codap utilities", () => {
  describe("getData", () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it("handles no existing data and a loading error", async () => {
      mockedGetDataContext.mockReturnValue(Promise.resolve({success: false, values: ""}));
      mockedCreateDataContextFromURL.mockReturnValue(Promise.resolve({success: false, values: ""}));
      const consoleError = jest.spyOn(console, "error").mockImplementation(() => null);
      await getData();
      expect(consoleError).toHaveBeenCalled();
      expect(mockedGetCaseByFormulaSearch).not.toHaveBeenCalled();
    });

    it("handles no existing data and an error getting the items from the dataset", async () => {
      mockedGetDataContext.mockReturnValue(Promise.resolve({success: false, values: ""}));
      mockedCreateDataContextFromURL.mockReturnValue(Promise.resolve({success: true, values: ""}));
      mockedGetCaseByFormulaSearch.mockReturnValue(Promise.resolve({success: false, values: ""}));
      const consoleError = jest.spyOn(console, "error").mockImplementation(() => null);
      await getData();
      expect(consoleError).toHaveBeenCalled();
      expect(mockedGetCaseByFormulaSearch).toHaveBeenCalled();
    });

    it("handles no existing data", async () => {
      mockedGetDataContext.mockReturnValue(Promise.resolve({success: false, values: ""}));
      mockedCreateDataContextFromURL.mockReturnValue(Promise.resolve({success: true, values: ""}));
      mockedGetCaseByFormulaSearch.mockReturnValue(Promise.resolve({
        success: true, 
        values: [
          {
            id: 1,
            values: {
              date: "2020-01-01",
              Day: 1,
              Latitude: 10,
              Longitude: 10,
              Month: 1,
              Year: 2020  
            }
          },
          {
            id: 2,
            values: {
              date: "2022-01-01",
              Day: 1,
              Latitude: 10,
              Longitude: 10,
              Month: 1,
              Year: 2022
            }
          }
        ]
      }));
      await getData();
      expect(codapCases.cases.length).toBe(2);
      expect(dataRanges.dateMin).toBe(Date.UTC(2020,0,1));
      expect(dataRanges.dateMax).toBe(Date.UTC(2022,0,1));
    });

    it("handles existing data", async () => {
      mockedGetDataContext.mockReturnValue(Promise.resolve({
        success: true, 
        values: ""
      }));
      mockedGetCaseByFormulaSearch.mockReturnValue(Promise.resolve({
        success: true, 
        values: [
          {
            id: 1,
            values: {
              date: "2020-01-01",
              Day: 1,
              Latitude: 10,
              Longitude: 10,
              Month: 1,
              Year: 2020  
            }
          },
          {
            id: 2,
            values: {
              date: "2022-01-01",
              Day: 1,
              Latitude: 10,
              Longitude: 10,
              Month: 1,
              Year: 2022
            }
          }
        ]
      }));
      await getData();
      expect(mockedCreateDataContextFromURL).not.toHaveBeenCalled();
      expect(codapCases.cases.length).toBe(2);
      expect(dataRanges.dateMin).toBe(Date.UTC(2020,0,1));
      expect(dataRanges.dateMax).toBe(Date.UTC(2022,0,1));
    });

    it("handles not being inside of CODAP", async () => {
      mockedGetDataContext.mockRejectedValue("failed to connect to CODAP");
      const consoleWarn = jest.spyOn(console, "warn").mockImplementation(() => null);
      await getData();
      expect(consoleWarn).toHaveBeenCalled();
      expect(mockedCreateDataContextFromURL).not.toHaveBeenCalled();
      expect(mockedGetCaseByFormulaSearch).not.toHaveBeenCalled();
    });
  });
});
