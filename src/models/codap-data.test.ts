import { codapData, ICase, getDate } from "./codap-data";

describe("CodapCases", () => {
  beforeEach(() => {
    codapData.replaceCases([]);
  });

  test("should add a case", () => {
    const aCase: ICase = { __id__: "1", Year: 2021 };
    codapData.addCase(aCase);
    expect(codapData.cases.find(({ __id__: id, Year }) => id === aCase.__id__ && Year === aCase.Year)).toBeTruthy();
  });

  test("should replace cases", () => {
    const cases: ICase[] = [
      { __id__: "1", Year: 2021 },
      { __id__: "2", Year: 2022 }
    ];
    codapData.replaceCases(cases);
    expect(codapData.cases).toEqual(cases);
  });
});

describe("getDate", () => {
  test("should return correct date", () => {
    const aCase: ICase = { __id__: "1", Year: 2021, Month: 5, Day: 15 };
    const date = getDate(aCase);
    expect(new Date(date).toISOString()).toBe("2021-05-15T00:00:00.000Z");
  });
});
