import { getDataContext, getCaseByFormulaSearch } from "@concord-consortium/codap-plugin-api";
import { ICaseCreation } from "../codap/models/data/data-set-types";
import testDataSet from "../test/test-data-set.json";
import { getData } from "../utilities/codap-utils";
import { codapData } from "./codap-data";
import { graph } from "./graph";

jest.mock("@concord-consortium/codap-plugin-api");

const mockedGetDataContext = getDataContext as jest.MockedFunction<typeof getDataContext>;
const mockedGetCaseByFormulaSearch = getCaseByFormulaSearch as jest.MockedFunction<typeof getCaseByFormulaSearch>;

const cases: ICaseCreation[] = [
  { id: "1", values: { Day: 4, Month: 1, Year: 2020 } },
  {
    id: 2, values: { Latitude: graph.centerLat, Longitude: graph.centerLong,
    Year: 2021, Month: 1, Day: 1 }
  },
  {
    id: 3, values: { Latitude: graph.absoluteMaxLatitude + 1, Longitude: graph.absoluteMaxLongitude + 1,
    Year: 2021, Month: 1, Day: 1 }
  },
  {
    id: 4, values: { Latitude: graph.absoluteMaxLatitude, Longitude: graph.absoluteMaxLongitude,
    Year: 1980, Month: 1, Day: 1 }
  },
  {
    id: 5, values: { Latitude: graph.absoluteMaxLatitude, Longitude: graph.absoluteMaxLongitude,
    Year: 2100, Month: 1, Day: 1 }
  }
];

describe("CodapData", () => {
  beforeAll(async () => {
    mockedGetDataContext.mockReturnValue(Promise.resolve({ success: true, values: testDataSet }));
    mockedGetCaseByFormulaSearch.mockReturnValue(Promise.resolve({
      success: true, 
      values: cases
    }));
    await getData();
  });

  it("should calculate absoluteDateRange correctly", async () => {
    expect(codapData.absoluteDateRange).toBe(Date.UTC(2100, 0, 1) - Date.UTC(1980, 0, 1));
  });

  it("should return caseIds correctly", async () => {
    expect(codapData.caseIds.length).toEqual(5);
  });

  it("should return latitude correctly", () => {
    expect(codapData.getLatitude("CASE2")).toBe(graph.centerLat);
  });

  it("should return longitude correctly", () => {
    expect(codapData.getLongitude("CASE2")).toBe(graph.centerLong);
  });

  it("should return case date correctly", () => {
    expect(codapData.getCaseDate("CASE1")).toBe(Date.UTC(2020, 0, 4));
  });

  it("should correctly check if a case is selected", () => {
    expect(codapData.isSelected("CASE1")).toBe(false);
    codapData.dataSet.selectCases(["CASE1"]);
    expect(codapData.isSelected("CASE1")).toBe(true);
  });

  it("should set absolute date range correctly", () => {
    codapData.setAbsoluteDateRange(1609459200000, 1640995200000);
    expect(codapData.absoluteMinDate).toBe(1609459200000);
    expect(codapData.absoluteMaxDate).toBe(1640995200000);
  });
});
