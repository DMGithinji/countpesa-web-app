import {
  startOfDay,
  endOfDay,
  isSameDay,
  differenceInDays,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { Filter } from "@/types/Filters";
import { Transaction } from "@/types/Transaction";
import { Period } from "./groupByPeriod";

export type SetDateRange = {
  from: Date;
  to: Date;
};

export type DateRangeData = {
  dateRange: SetDateRange;
  defaultPeriod: Period;
  periodOptions: Period[];
};

export const DEFAULT_DATE_RANGE_DATA: DateRangeData = {
  dateRange: { from: new Date(), to: new Date() },
  defaultPeriod: Period.DATE,
  periodOptions: [Period.DATE, Period.WEEK, Period.MONTH],
};

export function getDateRangeData({
  transactions,
  currentFilters,
}: {
  transactions: Transaction[];
  currentFilters: Filter[] | undefined;
}) {
  // Find date range filter if it exists
  const dateRangeFilter = currentFilters?.find((fl) => fl.field === "date");

  let startDate: Date;
  let endDate: Date;

  if (dateRangeFilter) {
    // Extract dates from filter
    const startFilter = currentFilters?.find((f) => f.field === "date" && f.operator === ">=");
    const endFilter = currentFilters?.find((f) => f.field === "date" && f.operator === "<=");

    startDate = startFilter ? new Date(startFilter.value) : startOfMonth(new Date());
    endDate = endFilter ? new Date(endFilter.value) : endOfMonth(new Date());
  } else if (transactions.length > 0) {
    // If no filter exists, use first and last transaction dates
    const orderedTrs = [...transactions].sort((a, b) => a.date - b.date);

    const lastTr = orderedTrs[orderedTrs.length - 1];
    const firstTr = orderedTrs[0];
    startDate = new Date(firstTr.date);
    endDate = new Date(lastTr.date);
  } else {
    // Fallback if no transactions
    startDate = startOfMonth(new Date());
    endDate = endOfMonth(new Date());
  }

  // Normalize dates to start/end of day
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);

  let validOptions = [];

  // Determine appropriate period based on date range
  let defaultPeriod: Period;

  if (isSameDay(start, end)) {
    defaultPeriod = Period.HOUR;
    validOptions = [Period.HOUR];
  } else if (differenceInDays(end, start) >= 61) {
    defaultPeriod = Period.MONTH;
    validOptions = [Period.DATE, Period.WEEK, Period.MONTH];
  } else if (differenceInDays(end, start) <= 31) {
    defaultPeriod = Period.DATE;
    validOptions = [Period.DATE, Period.WEEK];
  } else {
    defaultPeriod = Period.DATE; // Default fallback
    validOptions = [Period.DATE];
  }

  return {
    dateRange: { from: start, to: end },
    defaultPeriod,
    periodOptions: validOptions,
  };
}
