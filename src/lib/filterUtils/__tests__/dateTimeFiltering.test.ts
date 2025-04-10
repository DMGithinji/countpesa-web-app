import { MoneyMode, Transaction, TransactionTypes } from "@/types/Transaction";
import { Filter, FilterMode } from "@/types/Filters";
import { filterTransactions } from "@/lib/filterUtils/filter";

const mockTransactions: Transaction[] = [
  {
    id: "1",
    code: "ABC123",
    date: new Date("2023-05-01T10:30:00").getTime(),
    description: "Agent deposit",
    status: "Completed",
    amount: 350,
    account: "Agent XYZ",
    balance: 5000,
    transactionType: TransactionTypes.Agent,
    category: "Transfer: Agent",
    createdAt: new Date("2023-05-01T10:35:00").getTime(),
    dayOfWeek: "Monday",
    hour: "10:30",
    mode: MoneyMode.MoneyIn,
  },
  {
    id: "2",
    code: "DEF456",
    date: new Date("2023-05-02T14:45:00").getTime(),
    description: "Salary deposit",
    status: "Completed",
    amount: 50000,
    account: "Employer XYZ",
    balance: 55000,
    transactionType: TransactionTypes.MoneyTransfer,
    category: "Income: Salary",
    createdAt: new Date("2023-05-02T14:50:00").getTime(),
    dayOfWeek: "Tuesday",
    hour: "14:45",
    mode: MoneyMode.MoneyIn,
  },
  {
    id: "3",
    code: "GHI789",
    date: new Date("2023-05-03T09:15:00").getTime(),
    description: "Grocery shopping",
    status: "Completed",
    amount: -2500,
    account: "Supermarket ABC",
    balance: 52500,
    transactionType: TransactionTypes.TillNo,
    category: "Food: Groceries",
    createdAt: new Date("2023-05-03T09:20:00").getTime(),
    dayOfWeek: "Wednesday",
    hour: "09:15",
    mode: MoneyMode.MoneyOut,
  },
  {
    id: "4",
    code: "JKL012",
    date: new Date("2023-05-03T18:00:00").getTime(),
    description: "Electricity bill",
    status: "Completed",
    amount: -1850,
    account: "KPCL",
    balance: 50650,
    transactionType: TransactionTypes.Paybill,
    category: "Bills & Utilities: Electricity",
    createdAt: new Date("2023-05-03T18:05:00").getTime(),
    dayOfWeek: "Wednesday",
    hour: "18:00",
    mode: MoneyMode.MoneyOut,
  },
  {
    id: "5",
    code: "MNO345",
    date: new Date("2023-05-04T11:20:00").getTime(),
    description: "Send money to friend",
    status: "Completed",
    amount: -1000,
    account: "John Doe",
    balance: 49650,
    transactionType: TransactionTypes.SendMoney,
    category: "Transfer",
    createdAt: new Date("2023-05-04T11:25:00").getTime(),
    dayOfWeek: "Thursday",
    hour: "11:20",
    mode: MoneyMode.MoneyOut,
  },
  {
    id: "6",
    code: "PQR678",
    date: new Date("2023-05-05T16:40:00").getTime(),
    description: "Transaction fee",
    status: "Completed",
    amount: -30,
    account: "Safaricom",
    balance: 49620,
    transactionType: TransactionTypes.SendMoney,
    category: "Transaction Cost",
    createdAt: new Date("2023-05-05T12:45:00").getTime(),
    dayOfWeek: "Friday",
    hour: "16:40",
    mode: MoneyMode.MoneyOut,
  },
  {
    id: "7",
    code: "STU901",
    date: new Date("2023-05-06T13:10:00").getTime(),
    description: "Restaurant lunch",
    status: "Completed",
    amount: -1200,
    account: "Restaurant XYZ",
    balance: 48420,
    transactionType: TransactionTypes.TillNo,
    category: "Food: Eating Out",
    createdAt: new Date("2023-05-06T13:15:00").getTime(),
    dayOfWeek: "Saturday",
    hour: "13:10",
    mode: MoneyMode.MoneyOut,
  },
  {
    id: "8",
    code: "VWX234",
    date: new Date("2023-05-06T17:30:00").getTime(),
    description: "Money received from friend",
    status: "Completed",
    amount: 2000,
    account: "Jane Smith",
    balance: 50420,
    transactionType: TransactionTypes.SendMoney,
    category: "Transfer",
    createdAt: new Date("2023-05-06T17:35:00").getTime(),
    dayOfWeek: "Saturday",
    hour: "17:30",
    mode: MoneyMode.MoneyIn,
  },
  {
    id: "9",
    code: "YZA567",
    date: new Date("2023-05-07T09:50:00").getTime(),
    description: "Uncategorized transaction",
    status: "Completed",
    amount: -500,
    account: "Unknown Vendor",
    balance: 49920,
    transactionType: TransactionTypes.TillNo,
    category: "Uncategorized",
    createdAt: new Date("2023-05-07T09:55:00").getTime(),
    dayOfWeek: "Sunday",
    hour: "09:50",
    mode: MoneyMode.MoneyOut,
  },
];

describe("filterTransactions - Date Tests", () => {
  // Date filter tests
  describe("Date equality (==) filter", () => {
    test("filters transactions by exact date match regardless of time", () => {
      const targetDate = new Date("2023-05-03").getTime();
      const filter: Filter = {
        field: "date",
        operator: "==",
        value: targetDate,
        mode: FilterMode.AND,
      };

      const result = filterTransactions(mockTransactions, filter);

      expect(result).toHaveLength(2);
      expect(result.map((t) => t.id).sort()).toEqual(["3", "4"].sort());
    });

    test("handles date equality with different time portions", () => {
      // Using a specific time, but should still match all transactions on that day
      const targetDate = new Date("2023-05-03T12:00:00").getTime();
      const filter: Filter = {
        field: "date",
        operator: "==",
        value: targetDate,
        mode: FilterMode.AND,
      };

      const result = filterTransactions(mockTransactions, filter);

      expect(result).toHaveLength(2);
      expect(result.map((t) => t.id).sort()).toEqual(["3", "4"].sort());
    });
  });

  describe("Date greater than (>) filter", () => {
    test("filters transactions by date greater than a specific date", () => {
      // Transactions after 15:00 on May 5th
      const targetDate = new Date("2023-05-05T15:00:00").getTime();
      const filter: Filter = {
        field: "date",
        operator: ">",
        value: targetDate,
        mode: FilterMode.AND,
      };

      const result = filterTransactions(mockTransactions, filter);

      // Should include transaction #6 and all later transactions
      expect(result).toHaveLength(4);
      expect(result.map((t) => t.id).sort()).toEqual(["6", "7", "8", "9"].sort());
    });

    test("correctly handles end of day boundary for greater than", () => {
      // End of May 5th
      const targetDate = new Date("2023-05-05T23:59:59").getTime();
      const filter: Filter = {
        field: "date",
        operator: ">",
        value: targetDate,
        mode: FilterMode.AND,
      };

      const result = filterTransactions(mockTransactions, filter);

      // Should only include transactions on May 6th and later
      expect(result).toHaveLength(3);
      expect(result.map((t) => t.id).sort()).toEqual(["7", "8", "9"].sort());
    });
  });

  describe("Date less than (<) filter", () => {
    test("filters transactions by date less than a specific date", () => {
      const targetDate = new Date("2023-05-03").getTime();
      const filter: Filter = {
        field: "date",
        operator: "<",
        value: targetDate,
        mode: FilterMode.AND,
      };

      const result = filterTransactions(mockTransactions, filter);

      expect(result).toHaveLength(2);
      expect(result.map((t) => t.id).sort()).toEqual(["1", "2"].sort());
    });

    test("ensures transactions on the same day but before specified time are included", () => {
      // Transactions before 12:00 on May 3rd
      const targetDate = new Date("2023-05-03T12:00:00").getTime();
      const filter: Filter = {
        field: "date",
        operator: "<",
        value: targetDate,
        mode: FilterMode.AND,
      };

      const result = filterTransactions(mockTransactions, filter);

      // Should include transactions #1, #2, and #3 (May 1st, 2nd, and morning of 3rd)
      expect(result).toHaveLength(3);
      expect(result.map((t) => t.id).sort()).toEqual(["1", "2", "3"].sort());
    });

    test("correctly handles start of day boundary for less than", () => {
      // Start of May 3rd
      const targetDate = new Date("2023-05-03T00:00:00").getTime();
      const filter: Filter = {
        field: "date",
        operator: "<",
        value: targetDate,
        mode: FilterMode.AND,
      };

      const result = filterTransactions(mockTransactions, filter);

      // Should only include transactions before May 3rd
      expect(result).toHaveLength(2);
      expect(result.map((t) => t.id).sort()).toEqual(["1", "2"].sort());
    });
  });

  describe("Date range filters", () => {
    test("filters transactions within a date range (inclusive)", () => {
      const filters: Filter[] = [
        {
          field: "date",
          operator: ">=",
          value: new Date("2023-05-03").getTime(),
          mode: FilterMode.AND,
        },
        {
          field: "date",
          operator: "<=",
          value: new Date("2023-05-05").getTime(),
          mode: FilterMode.AND,
        },
      ];

      const result = filterTransactions(mockTransactions, filters);

      expect(result).toHaveLength(4);
      expect(result.map((t) => t.id).sort()).toEqual(["3", "4", "5", "6"].sort());
    });

    test("filters transactions with specific time boundaries within the same day", () => {
      // Transactions between 08:00 and 19:00 on May 3rd
      const filters: Filter[] = [
        {
          field: "date",
          operator: ">=",
          value: new Date("2023-05-03T08:00:00").getTime(),
          mode: FilterMode.AND,
        },
        {
          field: "date",
          operator: "<=",
          value: new Date("2023-05-03T19:00:00").getTime(),
          mode: FilterMode.AND,
        },
      ];

      const result = filterTransactions(mockTransactions, filters);

      // Should include transactions #3 and #4 only (both on May 3rd)
      expect(result).toHaveLength(2);
      expect(result.map((t) => t.id).sort()).toEqual(["3", "4"].sort());
    });

    test("handles date ranges with no matching transactions", () => {
      // Transactions between May 8th and May 10th (no transactions in test data)
      const filters: Filter[] = [
        {
          field: "date",
          operator: ">=",
          value: new Date("2023-05-08").getTime(),
          mode: FilterMode.AND,
        },
        {
          field: "date",
          operator: "<=",
          value: new Date("2023-05-10").getTime(),
          mode: FilterMode.AND,
        },
      ];

      const result = filterTransactions(mockTransactions, filters);

      expect(result).toHaveLength(0);
    });
  });

  describe("Day of week filters", () => {
    test("filters transactions by specific day of week", () => {
      const filter: Filter = {
        field: "dayOfWeek",
        operator: "==",
        value: "Wednesday",
        mode: FilterMode.AND,
      };

      const result = filterTransactions(mockTransactions, filter);

      expect(result).toHaveLength(2);
      expect(result.map((t) => t.id).sort()).toEqual(["3", "4"].sort());
    });

    test("filters transactions by not equal to specific day of week", () => {
      const filter: Filter = {
        field: "dayOfWeek",
        operator: "!=",
        value: "Wednesday",
        mode: FilterMode.AND,
      };

      const result = filterTransactions(mockTransactions, filter);

      expect(result).toHaveLength(7);
      expect(result.map((t) => t.id)).not.toContain("3");
      expect(result.map((t) => t.id)).not.toContain("4");
    });

    test("filters transactions by weekend days (OR logic)", () => {
      const filters: Filter[] = [
        {
          field: "dayOfWeek",
          operator: "==",
          value: "Saturday",
          mode: FilterMode.OR,
        },
        {
          field: "dayOfWeek",
          operator: "==",
          value: "Sunday",
          mode: FilterMode.OR,
        },
      ];

      const result = filterTransactions(mockTransactions, filters);

      expect(result).toHaveLength(3);
      expect(result.map((t) => t.id).sort()).toEqual(["7", "8", "9"].sort());
    });

    test("combines day of week with date range filter", () => {
      const filters: Filter[] = [
        {
          field: "dayOfWeek",
          operator: "==",
          value: "Saturday",
          mode: FilterMode.AND,
        },
        {
          field: "date",
          operator: ">=",
          value: new Date("2023-05-06").getTime(),
          mode: FilterMode.AND,
        },
      ];

      const result = filterTransactions(mockTransactions, filters);

      expect(result).toHaveLength(2);
      expect(result.map((t) => t.id).sort()).toEqual(["7", "8"].sort());
    });
  });

  describe("Hour (time) filters", () => {
    test("filters transactions by specific hour", () => {
      const filter: Filter = {
        field: "hour",
        operator: "==",
        value: "10:30",
        mode: FilterMode.AND,
      };

      const result = filterTransactions(mockTransactions, filter);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    test("filters transactions by hour greater than", () => {
      const filter: Filter = {
        field: "hour",
        operator: ">",
        value: "16:00", // 4 PM
        mode: FilterMode.AND,
      };

      const result = filterTransactions(mockTransactions, filter);

      // Transactions after 16:00 (4 PM)
      expect(result).toHaveLength(3);
      expect(result.map((t) => t.id).sort()).toEqual(["4", "6", "8"].sort());
    });

    test("filters transactions by hour less than", () => {
      const filter: Filter = {
        field: "hour",
        operator: "<",
        value: "12:00", // noon
        mode: FilterMode.AND,
      };

      const result = filterTransactions(mockTransactions, filter);

      // Transactions before noon
      expect(result).toHaveLength(4);
      expect(result.map((t) => t.id).sort()).toEqual(["1", "5", "3", "9"].sort());
    });

    test("filters transactions by hour range", () => {
      const filters: Filter[] = [
        {
          field: "hour",
          operator: ">=",
          value: "12:00", // noon
          mode: FilterMode.AND,
        },
        {
          field: "hour",
          operator: "<=",
          value: "16:00", // 4 PM
          mode: FilterMode.AND,
        },
      ];

      const result = filterTransactions(mockTransactions, filters);

      // Transactions between noon and 4 PM
      expect(result).toHaveLength(2);
      expect(result.map((t) => t.id).sort()).toEqual(["2", "7"].sort());
    });

    test("combines hour filter with day of week", () => {
      const filters: Filter[] = [
        {
          field: "hour",
          operator: ">",
          value: "16:00", // after 4 PM
          mode: FilterMode.AND,
        },
        {
          field: "dayOfWeek",
          operator: "==",
          value: "Saturday",
          mode: FilterMode.AND,
        },
      ];

      const result = filterTransactions(mockTransactions, filters);

      // Transactions on Saturday after 4 PM
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("8");
    });
  });
});
