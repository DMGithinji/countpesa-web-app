import { endOfDay, isSameDay, startOfDay } from "date-fns";
import { Filter, FilterMode, FilterOperator } from "@/types/Filters";
import { MoneyMode, Transaction } from "@/types/Transaction";
import { deconstructTrCategory } from "../categoryUtils";

/**
 * Filter transactions based on provided filters
 */
export function filterTransactions(
  transactions: Transaction[],
  filtersInput: Filter | Filter[]
): Transaction[] {
  // Normalize input to array and return early if empty
  const filters = Array.isArray(filtersInput) ? filtersInput : [filtersInput];
  if (!filters.length) return transactions;

  // Group filters by mode
  const andFilters = filters.filter((f) => f.mode === FilterMode.AND || f.mode === undefined);
  const orFilters = filters.filter((f) => f.mode === FilterMode.OR);

  return transactions.filter(
    (transaction) =>
      // AND filters: all must match (or there are none)
      (andFilters.length === 0 || andFilters.every((f) => evaluateFilter(transaction, f))) &&
      // OR filters: at least one must match (or there are none)
      (orFilters.length === 0 || orFilters.some((f) => evaluateFilter(transaction, f)))
  );
}

/**
 * Evaluate a single filter against a transaction
 */
function evaluateFilter(transaction: Transaction, filter: Filter): boolean {
  const { field, operator, value } = filter;

  // Handle special field types
  switch (field) {
    case "hour":
      return evaluateTimeFilter(transaction.date, value as string, operator);

    case "mode":
      return evaluateModeFilter(transaction.amount, value as MoneyMode, operator);

    case "date":
      if (typeof value === "number") return evaluateDateFilter(transaction.date, value, operator);
      break;

    case "category":
    case "subcategory": {
      const { category, subcategory } = deconstructTrCategory(transaction.category);

      // For text searches on category, check the full category string
      if (field === "category" && ["contains", "contains-any"].includes(operator))
        return evaluateBasicFilter(transaction.category, value, operator);

      // Otherwise use the specific part (category or subcategory)
      const fieldValue = field === "category" ? category : subcategory;
      return evaluateBasicFilter(fieldValue, value, operator);
    }

    case "amount":
      if (typeof value === "number")
        return evaluateBasicFilter(Math.abs(transaction.amount), Math.abs(value), operator);
      break;

    default:
      return evaluateBasicFilter(transaction[field as keyof Transaction], value, operator);
  }

  // Default field evaluation
  return evaluateBasicFilter(transaction[field as keyof Transaction], value, operator);
}

/**
 * Basic comparison with standard operators
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function evaluateBasicFilter(fieldValue: any, value: any, operator: FilterOperator): boolean {
  const isStringPair = typeof fieldValue === "string" && typeof value === "string";

  switch (operator) {
    case "==":
      return isStringPair
        ? fieldValue.toLowerCase().trim() === value.toLowerCase().trim()
        : fieldValue === value;
    case "!=":
      return isStringPair
        ? fieldValue.toLowerCase().trim() !== value.toLowerCase().trim()
        : fieldValue !== value;
    case "<":
      return fieldValue < value;
    case "<=":
      return fieldValue <= value;
    case ">":
      return fieldValue > value;
    case ">=":
      return fieldValue >= value;
    case "contains":
      return isStringPair && fieldValue.toLowerCase().includes(value.toLowerCase());
    case "in": {
      if (typeof value === "string") {
        return value.split(",").includes(fieldValue);
      }
      if (Array.isArray(value)) {
        return value.includes(fieldValue);
      }
      return false;
    }
    case "not-in": {
      if (typeof value === "string") {
        return !value.split(",").includes(fieldValue);
      }
      if (Array.isArray(value)) {
        return !value.includes(fieldValue);
      }
      return false;
    }
    default:
      return false;
  }
}

/**
 * Time filter handling (HH:MM format)
 */
function evaluateTimeFilter(
  trDateInSeconds: number,
  timeStr: string,
  operator: FilterOperator
): boolean {
  if (!["<", "<=", ">", ">=", "==", "!="].includes(operator)) return false;

  const trDate = new Date(trDateInSeconds);
  const [hours, minutes] = timeStr.split(":").map((num) => parseInt(num, 10));

  // Transaction time with just hours and minutes
  const trTime = new Date(trDate).setHours(trDate.getHours(), trDate.getMinutes(), 0, 0);

  // Comparison time (same day)
  const compareTime = new Date(trDate);
  compareTime.setHours(hours, minutes, 0, 0);

  switch (operator) {
    case "<":
      return trTime < compareTime.getTime();
    case "<=":
      return trTime <= compareTime.getTime();
    case ">":
      return trTime > compareTime.getTime();
    case ">=":
      return trTime >= compareTime.getTime();
    case "==":
      return trTime === compareTime.getTime();
    case "!=":
      return trTime !== compareTime.getTime();
    default:
      return false;
  }
}

/**
 * Money direction filter (in/out)
 */
function evaluateModeFilter(trAmount: number, mode: MoneyMode, operator: FilterOperator): boolean {
  if (operator !== "==" && operator !== "!=") return false;

  const isMoneyIn = trAmount > 0;
  const matchesMode = mode === MoneyMode.MoneyIn ? isMoneyIn : !isMoneyIn;

  return operator === "==" ? matchesMode : !matchesMode;
}

/**
 * Date filter with special handling for same-day comparison
 */
function evaluateDateFilter(
  trDateInSeconds: number,
  date: number,
  operator: FilterOperator
): boolean {
  const trDate = new Date(trDateInSeconds);
  const filterDate = new Date(date);

  switch (operator) {
    case "==":
    case "!=": {
      const sameDay = isSameDay(trDate, filterDate);
      return operator === "==" ? sameDay : !sameDay;
    }
    case ">":
      return trDateInSeconds > date;
    case ">=":
      return trDateInSeconds >= startOfDay(filterDate).getTime();
    case "<":
      return trDateInSeconds < date;
    case "<=":
      return trDateInSeconds <= endOfDay(filterDate).getTime();
    default:
      return false;
  }
}
