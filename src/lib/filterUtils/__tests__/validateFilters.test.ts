import { Filter, FilterMode } from "@/types/Filters";
import { removeFilters, validateAndAddFilters } from "../validateFilters";

describe("validateAndAddFilters", () => {
  // Test Case 1: Adding a single filter to empty state
  test("adds a single filter to empty state", () => {
    const newFilter: Filter = {
      field: "category",
      operator: "==",
      value: "Food",
    };

    const result = validateAndAddFilters(undefined, newFilter);

    expect(result).toEqual([
      {
        field: "category",
        operator: "==",
        value: "Food",
        mode: FilterMode.AND,
      },
    ]);
  });

  // Test Case 2: Adding a single filter to existing filters
  test("adds a new filter with different field to existing filters", () => {
    const currentFilters: Filter[] = [
      {
        field: "category",
        operator: "==",
        value: "Food",
        mode: FilterMode.AND,
      },
    ];

    const newFilter: Filter = {
      field: "account",
      operator: "==",
      value: "Alice",
    };

    const result = validateAndAddFilters(currentFilters, newFilter);

    expect(result).toEqual([
      {
        field: "category",
        operator: "==",
        value: "Food",
        mode: FilterMode.AND,
      },
      {
        field: "account",
        operator: "==",
        value: "Alice",
        mode: FilterMode.AND,
      },
    ]);
  });

  // Test Case 3: Adding an array of filters
  test("adds multiple filters as an array", () => {
    const newFilters: Filter[] = [
      {
        field: "category",
        operator: "==",
        value: "Food",
      },
      {
        field: "amount",
        operator: ">",
        value: 100,
      },
    ];

    const result = validateAndAddFilters(undefined, newFilters);

    expect(result).toEqual([
      {
        field: "category",
        operator: "==",
        value: "Food",
        mode: FilterMode.AND,
      },
      {
        field: "amount",
        operator: ">",
        value: 100,
        mode: FilterMode.AND,
      },
    ]);
  });

  // Test Case 4: Special case - Adding a date range pair
  test("replaces all existing date filters when adding a date range pair", () => {
    const currentFilters: Filter[] = [
      {
        field: "date",
        operator: "==",
        value: 1612137600000, // 2021-02-01
        mode: FilterMode.AND,
      },
      {
        field: "category",
        operator: "==",
        value: "Food",
        mode: FilterMode.AND,
      },
    ];

    const dateRangePair: Filter[] = [
      {
        field: "date",
        operator: ">=",
        value: 1614556800000, // 2021-03-01
      },
      {
        field: "date",
        operator: "<=",
        value: 1617235199000, // 2021-03-31
      },
    ];

    const result = validateAndAddFilters(currentFilters, dateRangePair);

    expect(result).toHaveLength(3);
    expect(result).toContainEqual({
      field: "category",
      operator: "==",
      value: "Food",
      mode: FilterMode.AND,
    });
    expect(result).toContainEqual({
      field: "date",
      operator: ">=",
      value: 1614556800000,
      mode: FilterMode.AND,
    });
    expect(result).toContainEqual({
      field: "date",
      operator: "<=",
      value: 1617235199000,
      mode: FilterMode.AND,
    });
  });

  // Test Case 5: Rule 1 - Same field, same operator, different values
  test("handles same field, same operator, different values by setting OR mode", () => {
    const currentFilters: Filter[] = [
      {
        field: "category",
        operator: "==",
        value: "Food",
        mode: FilterMode.AND,
      },
    ];

    const newFilter: Filter = {
      field: "category",
      operator: "==",
      value: "Transport",
    };

    const result = validateAndAddFilters(currentFilters, newFilter);

    expect(result).toEqual([
      {
        field: "category",
        operator: "==",
        value: "Food",
        mode: FilterMode.OR,
      },
      {
        field: "category",
        operator: "==",
        value: "Transport",
        mode: FilterMode.OR,
      },
    ]);
  });

  // Test Case 6: Rule 2 - Same field, opposite operators
  test("replaces filter when using opposite operators on same field", () => {
    const currentFilters: Filter[] = [
      {
        field: "amount",
        operator: "<=",
        value: 100,
        mode: FilterMode.AND,
      },
    ];

    const newFilter: Filter = {
      field: "amount",
      operator: ">",
      value: 200,
    };

    const result = validateAndAddFilters(currentFilters, newFilter);

    expect(result).toEqual([
      {
        field: "amount",
        operator: ">",
        value: 200,
        mode: FilterMode.AND,
      },
    ]);
  });

  // Test Case 7: Rule 3 - Filter already exists
  test("updates existing filter if it matches exactly", () => {
    const currentFilters: Filter[] = [
      {
        field: "category",
        operator: "==",
        value: "Food",
        mode: FilterMode.AND,
      },
    ];

    const newFilter: Filter = {
      field: "category",
      operator: "==",
      value: "Food",
    };

    const result = validateAndAddFilters(currentFilters, newFilter);

    expect(result).toEqual([
      {
        field: "category",
        operator: "==",
        value: "Food",
        mode: FilterMode.AND,
      },
    ]);
  });

  // Test Case 8: Rule 4 - Same field, different operator, different value
  test("adds as AND when same field has different operator and value", () => {
    const currentFilters: Filter[] = [
      {
        field: "amount",
        operator: ">",
        value: 100,
        mode: FilterMode.AND,
      },
    ];

    const newFilter: Filter = {
      field: "amount",
      operator: "<",
      value: 500,
    };

    const result = validateAndAddFilters(currentFilters, newFilter);

    expect(result).toEqual([
      {
        field: "amount",
        operator: ">",
        value: 100,
        mode: FilterMode.AND,
      },
      {
        field: "amount",
        operator: "<",
        value: 500,
        mode: FilterMode.AND,
      },
    ]);
  });

  // Test Case 9: Adding a filter with != operator
  test("adds a new filter even if existing one has the same field with != operator", () => {
    const currentFilters: Filter[] = [
      {
        field: "category",
        operator: "!=",
        value: "Food",
        mode: FilterMode.AND,
      },
    ];

    const newFilter: Filter = {
      field: "category",
      operator: "==",
      value: "Transport",
    };

    const result = validateAndAddFilters(currentFilters, newFilter);

    expect(result).toHaveLength(2);
    expect(result).toContainEqual({
      field: "category",
      operator: "!=",
      value: "Food",
      mode: FilterMode.AND,
    });
    expect(result).toContainEqual({
      field: "category",
      operator: "==",
      value: "Transport",
      mode: FilterMode.AND,
    });
  });
});

describe("removeFilters", () => {
  // Test Case 1: Remove a single filter
  test("removes a single filter", () => {
    const currentFilters: Filter[] = [
      {
        field: "category",
        operator: "==",
        value: "Food",
        mode: FilterMode.AND,
      },
      {
        field: "amount",
        operator: ">",
        value: 100,
        mode: FilterMode.AND,
      },
    ];

    const filterToRemove: Filter = currentFilters[0];

    const result = removeFilters(currentFilters, filterToRemove);

    expect(result).toEqual([
      {
        field: "amount",
        operator: ">",
        value: 100,
        mode: FilterMode.AND,
      },
    ]);
  });

  // Test Case 2: Remove multiple filters
  test("removes multiple filters", () => {
    const currentFilters: Filter[] = [
      {
        field: "category",
        operator: "==",
        value: "Food",
        mode: FilterMode.AND,
      },
      {
        field: "amount",
        operator: ">",
        value: 100,
        mode: FilterMode.AND,
      },
      {
        field: "date",
        operator: ">=",
        value: 1614556800000,
        mode: FilterMode.AND,
      },
    ];

    const filtersToRemove: Filter[] = [currentFilters[0], currentFilters[2]];

    const result = removeFilters(currentFilters, filtersToRemove);

    expect(result).toEqual([
      {
        field: "amount",
        operator: ">",
        value: 100,
        mode: FilterMode.AND,
      },
    ]);
  });

  // Test Case 3: Removing from empty or undefined filters
  test("returns undefined when removing from undefined filters", () => {
    const filterToRemove: Filter = {
      field: "category",
      operator: "==",
      value: "Food",
      mode: FilterMode.AND,
    };

    const result = removeFilters(undefined, filterToRemove);

    expect(result).toBeUndefined();
  });

  // Test Case 4: Removing a non-existent filter
  test("returns original filters when filter to remove does not exist", () => {
    const currentFilters: Filter[] = [
      {
        field: "category",
        operator: "==",
        value: "Food",
        mode: FilterMode.AND,
      },
    ];

    const filterToRemove: Filter = {
      field: "amount",
      operator: ">",
      value: 100,
      mode: FilterMode.AND,
    };

    const result = removeFilters(currentFilters, filterToRemove);

    expect(result).toEqual(currentFilters);
  });

  // Test Case 5: Removing the last filter
  test("returns undefined when removing the only filter", () => {
    const currentFilters: Filter[] = [
      {
        field: "category",
        operator: "==",
        value: "Food",
        mode: FilterMode.AND,
      },
    ];

    const filterToRemove: Filter = currentFilters[0];

    const result = removeFilters(currentFilters, filterToRemove);

    expect(result).toEqual([]);
  });
});
