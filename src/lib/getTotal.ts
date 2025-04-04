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

/**
 * Gets simple totals from transactions
 */
export function getTotals(transactions: Transaction[]) {
  let totalAmount = 0;
  const count = transactions.length;

  // Empty array check
  if (count === 0) {
    return { totalCount: 0, totalAmount: 0 };
  }

  for (let i = 0; i < count; i++) {
    totalAmount += transactions[i].amount;
  }

  return {
    totalCount: count,
    totalAmount: Math.round(totalAmount),
  };
}

/**
 * Calculates detailed transaction totals
 * Optimized to use a single pass through the data
 */
export function calculateTransactionTotals(transactions: Transaction[]): TransactionTotals {
  const count = transactions.length;

  // Empty array check
  if (count === 0) {
    return {
      totalCount: 0,
      totalAmount: 0,
      moneyInTrs: [],
      moneyInCount: 0,
      moneyInAmount: 0,
      moneyOutTrs: [],
      moneyOutCount: 0,
      moneyOutAmount: 0,
    };
  }

  // Pre-allocate arrays for better memory performance
  const moneyInTrs: Transaction[] = [];
  const moneyOutTrs: Transaction[] = [];

  // Initialize accumulators
  let totalAmount = 0;
  let moneyInAmount = 0;
  let moneyOutAmount = 0;

  // Single pass through all transactions
  for (let i = 0; i < count; i++) {
    const tx = transactions[i];
    totalAmount += tx.amount;

    if (tx.amount > 0) {
      moneyInTrs.push(tx);
      moneyInAmount += tx.amount;
    } else if (tx.amount < 0) {
      moneyOutTrs.push(tx);
      moneyOutAmount += tx.amount;
    }
  }

  return {
    totalCount: count,
    totalAmount: Math.round(totalAmount),
    moneyInTrs,
    moneyInCount: moneyInTrs.length,
    moneyInAmount: Math.round(moneyInAmount),
    moneyOutTrs,
    moneyOutCount: moneyOutTrs.length,
    moneyOutAmount: Math.round(moneyOutAmount),
  };
}
