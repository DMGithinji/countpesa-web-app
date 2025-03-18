import { Transaction } from "@/types/Transaction";

export enum GroupByField {
  Account = "account",
  Category = "category",
}

type FieldGroupSummary = {
  name: string;
  amount: number;
  count: number;
};

export function groupTransactionsByField(transactions: Transaction[], field: GroupByField): FieldGroupSummary[] {
  const fieldMap = new Map<string, { amount: number; count: number }>();

  // Aggregate by account
  transactions.forEach(tx => {
    const current = fieldMap.get(tx.account) || { amount: 0, count: 0 };
    fieldMap.set(tx[field], {
      amount: current.amount + Math.abs(tx.amount),
      count: current.count + 1
    });
  });

  // Convert to array and sort by amount
  return Array.from(fieldMap.entries())
    .map(([name, { amount, count }]) => ({
      name,
      amount,
      count
    }))
    .sort((a, b) => b.amount - a.amount);
}
