import { Transaction } from "@/types/Transaction";
import {
  calculateTransactionTotals,
  getTotals,
  TransactionTotals,
} from "./getTotal";

export enum GroupByField {
  Account = "account",
  Category = "category",
  Subcategory = "subcategory",
}

export interface TransactionSummary extends TransactionTotals {
  name: string;
  transactions: Transaction[];
}

export type FieldGroupSummary = {
  name: string;
  amount: number;
  amountPercentage: number;
  count: number;
  countPercentage: number;
  transactions: Transaction[];
};

export enum GroupByTrxSortBy {
  MoneyIn = "moneyInAmount",
  MoneyOut = "moneyOutAmount",
  Count = "totalCount",
}

export function groupedTrxByField(
  transactions: Transaction[],
  field: GroupByField,
  sortBy: GroupByTrxSortBy = GroupByTrxSortBy.MoneyOut
): TransactionSummary[] {
  const fieldMap = new Map<string, { transactions: Transaction[] }>();

  // Aggregate by field
  transactions.forEach((tx) => {

    const key = field === GroupByField.Account ? tx[field] :
      field === GroupByField.Category && tx[field].includes(":")
        ? tx[field].split(":")[0]
        : field === GroupByField.Subcategory &&
          tx[GroupByField.Category].includes(":")
        ? tx[GroupByField.Category].split(":")[1]
        : tx[GroupByField.Category];
    const current = fieldMap.get(key) || { transactions: [] };
    fieldMap.set(key, {
      transactions: [...current.transactions, tx],
    });
  });

  // Convert to array and sort by amount
  return Array.from(fieldMap.entries())
    .map(([name, { transactions }]) => {
      const trsTotals = calculateTransactionTotals(transactions);
      return {
        name,
        transactions,
        ...trsTotals,
      };
    })
    .sort((a, b) => Math.abs(b[sortBy]) - Math.abs(a[sortBy]));
}

export function groupTransactionsByField(
  transactions: Transaction[],
  field: GroupByField,
  sortBy: "amount" | "count" = "amount"
): FieldGroupSummary[] {
  const { totalAmount, totalCount } = getTotals(transactions);
  const groups = groupedTrxByField(transactions, field);

  // Convert to array and sort by amount
  return groups
    .map(
      ({
        name,
        transactions: trs,
        totalAmount: amount,
        totalCount: count,
      }) => ({
        name,
        amount: Math.abs(amount),
        count,
        amountPercentage: Math.abs(amount / totalAmount) * 100,
        countPercentage: (count / totalCount) * 100,
        transactions: trs,
      })
    )
    .sort((a, b) => b[sortBy] - a[sortBy]);
}
