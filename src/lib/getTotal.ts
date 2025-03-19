import { Transaction } from "@/types/Transaction";

export type TransactionTotals = {
  totalCount: number;
  totalAmount: number;

  moneyInTrs: Transaction[];
  moneyInCount: number;
  moneyInAmount: number;

  moneyOutTrs: Transaction[];
  moneyOutCount: number;
  moneyOutAmount: number;
};

export function getTotals(transactions: Transaction[]) {
  const totalAmount = Math.round(transactions.reduce((sum, tx) => sum + tx.amount, 0));
  const count = transactions.length;
  return {
    totalCount: count,
    totalAmount: totalAmount,
  }
}

export function calculateTransactionTotals(transactions: Transaction[]): TransactionTotals {
  const totalAmount = Math.round(transactions.reduce((sum, tx) => sum + tx.amount, 0));
  const count = transactions.length;

  const moneyInTrs = transactions.filter(tx => tx.amount > 0)
  const moneyOutTrs = transactions.filter(tx => tx.amount < 0)

  return {
    totalCount: count,
    totalAmount: totalAmount,
    moneyInTrs,
    moneyInCount: moneyInTrs.length,
    moneyInAmount: Math.round(moneyInTrs.reduce((sum, tx) => sum + tx.amount, 0)),
    moneyOutTrs,
    moneyOutCount: moneyOutTrs.length,
    moneyOutAmount: Math.round(moneyOutTrs.reduce((sum, tx) => sum + tx.amount, 0)),
  };
}
