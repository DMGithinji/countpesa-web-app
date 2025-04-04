import { TransactionTotals } from "@/lib/getTotal";
import { FieldGroupSummary } from "@/lib/groupByField";
import { formatDate } from "date-fns";
import { Transaction } from "@/types/Transaction";

export interface CalculatedData {
  transactionTotals: TransactionTotals;

  balance: number;
  balanceTrend: {
    date: string;
    balance: number;
  }[];

  topAccountsSentToByAmt: FieldGroupSummary[];
  topAccountsReceivedFromByAmt: FieldGroupSummary[];
  topAccountsSentToByCount: FieldGroupSummary[];
  topAccountsReceivedFromByCount: FieldGroupSummary[];

  topCategoriesMoneyOutByAmt: FieldGroupSummary[];
  topCategoriesMoneyInByAmt: FieldGroupSummary[];
  topCategoriesMoneyOutByCount: FieldGroupSummary[];
  topCategoriesMoneyInByCount: FieldGroupSummary[];
}

export const DEFAULT_CALCULATED_DATA: CalculatedData = {
  transactionTotals: {
    totalCount: 0,
    totalAmount: 0,
    moneyInTrs: [],
    moneyInCount: 0,
    moneyInAmount: 0,
    moneyOutTrs: [],
    moneyOutCount: 0,
    moneyOutAmount: 0,
  },
  balance: 0,
  balanceTrend: [],
  topAccountsSentToByAmt: [],
  topAccountsReceivedFromByAmt: [],
  topAccountsSentToByCount: [],
  topAccountsReceivedFromByCount: [],
  topCategoriesMoneyOutByAmt: [],
  topCategoriesMoneyInByAmt: [],
  topCategoriesMoneyOutByCount: [],
  topCategoriesMoneyInByCount: [],
};

// Optimized version of getCalculatedData
export function getOptimizedCalculatedData(
  transactions: Transaction[],
  options = {
    balanceTrendMaxPoints: 100, // Maximum data points for balance trend
  }
): CalculatedData {
  // Early return for empty transactions
  if (transactions.length === 0) {
    return createEmptyResult();
  }

  // Sort transactions once by date (if needed)
  const sortedTxs = [...transactions].sort((a, b) => a.date - b.date);
  const lastTx = sortedTxs[sortedTxs.length - 1];

  // Data accumulators to avoid multiple iterations
  const accumulators = {
    totalAmount: 0,
    totalCount: sortedTxs.length,

    moneyInTrs: [] as Transaction[],
    moneyInAmount: 0,

    moneyOutTrs: [] as Transaction[],
    moneyOutAmount: 0,

    // Maps for grouping operations
    accountsIn: new Map<string, GroupData>(),
    accountsOut: new Map<string, GroupData>(),
    categoriesIn: new Map<string, GroupData>(),
    categoriesOut: new Map<string, GroupData>(),

    // Current balance from last transaction
    balance: lastTx.balance,
  };

  // Calculate how many transactions to skip for balance trend sampling
  const sampleInterval = Math.max(
    1,
    Math.floor(sortedTxs.length / options.balanceTrendMaxPoints)
  );

  // Sampled balance trend points
  const balanceTrend: { date: string; balance: number }[] = [];

  // Single pass through sorted transactions
  for (let i = 0; i < sortedTxs.length; i++) {
    const tx = sortedTxs[i];

    // Sample balance trend points
    if (i % sampleInterval === 0 || i === sortedTxs.length - 1) {
      balanceTrend.push({
        date: formatDate(new Date(tx.date), "EEE, MM-yyyy HH:mm"),
        balance: tx.balance,
      });
    }

    // Update running total
    accumulators.totalAmount += tx.amount;

    // Process transaction based on direction (money in/out)
    if (tx.amount > 0) {
      // Money in
      accumulators.moneyInTrs.push(tx);
      accumulators.moneyInAmount += tx.amount;

      // Group by account
      updateGroup(accumulators.accountsIn, tx.account, tx);

      // Group by category
      const categoryKey = getCategoryKey(tx);
      updateGroup(accumulators.categoriesIn, categoryKey, tx);
    } else {
      // Money out
      accumulators.moneyOutTrs.push(tx);
      accumulators.moneyOutAmount += tx.amount;

      // Group by account
      updateGroup(accumulators.accountsOut, tx.account, tx);

      // Group by category
      const categoryKey = getCategoryKey(tx);
      updateGroup(accumulators.categoriesOut, categoryKey, tx);
    }
  }

  // Build the final result object
  const transactionTotals: TransactionTotals = {
    totalCount: accumulators.totalCount,
    totalAmount: Math.round(accumulators.totalAmount),
    moneyInTrs: accumulators.moneyInTrs,
    moneyInCount: accumulators.moneyInTrs.length,
    moneyInAmount: Math.round(accumulators.moneyInAmount),
    moneyOutTrs: accumulators.moneyOutTrs,
    moneyOutCount: accumulators.moneyOutTrs.length,
    moneyOutAmount: Math.round(accumulators.moneyOutAmount),
  };

  return {
    transactionTotals,
    balance: accumulators.balance,
    balanceTrend,

    // Convert grouped data to required format and sort
    topAccountsSentToByAmt: createSortedGroupSummary(
      accumulators.accountsOut,
      Math.abs(accumulators.moneyOutAmount),
      accumulators.moneyOutTrs.length,
      "amount"
    ),
    topAccountsReceivedFromByAmt: createSortedGroupSummary(
      accumulators.accountsIn,
      accumulators.moneyInAmount,
      accumulators.moneyInTrs.length,
      "amount"
    ),
    topAccountsSentToByCount: createSortedGroupSummary(
      accumulators.accountsOut,
      Math.abs(accumulators.moneyOutAmount),
      accumulators.moneyOutTrs.length,
      "count"
    ),
    topAccountsReceivedFromByCount: createSortedGroupSummary(
      accumulators.accountsIn,
      accumulators.moneyInAmount,
      accumulators.moneyInTrs.length,
      "count"
    ),

    topCategoriesMoneyOutByAmt: createSortedGroupSummary(
      accumulators.categoriesOut,
      Math.abs(accumulators.moneyOutAmount),
      accumulators.moneyOutTrs.length,
      "amount"
    ),
    topCategoriesMoneyInByAmt: createSortedGroupSummary(
      accumulators.categoriesIn,
      accumulators.moneyInAmount,
      accumulators.moneyInTrs.length,
      "amount"
    ),
    topCategoriesMoneyOutByCount: createSortedGroupSummary(
      accumulators.categoriesOut,
      Math.abs(accumulators.moneyOutAmount),
      accumulators.moneyOutTrs.length,
      "count"
    ),
    topCategoriesMoneyInByCount: createSortedGroupSummary(
      accumulators.categoriesIn,
      accumulators.moneyInAmount,
      accumulators.moneyInTrs.length,
      "count"
    ),
  };
}

// Helper type for grouping data
interface GroupData {
  amount: number;
  transactions: Transaction[];
}

// Helper function to update a group with a transaction
function updateGroup(
  groupMap: Map<string, GroupData>,
  key: string,
  tx: Transaction
) {
  const existing = groupMap.get(key) || { amount: 0, transactions: [] };
  existing.amount += tx.amount;
  existing.transactions.push(tx);
  groupMap.set(key, existing);
}

// Extract category key (primary category before colon)
function getCategoryKey(tx: Transaction): string {
  return tx.category.includes(":") ? tx.category.split(":")[0] : tx.category;
}

// Create sorted summary objects from grouped data
function createSortedGroupSummary(
  groupMap: Map<string, GroupData>,
  totalAmount: number,
  totalCount: number,
  sortBy: "amount" | "count" = "amount"
): FieldGroupSummary[] {
  return Array.from(groupMap.entries())
    .map(([name, { amount, transactions }]) => ({
      name,
      amount: Math.abs(amount),
      count: transactions.length,
      amountPercentage: Math.abs(amount / totalAmount) * 100,
      countPercentage: (transactions.length / totalCount) * 100,
      transactions,
    }))
    .sort((a, b) => b[sortBy] - a[sortBy]);
}

// Create empty result for edge cases
function createEmptyResult(): CalculatedData {
  const emptyTotals: TransactionTotals = {
    totalCount: 0,
    totalAmount: 0,
    moneyInTrs: [],
    moneyInCount: 0,
    moneyInAmount: 0,
    moneyOutTrs: [],
    moneyOutCount: 0,
    moneyOutAmount: 0,
  };

  return {
    transactionTotals: emptyTotals,
    balance: 0,
    balanceTrend: [],
    topAccountsSentToByAmt: [],
    topAccountsReceivedFromByAmt: [],
    topAccountsSentToByCount: [],
    topAccountsReceivedFromByCount: [],
    topCategoriesMoneyOutByAmt: [],
    topCategoriesMoneyInByAmt: [],
    topCategoriesMoneyOutByCount: [],
    topCategoriesMoneyInByCount: [],
  };
}

// Export the optimized function as the main function
export function getCalculatedData(transactions: Transaction[]): CalculatedData {
  return getOptimizedCalculatedData(transactions);
}
