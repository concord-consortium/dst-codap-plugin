import { items } from "../models/item";
import { getData } from "./codap-utils";
import { createDataContextFromURL, getAllItems, getDataContext } from "@concord-consortium/codap-plugin-api";
import { dataRanges } from "./graph-utils";

jest.mock("@concord-consortium/codap-plugin-api");

const mockedGetDataContext = getDataContext as jest.MockedFunction<typeof getDataContext>;
const mockedGetAllItems = getAllItems as jest.MockedFunction<typeof getAllItems>;
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
      expect(mockedGetAllItems).not.toHaveBeenCalled();
    });

    it("handles no existing data and an error getting the items from the dataset", async () => {
      mockedGetDataContext.mockReturnValue(Promise.resolve({success: false, values: ""}));
      mockedCreateDataContextFromURL.mockReturnValue(Promise.resolve({success: true, values: ""}));
      mockedGetAllItems.mockReturnValue(Promise.resolve({success: false, values: ""}));
      const consoleError = jest.spyOn(console, "error").mockImplementation(() => null);
      await getData();
      expect(consoleError).toHaveBeenCalled();
      expect(mockedGetAllItems).toHaveBeenCalled();
    });

    it("handles no existing data", async () => {
      mockedGetDataContext.mockReturnValue(Promise.resolve({success: false, values: ""}));
      mockedCreateDataContextFromURL.mockReturnValue(Promise.resolve({success: true, values: ""}));
      mockedGetAllItems.mockReturnValue(Promise.resolve({
        success: true, 
        values: [
          {
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
      expect(items.length).toBe(2);
      expect(dataRanges.dateMin).toBe(Date.UTC(2020,1,1));
      expect(dataRanges.dateMax).toBe(Date.UTC(2022,1,1));
    });

    it("handles existing data", async () => {
      mockedGetDataContext.mockReturnValue(Promise.resolve({
        success: true, 
        values: ""
      }));
      mockedGetAllItems.mockReturnValue(Promise.resolve({
        success: true, 
        values: [
          {
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
      expect(items.length).toBe(2);
      expect(dataRanges.dateMin).toBe(Date.UTC(2020,1,1));
      expect(dataRanges.dateMax).toBe(Date.UTC(2022,1,1));
    });

    it("handles not being inside of CODAP", async () => {
      mockedGetDataContext.mockRejectedValue("failed to connect to CODAP");
      const consoleWarn = jest.spyOn(console, "warn").mockImplementation(() => null);
      await getData();
      expect(consoleWarn).toHaveBeenCalled();
      expect(mockedCreateDataContextFromURL).not.toHaveBeenCalled();
      expect(mockedGetAllItems).not.toHaveBeenCalled();
    });
  });
});
