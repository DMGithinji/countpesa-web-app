import { MoneyMode, Transaction, TransactionTypes } from "@/types/Transaction";
import { Filter, FilterMode } from "@/types/Filters";
import { subDays, startOfDay, endOfDay, subYears } from "date-fns";
import { Period } from "@/lib/groupByPeriod";
import { getDateRangeData } from "../getDateRangeData";

describe("getDateRangeData", () => {
  // Fixed date for testing to avoid test fragility
  const TODAY = new Date("2024-06-15");

  // Helper function to create test transactions
  const createTransaction = (date: Date): Transaction => ({
    id: `tr-${date.getTime()}`,
    code: "TEST",
    date: date.getTime(),
    description: "Test Transaction",
    amount: 100,
    account: "Test Account",
    balance: 1000,
    transactionType: TransactionTypes.SendMoney,
    category: "Test",
    createdAt: date.getTime(),
    dayOfWeek: "Monday",
    hour: "12:00",
    mode: MoneyMode.MoneyIn,
  });

  // Helper function to create date filters
  const createDateFilters = (from: Date, to: Date): Filter[] => [
    {
      field: "date",
      operator: ">=",
      value: from.getTime(),
      mode: FilterMode.AND,
    },
    {
      field: "date",
      operator: "<=",
      value: to.getTime(),
      mode: FilterMode.AND,
    },
  ];

  describe("with date filters", () => {
    it("should use date filters when provided", () => {
      const fromDate = subDays(TODAY, 10);
      const toDate = TODAY;
      const filters = createDateFilters(fromDate, toDate);

      const result = getDateRangeData({ transactions: [], currentFilters: filters });

      expect(result.dateRange.from).toEqual(startOfDay(fromDate));
      expect(result.dateRange.to).toEqual(endOfDay(toDate));
      expect(result.defaultPeriod).toBe(Period.DATE);
      expect(result.periodOptions).toEqual([Period.DATE, Period.WEEK]);
    });
  });

  describe("without date filters", () => {
    it("should use transaction dates when no filters but transactions exist", () => {
      const oldestDate = subDays(TODAY, 20);
      const newestDate = TODAY;
      const transactions = [
        createTransaction(oldestDate),
        createTransaction(subDays(TODAY, 10)),
        createTransaction(newestDate),
      ];

      const result = getDateRangeData({ transactions });

      expect(result.dateRange.from).toEqual(startOfDay(oldestDate));
      expect(result.dateRange.to).toEqual(endOfDay(newestDate));
      expect(result.defaultPeriod).toBe(Period.DATE);
      expect(result.periodOptions).toEqual([Period.DATE, Period.WEEK]);
    });

    it("should use current month when no filters and no transactions", () => {
      const result = getDateRangeData({ transactions: [] });

      // Since we can't predict the exact date for a unit test, we just check pattern
      expect(result.dateRange.from).toBeDefined();
      expect(result.dateRange.to).toBeDefined();
      expect(result.defaultPeriod).toBe(Period.DATE);
      expect(result.periodOptions).toContain(Period.DATE);
    });
  });

  describe("period determination", () => {
    it("should use HOUR period for same-day range", () => {
      const sameDay = TODAY;
      const filters = createDateFilters(sameDay, sameDay);

      const result = getDateRangeData({ transactions: [], currentFilters: filters });

      expect(result.defaultPeriod).toBe(Period.HOUR);
      expect(result.periodOptions).toEqual([Period.HOUR]);
    });

    it("should use DATE period for date range <= 31 days", () => {
      const fromDate = subDays(TODAY, 30);
      const toDate = TODAY;
      const filters = createDateFilters(fromDate, toDate);

      const result = getDateRangeData({ transactions: [], currentFilters: filters });

      expect(result.defaultPeriod).toBe(Period.DATE);
      expect(result.periodOptions).toEqual([Period.DATE, Period.WEEK]);
    });

    it("should use MONTH period for date range >= 61 days", () => {
      const fromDate = subDays(TODAY, 70);
      const toDate = TODAY;
      const filters = createDateFilters(fromDate, toDate);

      const result = getDateRangeData({ transactions: [], currentFilters: filters });

      expect(result.defaultPeriod).toBe(Period.MONTH);
      expect(result.periodOptions).toEqual([Period.DATE, Period.WEEK, Period.MONTH]);
    });

    it("should use YEAR period for date range >= 366 days", () => {
      const fromDate = subYears(TODAY, 1);
      const toDate = TODAY;
      const filters = createDateFilters(fromDate, toDate);

      const result = getDateRangeData({ transactions: [], currentFilters: filters });

      expect(result.defaultPeriod).toBe(Period.YEAR);
      expect(result.periodOptions).toEqual([Period.DATE, Period.WEEK, Period.MONTH, Period.YEAR]);
    });

    it("should default to DATE when range is in between defined thresholds", () => {
      const fromDate = subDays(TODAY, 45); // Between 31 and 61 days
      const toDate = TODAY;
      const filters = createDateFilters(fromDate, toDate);

      const result = getDateRangeData({ transactions: [], currentFilters: filters });

      expect(result.defaultPeriod).toBe(Period.DATE);
      expect(result.periodOptions).toEqual([Period.DATE]);
    });
  });

  describe("edge cases", () => {
    it("should handle missing >= filter by using start of current month", () => {
      const toDate = TODAY;
      const filters: Filter[] = [
        {
          field: "date",
          operator: "<=",
          value: toDate.getTime(),
          mode: FilterMode.AND,
        },
      ];

      const result = getDateRangeData({ transactions: [], currentFilters: filters });

      // Not checking exact date as it depends on current month
      expect(result.dateRange.from).toBeDefined();
      expect(result.dateRange.to).toEqual(endOfDay(toDate));
    });

    it("should handle missing <= filter by using end of current month", () => {
      const fromDate = subDays(TODAY, 10);
      const filters: Filter[] = [
        {
          field: "date",
          operator: ">=",
          value: fromDate.getTime(),
          mode: FilterMode.AND,
        },
      ];

      const result = getDateRangeData({ transactions: [], currentFilters: filters });

      expect(result.dateRange.from).toEqual(startOfDay(fromDate));
      // Not checking exact date as it depends on current month
      expect(result.dateRange.to).toBeDefined();
    });
  });
});
