import { endOfWeek, format, formatDate, startOfWeek } from "date-fns";
import { Transaction } from "@/types/Transaction";
import { calculateTransactionTotals } from "./getTotal";
import { CalculatedData } from "./getCalculatedData";
import { DateRangeData } from "./getDateRangeData";

export enum Period {
  HOUR = "hour",
  DATE = "date",
  WEEK = "week",
  MONTH = "month",
  YEAR = "year",
}

export const PeriodDict = {
  [Period.HOUR]: "Hourly",
  [Period.DATE]: "Daily",
  [Period.WEEK]: "Weekly",
  [Period.MONTH]: "Monthly",
  [Period.YEAR]: "Yearly",
};

export type PeriodData = {
  period: string;
  totalAmount: number;
  moneyInAmount: number;
  moneyOutAmount: number;
};

export type PeriodAverages = {
  [period: string]: {
    moneyInAverage: number;
    moneyOutAverage: number;
  };
};

/**
 * Groups transactions by specified time period
 */
export function groupTransactionsByPeriod(
  transactions: Transaction[],
  period: Period
): Record<string, Transaction[]> {
  const grouped: Record<string, Transaction[]> = {};

  // Date cache to avoid creating redundant Date objects
  const dateCache: Record<number, Date> = {};

  transactions.forEach((transaction) => {
    // Get or create Date object from timestamp
    const timestamp = transaction.date;
    let date = dateCache[timestamp];
    if (!date) {
      date = new Date(timestamp);
      dateCache[timestamp] = date;
    }

    // Determine group key based on period
    let groupKey: string;

    switch (period) {
      case Period.HOUR:
        // Format: "dd-MM-yyyy HH:00"
        groupKey = format(date, "dd-MM-yyyy HH:00");
        break;

      case Period.DATE:
        // Format: "EEE, dd-MM-yyyy"
        groupKey = format(date, "EEE, dd-MM-yyyy");
        break;

      case Period.WEEK: {
        // Format: "Week W, YYYY"
        const start = startOfWeek(date, { weekStartsOn: 1 });
        const end = endOfWeek(date, { weekStartsOn: 1 });
        groupKey = `${formatDate(start, "MMM dd, yy")} - ${formatDate(end, "MMM dd, yy")}`;
        break;
      }

      case Period.MONTH:
        // Format: "January 2023", "February 2023", etc.
        groupKey = format(date, "MMM yyyy");
        break;

      case Period.YEAR:
        // Format: "2023", "2024", etc.
        groupKey = format(date, "yyyy");
        break;

      default:
        throw new Error(`Invalid period: ${period}`);
    }

    // Add transaction to the appropriate group
    if (!grouped[groupKey]) {
      grouped[groupKey] = [];
    }
    grouped[groupKey].push(transaction);
  });

  return grouped;
}

/**
 * Get period data with summarized amounts
 * Optimized to reduce object creation
 */
export const getPeriodData = (transactions: Transaction[], period: Period) => {
  const groupedTransactions = groupTransactionsByPeriod(transactions, period);
  const result: PeriodData[] = [];

  // Using Object.entries instead of for...in loop
  Object.entries(groupedTransactions).forEach(([periodKey, periodTxs]) => {
    const { totalAmount, moneyInAmount, moneyOutAmount } = calculateTransactionTotals(periodTxs);
    result.push({
      period: periodKey,
      totalAmount,
      moneyInAmount,
      moneyOutAmount,
    });
  });

  return result;
};

/**
 * Get average amounts per period
 * Optimized to reduce redundant calculations
 */
export function getPeriodAverages(
  dateRangeData: DateRangeData,
  calculatedData: CalculatedData
): PeriodAverages {
  const { moneyInTrs, moneyOutTrs, moneyInAmount, moneyOutAmount } =
    calculatedData.transactionTotals;
  const periodAverages: PeriodAverages = {};

  // Using Array.forEach instead of for...of loop
  dateRangeData.periodOptions.forEach((period) => {
    // Get number of unique periods
    const moneyInGroups = groupTransactionsByPeriod(moneyInTrs, period);
    const moneyOutGroups = groupTransactionsByPeriod(moneyOutTrs, period);

    const inPeriodCount = Object.keys(moneyInGroups).length || 1; // Avoid division by zero
    const outPeriodCount = Object.keys(moneyOutGroups).length || 1;

    // Calculate averages
    periodAverages[period] = {
      moneyInAverage: moneyInAmount / inPeriodCount,
      moneyOutAverage: moneyOutAmount / outPeriodCount,
    };
  });

  return periodAverages;
}
