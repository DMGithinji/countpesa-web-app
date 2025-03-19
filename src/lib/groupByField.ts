import { Transaction } from "@/types/Transaction";
import { getTotals } from "./getTotal";

export enum GroupByField {
  Account = "account",
  Category = "category",
}

export type FieldGroupSummary = {
  name: string;
  amount: number;
  amountPercentage: number;
  count: number;
  countPercentage: number;
};

export function groupTransactionsByField(
  transactions: Transaction[],
  field: GroupByField,
  sortBy: 'amount' | 'count' = 'amount'
): FieldGroupSummary[] {
  const fieldMap = new Map<string, { amount: number; count: number }>();
  const {totalAmount, totalCount } = getTotals(transactions)

  // Aggregate by account
  transactions.forEach(tx => {
    const current = fieldMap.get(tx.account) || { amount: 0, count: 0 };
    fieldMap.set(tx[field], {
      amount: current.amount + Math.abs(tx.amount),
      count: current.count + 1,
    });
  });

  // Convert to array and sort by amount
  return Array.from(fieldMap.entries())
    .map(([name, { amount, count }]) => ({
      name,
      amount: Math.floor(amount),
      count,
      amountPercentage: Math.abs((amount / totalAmount) * 100),
      countPercentage: (count / totalCount) * 100
    }))
    .sort((a, b) => b[sortBy] - a[sortBy]);
}
