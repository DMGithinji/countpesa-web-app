import { useMemo } from "react";
import {
  startOfDay,
  endOfDay,
  isSameDay,
  differenceInDays,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import useTransactionStore from "@/stores/transactions.store";
import { Filter } from "@/types/Filters";

export enum Period {
  HOUR = "hour",
  DATE = "date",
  WEEK = "week",
  MONTH = "month",
}

type CompositeFilter = {
  type: string;
  filters: Filter[];
};

export function useDateRange() {
  const transactions = useTransactionStore((state) => state.transactions);
  const currentFilters = useTransactionStore((state) => state.currentFilters);

  return useMemo(() => {
    // Find date range filter if it exists
    const dateRangeFilter =
      currentFilters &&
      Array.isArray(currentFilters) &&
      (currentFilters.find(
        (fl: CompositeFilter) =>
          fl.type === "and" && fl.filters.some((f) => f.field === "date")
      ) as CompositeFilter | undefined);

    let startDate: Date;
    let endDate: Date;

    if (dateRangeFilter) {
      // Extract dates from filter
      const startFilter = dateRangeFilter.filters.find(
        (f) => f.field === "date" && f.operator === ">="
      );
      const endFilter = dateRangeFilter.filters.find(
        (f) => f.field === "date" && f.operator === "<="
      );

      startDate = startFilter
        ? new Date(startFilter.value)
        : startOfMonth(new Date());
      endDate = endFilter ? new Date(endFilter.value) : endOfMonth(new Date());
    } else if (transactions.length > 0) {
      // If no filter exists, use first and last transaction dates
      const orderedTrs = [...transactions].sort((a, b) => a.date - b.date);

      startDate = new Date(orderedTrs[0].date);
      endDate = new Date(orderedTrs[orderedTrs.length - 1].date);
    } else {
      // Fallback if no transactions
      startDate = startOfMonth(new Date());
      endDate = endOfMonth(new Date());
    }

    // Normalize dates to start/end of day
    const start = startOfDay(startDate);
    const end = endOfDay(endDate);

    // Determine appropriate period based on date range
    let defaultPeriod: Period;

    if (isSameDay(start, end)) {
      defaultPeriod = Period.HOUR;
    } else if (differenceInDays(end, start) >= 61) {
      defaultPeriod = Period.MONTH;
    } else if (differenceInDays(end, start) <= 31) {
      defaultPeriod = Period.DATE;
    } else {
      defaultPeriod = Period.WEEK; // Default fallback
    }
    const periodOpts = Object.values(Period);
    const periodIndex = periodOpts.indexOf(defaultPeriod);
    const validOptions = Object.values(Period).slice(periodIndex);

    return {
      dateRange: { from: start, to: end },
      defaultPeriod,
      periodOptions: validOptions,
    };
  }, [transactions, currentFilters]);
}
