import { parseDate, tryParseDate, parseDateWithFormat, createDateFromComponents } from "../date-utils";

describe("Date Utilities", () => {
  describe("parseDate", () => {
    it("should handle undefined input", () => {
      expect(parseDate(undefined)).toBeUndefined();
    });
    
    it("should auto-detect date format when format is 'auto'", () => {
      const iso = parseDate("2022-01-15", "auto");
      expect(iso).toBe(new Date("2022-01-15").getTime());
    });
    
    it("should use specified format when provided", () => {
      const mdy = parseDate("01/15/2022", "mm/dd/yyyy");
      expect(mdy).toBe(new Date(2022, 0, 15).getTime());
    });
    
    it("should handle parsing errors gracefully", () => {
      const invalid = parseDate("not-a-date");
      expect(invalid).toBeUndefined();
    });
  });
  
  describe("tryParseDate", () => {
    it("should parse ISO format dates", () => {
      const date = tryParseDate("2022-01-15");
      expect(date).toBe(new Date("2022-01-15").getTime());
      
      const datetime = tryParseDate("2022-01-15T12:30:45");
      expect(datetime).toBe(new Date("2022-01-15T12:30:45").getTime());
    });
    
    it("should parse MM/DD/YYYY format", () => {
      const date = tryParseDate("01/15/2022");
      expect(date).toBe(new Date(2022, 0, 15).getTime());
      
      const shortMonth = tryParseDate("1/15/2022");
      expect(shortMonth).toBe(new Date(2022, 0, 15).getTime());
    });
    
    it("should parse MM-DD-YYYY format", () => {
      const date = tryParseDate("01-15-2022");
      expect(date).toBe(new Date(2022, 0, 15).getTime());
    });
    
    it("should parse YYYY/MM/DD format", () => {
      const date = tryParseDate("2022/01/15");
      expect(date).toBe(new Date(2022, 0, 15).getTime());
    });
    
    it("should handle year-only input", () => {
      const year = tryParseDate("2022");
      expect(year).toBe(new Date(2022, 0, 1).getTime());
    });
    
    it("should return undefined for unparseable dates", () => {
      const invalid = tryParseDate("not-a-date");
      expect(invalid).toBeUndefined();
    });
  });
  
  describe("parseDateWithFormat", () => {
    it("should parse YYYY-MM-DD format", () => {
      const date = parseDateWithFormat("2022-01-15", "yyyy-mm-dd");
      expect(date).toBe(new Date(2022, 0, 15).getTime());
    });
    
    it("should parse MM/DD/YYYY format", () => {
      const date = parseDateWithFormat("01/15/2022", "mm/dd/yyyy");
      expect(date).toBe(new Date(2022, 0, 15).getTime());
    });
    
    it("should parse DD-MM-YYYY format", () => {
      const date = parseDateWithFormat("15-01-2022", "dd-mm-yyyy");
      expect(date).toBe(new Date(2022, 0, 15).getTime());
    });
    
    it("should fall back to auto-detection for unknown formats", () => {
      const date = parseDateWithFormat("2022-01-15", "unknown-format");
      expect(date).toBe(new Date("2022-01-15").getTime());
    });
    
    it("should handle invalid date strings", () => {
      const invalid = parseDateWithFormat("invalid-date", "yyyy-mm-dd");
      expect(invalid).toBeUndefined();
    });
  });
  
  describe("createDateFromComponents", () => {
    it("should create date from year, month, and day", () => {
      const date = createDateFromComponents(2022, 1, 15);
      expect(date).toBe(Date.UTC(2022, 0, 15));
    });
    
    it("should handle undefined components with defaults", () => {
      const yearOnly = createDateFromComponents(2022, undefined, undefined);
      expect(yearOnly).toBe(Date.UTC(2022, 0, 1));
      
      const yearMonth = createDateFromComponents(2022, 3, undefined);
      expect(yearMonth).toBe(Date.UTC(2022, 2, 1));
      
      const noYear = createDateFromComponents(undefined, 3, 15);
      expect(noYear).toBe(Date.UTC(2000, 2, 15));
    });
  });
}); 
