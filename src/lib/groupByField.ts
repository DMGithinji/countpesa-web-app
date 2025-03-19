import { Transaction } from "@/types/Transaction";
import { calculateTransactionTotals, getTotals, TransactionTotals } from "./getTotal";

export enum GroupByField {
  Account = "account",
  Category = "category",
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
  transactions.forEach(tx => {
    const current = fieldMap.get(tx[field]) || { transactions: [] };
    fieldMap.set(tx[field], {
      transactions: [...current.transactions, tx],
    });
  });

  // Convert to array and sort by amount
  return Array.from(fieldMap.entries())
    .map(([name, { transactions }]) => {
      const trsTotals = calculateTransactionTotals(transactions)
      return {
        name,
        transactions,
        ...trsTotals,
      }
    })
    .sort((a, b) => Math.abs(b[sortBy]) - Math.abs(a[sortBy]));
}


export function groupTransactionsByField(
  transactions: Transaction[],
  field: GroupByField,
  sortBy: 'amount' | 'count' = 'amount'
): FieldGroupSummary[] {
  const fieldMap = new Map<string, { transactions: Transaction[]; amount: number; count: number }>();
  const {totalAmount, totalCount } = getTotals(transactions)

  // Aggregate by field
  transactions.forEach(tx => {
    const current = fieldMap.get(tx[field]) || { transactions: [], amount: 0, count: 0 };
    fieldMap.set(tx[field], {
      transactions: [...current.transactions, tx],
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
      countPercentage: (count / totalCount) * 100,
      transactions,
    }))
    .sort((a, b) => b[sortBy] - a[sortBy]);
}
