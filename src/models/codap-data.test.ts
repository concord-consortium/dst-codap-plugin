import { codapData, ICase, getDate } from "./codap-data";

describe("CodapCases", () => {
  beforeEach(() => {
    codapData.replaceCases([]);
    codapData.clearSelectedCases();
  });

  test("should add a case", () => {
    const aCase: ICase = { id: 1, Year: 2021 };
    codapData.addCase(aCase);
    expect(codapData.cases.find(({ id, Year }) => id === aCase.id && Year === aCase.Year)).toBeTruthy();
  });

  test("should add a case to selection", () => {
    const aCase: ICase = { id: 1, Year: 2021 };
    codapData.addCase(aCase);
    codapData.addCaseToSelection(aCase.id);
    expect(codapData.isSelected(aCase.id)).toBe(true);
  });

  test("should clear selected cases", () => {
    const aCase: ICase = { id: 1, Year: 2021 };
    codapData.addCase(aCase);
    codapData.addCaseToSelection(aCase.id);
    expect(codapData.isSelected(aCase.id)).toBe(true);
    codapData.clearSelectedCases();
    expect(codapData.isSelected(aCase.id)).toBe(false);
  });

  test("should replace cases", () => {
    const cases: ICase[] = [
      { id: 1, Year: 2021 },
      { id: 2, Year: 2022 }
    ];
    codapData.replaceCases(cases);
    expect(codapData.cases).toEqual(cases);
  });

  test("should replace selected cases", () => {
    const cases: ICase[] = [
      { id: 1, Year: 2021 },
      { id: 2, Year: 2022 }
    ];
    codapData.replaceCases(cases);
    codapData.replaceSelectedCases([1, 2]);
    expect(codapData.isSelected(1)).toBe(true);
    expect(codapData.isSelected(2)).toBe(true);
  });

  test("should remove case from selection", () => {
    const aCase: ICase = { id: 1, Year: 2021 };
    codapData.addCase(aCase);
    codapData.addCaseToSelection(aCase.id);
    expect(codapData.isSelected(aCase.id)).toBe(true);
    codapData.removeCaseFromSelection(aCase.id);
    expect(codapData.isSelected(aCase.id)).toBe(false);
  });
});

describe("getDate", () => {
  test("should return correct date", () => {
    const aCase: ICase = { id: 1, Year: 2021, Month: 5, Day: 15 };
    const date = getDate(aCase);
    expect(new Date(date).toISOString()).toBe("2021-05-15T00:00:00.000Z");
  });
});
