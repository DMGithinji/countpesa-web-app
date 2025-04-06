import Dexie from "dexie";
import { Filter, FilterField, FilterMode, Query } from "@/types/Filters";
import { MoneyMode, Transaction } from "@/types/Transaction";
import { format, isSameDay } from "date-fns";
import { deconstructTrCategory } from "@/lib/categoryUtils";

// Define operator types for better type safety
export type ComparisonOperator = "==" | "!=" | "<" | "<=" | ">" | ">=";
export type TextOperator = "contains" | "contains-any";
export type ArrayOperator = "in" | "not-in";
export type FilterOperator = ComparisonOperator | TextOperator | ArrayOperator;


export abstract class AbstractQuery {
  /**
   * The database table/collection to query
   */
  protected abstract getTable(): Dexie.Table<Transaction>;

  /**
   * Evaluates a single filter against an item
   * Central method for all filter evaluation logic
   */
  protected evaluateFilter(item: Transaction, filter: Filter): boolean {
    const { field, operator } = filter;
    const value = filter.value;

    // Handle special field types with their own evaluation logic
    if (field === "hour" && this.isTimeOperator(operator)) {
      return this.evaluateTimeFilter(item.date, value as string, operator);
    }

    if (field === "mode" && this.isEqualityOperator(operator)) {
      return this.evaluateModeFilter(item.amount, value as MoneyMode, operator);
    }

    if (field === "dayOfWeek" && this.isEqualityOperator(operator)) {
      return this.evaluateDayOfWeekFilter(item.date, value as string, operator);
    }

    if (field === "date" && operator === "==" && typeof value === "number") {
      return this.evaluateDateFilter(item.date, value);
    }

    // Get field value with special handling for amount (absolute value comparison)
    let fieldValue = this.getItemValue(item, field);
    if (field === "amount" && typeof value === "number") {
      fieldValue = Math.abs(fieldValue);
      const absValue = Math.abs(value);
      return this.evaluateBasicFilter(fieldValue, absValue, operator);
    }

    // Handle standard filter evaluation
    return this.evaluateBasicFilter(fieldValue, value, operator);
  }

  /**
   * Basic filter evaluation for standard operators
   */
  private evaluateBasicFilter(fieldValue: any, value: any, operator: string): boolean {
    switch (operator) {
      case "==":
        return typeof fieldValue === "string" && typeof value === "string"
          ? fieldValue.toLowerCase() === value.toLowerCase()
          : fieldValue === value;
      case "!=":
        return fieldValue !== value;
      case "<":
        return fieldValue < value;
      case "<=":
        return fieldValue <= value;
      case ">":
        return fieldValue > value;
      case ">=":
        return fieldValue >= value;
      case "contains":
        return (
          typeof fieldValue === "string" &&
          typeof value === "string" &&
          fieldValue.toLowerCase().includes(value.toLowerCase())
        );
      case "contains-any":
        if (typeof value === "string" && typeof fieldValue === "string") {
          const terms = value.toLowerCase().split(/\s+/);
          const fieldValueLower = fieldValue.toLowerCase();
          return terms.some(term => fieldValueLower.includes(term));
        }
        return false;
      case "in":
        return Array.isArray(value) && value.includes(fieldValue);
      case "not-in":
        return Array.isArray(value) && !value.includes(fieldValue);
      default:
        return false;
    }
  }

  /**
   * Specialized filter for comparing time values
   */
  private evaluateTimeFilter(
    trDateInSeconds: number,
    timeStr: string,
    operator: ComparisonOperator
  ): boolean {
    return compareTime(trDateInSeconds, timeStr, operator as "<=" | ">=" | "<" | ">");
  }

  /**
   * Specialized filter for comparing money mode
   */
  private evaluateModeFilter(
    trAmount: number,
    mode: MoneyMode,
    operator: ComparisonOperator
  ): boolean {
    const isMoneyOut = trAmount < 0;
    const isTargetMode = mode === MoneyMode.MoneyOut ? isMoneyOut : !isMoneyOut;
    return operator === "==" ? isTargetMode : !isTargetMode;
  }

  /**
   * Specialized filter for comparing days of week
   */
  private evaluateDayOfWeekFilter(
    trDateInSeconds: number,
    dayOfWeek: string,
    operator: ComparisonOperator
  ): boolean {
    return compareDayOfWeek(trDateInSeconds, dayOfWeek, operator as "==" | "!=");
  }

  /**
   * Specialized filter for exact date matching
   */
  private evaluateDateFilter(trDateInSeconds: number, date: number): boolean {
    return compareDate(trDateInSeconds, date);
  }

  /**
   * Type guard for time comparison operators
   */
  private isTimeOperator(operator: string): operator is "<=" | ">=" | "<" | ">" {
    return ["<=", ">=", "<", ">"].includes(operator);
  }

  /**
   * Type guard for equality operators
   */
  private isEqualityOperator(operator: string): operator is "==" | "!=" {
    return ["==", "!="].includes(operator);
  }

  /**
   * Apply filters to a Dexie collection, optimized for AND/OR logic
   */
  protected applyFilters(
    collection: Dexie.Collection<Transaction>,
    filters: Filter[]
  ): Dexie.Collection<Transaction, number> {
    if (!filters || filters.length === 0) {
      return collection;
    }

    // Group filters by mode
    const andFilters = filters.filter(f => f.mode === FilterMode.AND || f.mode === undefined);
    const orFilters = filters.filter(f => f.mode === FilterMode.OR);

    // Apply filters using the most efficient approach
    return collection.filter(item => {
      // Short-circuit evaluation for AND filters
      if (andFilters.length > 0) {
        for (const filter of andFilters) {
          if (!this.evaluateFilter(item, filter)) {
            return false;
          }
        }
      }

      // Short-circuit evaluation for OR filters
      if (orFilters.length > 0) {
        if (orFilters.length === 0) {
          return true; // No OR filters, keep item if it passed AND filters
        }

        for (const filter of orFilters) {
          if (this.evaluateFilter(item, filter)) {
            return true;
          }
        }
        return false; // No OR filters matched
      }

      return true; // Passed all AND filters and no OR filters exist
    });
  }

  /**
   * Helper method to safely get a value from an item by field name
   * Ensures TypeScript safety with keyof Transaction
   */
  protected getItemValue(item: Transaction, field: FilterField): any {
    if (field === "category" || field === "subcategory") {
      const { category, subcategory } = deconstructTrCategory(item.category);
      return field === "category" ? category : subcategory;
    }
    return item[field as keyof Transaction];
  }

  /**
   * Query items with filtering, ordering, and pagination
   */
  async query(query: Query = {}): Promise<Transaction[]> {
    const {
      filters,
      orderBy = [{ field: "id", direction: "desc" }],
      limit,
      offset = 0,
    } = query;

    try {
      // Start with the table and apply primary sorting
      const primarySort = orderBy[0];
      let collection = this.getTable().orderBy(primarySort.field);

      if (primarySort.direction === "desc") {
        collection = collection.reverse();
      }

      // Apply filters if present
      if (filters && filters.length > 0) {
        collection = this.applyFilters(collection, filters);
      }

      // Apply offset and limit
      let result = collection;
      if (offset > 0) {
        result = result.offset(offset);
      }
      if (limit !== undefined && limit > 0) {
        result = result.limit(limit);
      }

      // Execute query and return results
      return result.toArray();
    } catch (error) {
      console.error("Query execution failed:", error);
      return [];
    }
  }
}

/**
 * Compare if transaction date matches the specified date (same day)
 */
function compareDate(trDateInSeconds: number, date: number): boolean {
  return isSameDay(new Date(trDateInSeconds), new Date(date));
}

/**
 * Compare transaction time against a specified time with operator
 */
function compareTime(
  trDateInSeconds: number,
  timeStr: string,
  operator: "<=" | ">=" | "<" | ">"
): boolean {
  const trDate = new Date(trDateInSeconds);

  // Parse hours and minutes from the time string
  const [hours, minutes] = timeStr.split(":").map(num => parseInt(num, 10));

  // Set the comparison time on the same date as the transaction
  const currentDateStart = new Date(trDate);
  currentDateStart.setHours(0, 0, 0, 0);

  const compareTime = new Date(currentDateStart);
  compareTime.setHours(hours, minutes, 0, 0);

  // Compare based on operator
  switch (operator) {
    case "<":
      return trDate < compareTime;
    case "<=":
      return trDate <= compareTime;
    case ">":
      return trDate > compareTime;
    case ">=":
      return trDate >= compareTime;
    default:
      return false;
  }
}

/**
 * Compare transaction's day of week with specified day
 */
function compareDayOfWeek(
  trDateInSeconds: number,
  dayOfWeek: string,
  operator: "==" | "!="
): boolean {
  const trDate = new Date(trDateInSeconds);
  const actualDay = format(trDate, "cccc");
  return operator === "==" ? actualDay === dayOfWeek : actualDay !== dayOfWeek;
}