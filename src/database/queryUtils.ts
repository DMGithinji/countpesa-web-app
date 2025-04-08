import { format, isSameDay } from "date-fns";
import { Filter, FilterField, FilterMode } from "@/types/Filters";
import { MoneyMode, Transaction } from "@/types/Transaction";
import { deconstructTrCategory } from "@/lib/categoryUtils";
import Dexie from "dexie";

// Define operator types for better type safety
export type ComparisonOperator = "==" | "!=" | "<" | "<=" | ">" | ">=";
export type TextOperator = "contains" | "contains-any";
export type ArrayOperator = "in" | "not-in";
export type FilterOperator = ComparisonOperator | TextOperator | ArrayOperator;

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
  const [hours, minutes] = timeStr.split(":").map((num) => parseInt(num, 10));

  // Set the comparison time on the same date as the transaction
  const currentDateStart = new Date(trDate);
  currentDateStart.setHours(0, 0, 0, 0);

  const comparedTime = new Date(currentDateStart);
  comparedTime.setHours(hours, minutes, 0, 0);

  // Compare based on operator
  switch (operator) {
    case "<":
      return trDate < comparedTime;
    case "<=":
      return trDate <= comparedTime;
    case ">":
      return trDate > comparedTime;
    case ">=":
      return trDate >= comparedTime;
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

/**
 * Type guard for time comparison operators
 */
function isTimeOperator(operator: string): operator is "<=" | ">=" | "<" | ">" {
  return ["<=", ">=", "<", ">"].includes(operator);
}

/**
 * Type guard for equality operators
 */
function isEqualityOperator(operator: string): operator is "==" | "!=" {
  return ["==", "!="].includes(operator);
}

/**
 * Basic filter evaluation for standard operators
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function evaluateBasicFilter(fieldValue: any, value: any, operator: string): boolean {
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
        return terms.some((term) => fieldValueLower.includes(term));
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
function evaluateTimeFilter(
  trDateInSeconds: number,
  timeStr: string,
  operator: ComparisonOperator
): boolean {
  return compareTime(trDateInSeconds, timeStr, operator as "<=" | ">=" | "<" | ">");
}

/**
 * Specialized filter for comparing money mode
 */
function evaluateModeFilter(
  trAmount: number,
  mode: MoneyMode,
  operator: ComparisonOperator
): boolean {
  const isMoneyOut = trAmount < 0;
  const isTargetMode = mode === MoneyMode.MoneyOut ? isMoneyOut : !isMoneyOut;
  return operator === "==" ? isTargetMode : !isTargetMode;
}

/**
 * Helper method to safely get a value from an item by field name
 * Ensures TypeScript safety with keyof Transaction
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getItemValue(item: Transaction, field: FilterField): any {
  if (field === "category" || field === "subcategory") {
    const { category, subcategory } = deconstructTrCategory(item.category);
    return field === "category" ? category : subcategory;
  }
  return item[field as keyof Transaction];
}

/**
 * Evaluates a single filter against an item
 * Central method for all filter evaluation logic
 */
function evaluateFilter(item: Transaction, filter: Filter): boolean {
  const { field, operator } = filter;
  const { value } = filter;

  // Handle special field types with their own evaluation logic
  if (field === "hour" && isTimeOperator(operator)) {
    return evaluateTimeFilter(item.date, value as string, operator);
  }

  if (field === "mode" && isEqualityOperator(operator)) {
    return evaluateModeFilter(item.amount, value as MoneyMode, operator);
  }

  if (field === "dayOfWeek" && isEqualityOperator(operator)) {
    return compareDayOfWeek(item.date, value as string, operator);
  }

  if (field === "date" && operator === "==" && typeof value === "number") {
    return compareDate(item.date, value);
  }

  // Get field value with special handling for amount (absolute value comparison)
  let fieldValue = getItemValue(item, field);
  if (field === "amount" && typeof value === "number") {
    fieldValue = Math.abs(fieldValue);
    const absValue = Math.abs(value);
    return evaluateBasicFilter(fieldValue, absValue, operator);
  }

  // Handle standard filter evaluation
  return evaluateBasicFilter(fieldValue, value, operator);
}

/**
 * Apply filters to a Dexie collection, optimized for AND/OR logic
 */
export function applyFilters(
  collection: Dexie.Collection<Transaction>,
  filters: Filter[]
): Dexie.Collection<Transaction, number> {
  if (!filters || filters.length === 0) {
    return collection;
  }

  // Group filters by mode
  const andFilters = filters.filter((f) => f.mode === FilterMode.AND || f.mode === undefined);
  const orFilters = filters.filter((f) => f.mode === FilterMode.OR);

  // Apply filters using the most efficient approach
  return collection.filter((item) => {
    // Short-circuit evaluation for AND filters
    if (andFilters.length > 0) {
      if (andFilters.every((flter) => evaluateFilter(item, flter))) {
        return true;
      }
    }

    // Short-circuit evaluation for OR filters
    if (orFilters.length > 0) {
      if (orFilters.length === 0) {
        return true; // No OR filters, keep item if it passed AND filters
      }

      if (orFilters.some((flter) => evaluateFilter(item, flter))) {
        return true;
      }
    }

    return true; // Passed all AND filters and no OR filters exist
  });
}
