import { Transaction } from "@/types/Transaction";
import { endOfWeek, format, formatDate, startOfWeek } from "date-fns";
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

export type PeriodAverages = {
  [period: string]: {
    moneyInAverage: number;
    moneyOutAverage: number;
  };
};

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
        const start = startOfWeek(date, { weekStartsOn: 1 });
        const end = endOfWeek(date, { weekStartsOn: 1 });
        groupKey = `${formatDate(start, "MMM dd, yy")} - ${formatDate(
          end,
          "MMM dd, yy"
        )}`;
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

export const getPeriodData = (transactions: Transaction[], period: Period) => {
  const groupedTransactions = groupTransactionsByPeriod(transactions, period);

  const summed = Object.keys(groupedTransactions).map((period) => {
    const { totalAmount, moneyInAmount, moneyOutAmount } =
      calculateTransactionTotals(groupedTransactions[period]);
    return { period, totalAmount, moneyInAmount, moneyOutAmount };
  });
  return summed;
};

export function getPeriodAverages(
  dateRangeData: DateRangeData,
  calculatedData: CalculatedData
) {
  const periodAverages = dateRangeData.periodOptions.reduce(
    (acc, period) => {
      const moneyInTts = calculatedData.topCategoriesMoneyInByAmt
        .map((g) => g.transactions)
        .flat();
      const noOfPeriods = Object.keys(
        groupTransactionsByPeriod(moneyInTts, period)
      ).length;
      const total = calculatedData.transactionTotals.moneyInAmount;
      const average = total / noOfPeriods;

      const moneyOutTts = calculatedData.topCategoriesMoneyOutByAmt
        .map((g) => g.transactions)
        .flat();
      const noOfPeriodsOut = Object.keys(
        groupTransactionsByPeriod(moneyOutTts, period)
      ).length;
      const totalOut = calculatedData.transactionTotals.moneyOutAmount;
      const averageOut = totalOut / noOfPeriodsOut;

      acc[period] = {
        moneyInAverage: average,
        moneyOutAverage: averageOut,
      };
      return acc;
    },
    {} as {
      [period: string]: {
        moneyInAverage: number;
        moneyOutAverage: number;
      };
    }
  );
  return periodAverages;
}
