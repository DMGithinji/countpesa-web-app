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
    createdAt: new Date("2023-05-05T16:45:00").getTime(),
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

describe("filterTransactions", () => {
  // Basic field filtering tests
  describe("basic field filtering", () => {
    test("filters by id field with equals operator", () => {
      const filter: Filter = {
        field: "id",
        operator: "==",
        value: "5",
        mode: FilterMode.AND,
      };
      const result = filterTransactions(mockTransactions, filter);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("5");
    });

    test("filters by code field with equals operator", () => {
      const filter: Filter = {
        field: "code",
        operator: "==",
        value: "ABC123",
        mode: FilterMode.AND,
      };
      const result = filterTransactions(mockTransactions, filter);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    test("filters by description field with contains operator", () => {
      const filter: Filter = {
        field: "description",
        operator: "contains",
        value: "deposit",
        mode: FilterMode.AND,
      };
      const result = filterTransactions(mockTransactions, filter);
      expect(result).toHaveLength(2);
      expect(result.map((t) => t.id).sort()).toEqual(["1", "2"]);
    });

    test("filters by status field with equals operator", () => {
      const filter: Filter = {
        field: "status",
        operator: "==",
        value: "Completed",
        mode: FilterMode.AND,
      };
      const result = filterTransactions(mockTransactions, filter);
      expect(result).toHaveLength(9); // All are completed
    });

    test("filters by account field with equals operator", () => {
      const filter: Filter = {
        field: "account",
        operator: "==",
        value: "John Doe",
        mode: FilterMode.AND,
      };
      const result = filterTransactions(mockTransactions, filter);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("5");
    });

    test("filters by transactionType field with equals operator", () => {
      const filter: Filter = {
        field: "transactionType",
        operator: "==",
        value: TransactionTypes.TillNo,
        mode: FilterMode.AND,
      };
      const result = filterTransactions(mockTransactions, filter);
      expect(result).toHaveLength(3);
      expect(result.map((t) => t.id).sort()).toEqual(["3", "7", "9"]);
    });

    test("filters by amount with greater than operator", () => {
      const filter: Filter = {
        field: "amount",
        operator: ">",
        value: 1000,
        mode: FilterMode.AND,
      };
      const result = filterTransactions(mockTransactions, filter);
      expect(result).toHaveLength(5);
      expect(result.map((t) => t.id).sort()).toEqual(["2", "3", "4", "7", "8"]);
    });

    test("filters by amount with less than operator", () => {
      const filter: Filter = {
        field: "amount",
        operator: "<",
        value: -1500,
        mode: FilterMode.AND,
      };
      const result = filterTransactions(mockTransactions, filter);
      expect(result).toHaveLength(5);
      expect(result.map((t) => t.id).sort()).toEqual(["1", "5", "6", "7", "9"]);
    });

    test("filters by category field with equals operator", () => {
      const filter: Filter = {
        field: "category",
        operator: "==",
        value: "Transfer",
        mode: FilterMode.AND,
      };
      const result = filterTransactions(mockTransactions, filter);
      expect(result).toHaveLength(3);
      expect(result.map((t) => t.id).sort()).toEqual(["1", "5", "8"]);
    });

    test("filters by subcategory field with equals operator", () => {
      const filter: Filter = {
        field: "subcategory",
        operator: "==",
        value: "Electricity",
        mode: FilterMode.AND,
      };
      const result = filterTransactions(mockTransactions, filter);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("4");
    });

    test("filters by mode field with equals operator", () => {
      const filter: Filter = {
        field: "mode",
        operator: "==",
        value: MoneyMode.MoneyIn,
        mode: FilterMode.AND,
      };
      const result = filterTransactions(mockTransactions, filter);
      expect(result).toHaveLength(3);
      expect(result.map((t) => t.id).sort()).toEqual(["1", "2", "8"]);
    });

    test("filters by dayOfWeek field with equals operator", () => {
      const filter: Filter = {
        field: "dayOfWeek",
        operator: "==",
        value: "Wednesday",
        mode: FilterMode.AND,
      };
      const result = filterTransactions(mockTransactions, filter);
      expect(result).toHaveLength(2);
      expect(result.map((t) => t.id).sort()).toEqual(["3", "4"]);
    });

    test("filters by dayOfWeek field with not equals operator", () => {
      const filter: Filter = {
        field: "dayOfWeek",
        operator: "!=",
        value: "Saturday",
        mode: FilterMode.AND,
      };
      const result = filterTransactions(mockTransactions, filter);
      expect(result).toHaveLength(7);
      expect(result.map((t) => t.id).sort()).toEqual(["1", "2", "3", "4", "5", "6", "9"]);
    });

    test("filters by hour field with equals operator", () => {
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

    test("filters by createdAt field with greater than or equal operator", () => {
      const filter: Filter = {
        field: "createdAt",
        operator: ">=",
        value: new Date("2023-05-05T00:00:00").getTime(),
        mode: FilterMode.AND,
      };
      const result = filterTransactions(mockTransactions, filter);
      expect(result).toHaveLength(4);
      expect(result.map((t) => t.id).sort()).toEqual(["6", "7", "8", "9"]);
    });
  });

  // Category and subcategory tests
  describe("category and subcategory filtering", () => {
    test("filters by top-level category with contains operator", () => {
      const filter: Filter = {
        field: "category",
        operator: "contains",
        value: "Food",
        mode: FilterMode.AND,
      };
      const result = filterTransactions(mockTransactions, filter);
      expect(result).toHaveLength(2);
      expect(result.map((t) => t.id).sort()).toEqual(["3", "7"]);
    });

    test("filters by category with subcategory part", () => {
      const filter: Filter = {
        field: "category",
        operator: "contains",
        value: "Groceries",
        mode: FilterMode.AND,
      };
      const result = filterTransactions(mockTransactions, filter);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("3");
    });

    test("filters by subcategory field only", () => {
      const filter: Filter = {
        field: "subcategory",
        operator: "==",
        value: "Salary",
        mode: FilterMode.AND,
      };
      const result = filterTransactions(mockTransactions, filter);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("2");
    });

    test("filters by subcategory with contains operator", () => {
      const filter: Filter = {
        field: "subcategory",
        operator: "contains",
        value: "Eat",
        mode: FilterMode.AND,
      };
      const result = filterTransactions(mockTransactions, filter);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("7");
    });
  });

  // Multiple filters and logical operators tests
  describe("combined filters and logical operators", () => {
    test("combines multiple filters with AND logic", () => {
      const filters: Filter[] = [
        {
          field: "dayOfWeek",
          operator: "==",
          value: "Wednesday",
          mode: FilterMode.AND,
        },
        {
          field: "amount",
          operator: "<",
          value: 2000,
          mode: FilterMode.AND,
        },
        {
          field: "mode",
          operator: "==",
          value: MoneyMode.MoneyOut,
          mode: FilterMode.AND,
        },
      ];
      const result = filterTransactions(mockTransactions, filters);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("4");
    });

    test("combines multiple filters with OR logic", () => {
      const filters: Filter[] = [
        {
          field: "account",
          operator: "==",
          value: "Employer XYZ",
          mode: FilterMode.OR,
        },
        {
          field: "account",
          operator: "==",
          value: "Jane Smith",
          mode: FilterMode.OR,
        },
      ];
      const result = filterTransactions(mockTransactions, filters);
      expect(result).toHaveLength(2);
      expect(result.map((t) => t.id).sort()).toEqual(["2", "8"]);
    });

    test("handles mixed AND/OR logic correctly", () => {
      const filters: Filter[] = [
        {
          field: "mode",
          operator: "==",
          value: MoneyMode.MoneyOut,
          mode: FilterMode.AND,
        },
        {
          field: "category",
          operator: "==",
          value: "Bills & Utilities",
          mode: FilterMode.OR,
        },
        {
          field: "category",
          operator: "==",
          value: "Food",
          mode: FilterMode.OR,
        },
      ];
      const result = filterTransactions(mockTransactions, filters);
      expect(result).toHaveLength(3);
      expect(result.map((t) => t.id).sort()).toEqual(["3", "4", "7"]);
    });

    test("combines date, category, and mode filters", () => {
      const filters: Filter[] = [
        {
          field: "date",
          operator: ">=",
          value: new Date("2023-05-03").getTime(),
          mode: FilterMode.AND,
        },
        {
          field: "mode",
          operator: "==",
          value: MoneyMode.MoneyOut,
          mode: FilterMode.AND,
        },
        {
          field: "category",
          operator: "!=",
          value: "Transaction Cost",
          mode: FilterMode.AND,
        },
      ];
      const result = filterTransactions(mockTransactions, filters);
      expect(result).toHaveLength(5);
      expect(result.map((t) => t.id).sort()).toEqual(["3", "4", "5", "7", "9"]);
    });
  });

  // Edge cases
  describe("edge cases", () => {
    test("returns all transactions when no filters are provided", () => {
      const result = filterTransactions(mockTransactions, []);
      expect(result).toHaveLength(9);
    });

    test("returns empty array when no transactions match filter", () => {
      const filter: Filter = {
        field: "account",
        operator: "==",
        value: "Non-existent Account",
        mode: FilterMode.AND,
      };
      const result = filterTransactions(mockTransactions, filter);
      expect(result).toHaveLength(0);
    });

    test("handles case-insensitive string comparison properly", () => {
      const filter: Filter = {
        field: "account",
        operator: "contains",
        value: "john",
        mode: FilterMode.AND,
      };
      const result = filterTransactions(mockTransactions, filter);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("5");
    });

    test("handles absolute value comparison for amounts", () => {
      const filter: Filter = {
        field: "amount",
        operator: "==",
        value: 1200,
        mode: FilterMode.AND,
      };
      const result = filterTransactions(mockTransactions, filter);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("7"); // Amount is -1200, but we're comparing absolute values
    });
  });
});
