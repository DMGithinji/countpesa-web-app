import { Transaction } from "@/types/Transaction";
import { format, getWeek, getYear } from "date-fns";

export enum Period {
  HOUR = "hour",
  DATE = "date",
  WEEK = "week",
  MONTH = "month",
  YEAR = "year",
}

export function groupTransactionsByPeriod(
  transactions: Transaction[],
  period: Period
) {
  const grouped = transactions.reduce((result, transaction) => {
    // Convert Unix timestamp to Date object using date-fns
    const date = new Date(transaction.date);
    let groupKey;

    switch (period) {
      case "hour":
        // Format: "dd-MM-yyyy HH:00"
        groupKey = format(date, "dd-MM-yyyy HH:00");
        break;

      case "date":
        // Format: "EEE, dd-MM-yyyy"
        groupKey = format(date, "EEE, dd-MM-yyyy");
        break;

      case "week": {
        // Format: "Week W, YYYY"
        const weekNum = getWeek(date);
        const year = getYear(date);
        groupKey = `Week ${weekNum}, ${year}`;
        break;
      }

      case "month":
        // Format: "January 2023", "February 2023", etc.
        groupKey = format(date, "MMMM yyyy");
        break;

      case "year":
        // Format: "2023", "2024", etc.
        groupKey = format(date, "yyyy");
        break;
    }

    if (!groupKey) {
      throw new Error(`Invalid period: ${period}`);
    }

    // Add transaction to the appropriate group
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(transaction);

    return result;
  }, {} as Record<string, Transaction[]>);

  return grouped;
}
