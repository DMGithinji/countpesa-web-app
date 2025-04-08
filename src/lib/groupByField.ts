import { Transaction } from "@/types/Transaction";
import { calculateTransactionTotals, getTotals, TransactionTotals } from "./getTotal";

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

/**
 * Get the appropriate key for grouping based on field type
 */
function getGroupKey(tx: Transaction, field: GroupByField): string {
  if (field === GroupByField.Account) {
    return tx[field];
  }

  const category = tx[GroupByField.Category];

  if (field === GroupByField.Category) {
    return category.includes(":") ? category.split(":")[0] : category;
  }

  if (field === GroupByField.Subcategory && category.includes(":")) {
    return category.split(":")[1];
  }

  return category;
}

/**
 * Optimized version of groupedTrxByField with reduced memory allocations
 */
export function groupedTrxByField(
  transactions: Transaction[],
  field: GroupByField,
  sortBy: GroupByTrxSortBy = GroupByTrxSortBy.MoneyOut
): TransactionSummary[] {
  // Use Map for efficient grouping
  const fieldMap = new Map<string, Transaction[]>();

  // Single pass to collect transactions by group
  transactions.forEach((tx) => {
    const key = getGroupKey(tx, field).trim();

    if (!fieldMap.has(key)) {
      fieldMap.set(key, []);
    }

    // Direct push instead of spread (more efficient)
    fieldMap.get(key)!.push(tx);
  });

  // Pre-allocate result array for better performance
  const result: TransactionSummary[] = new Array(fieldMap.size);
  let index = 0;

  // Create summaries
  fieldMap.forEach((groupTransactions, name) => {
    const trsTotals = calculateTransactionTotals(groupTransactions);

    result[index++] = {
      name,
      transactions: groupTransactions,
      ...trsTotals,
    };
  });

  // Sort only once at the end
  return result.sort((a, b) => Math.abs(b[sortBy]) - Math.abs(a[sortBy]));
}

export function groupTransactionsByField(
  transactions: Transaction[],
  field: GroupByField,
  sortBy: "amount" | "count" = "amount"
): FieldGroupSummary[] {
  // Get totals once
  const { totalAmount, totalCount } = getTotals(transactions);

  // Early return for empty transactions
  if (totalCount === 0) {
    return [];
  }

  // Get groups efficiently
  const groups = groupedTrxByField(transactions, field);
  const result: FieldGroupSummary[] = new Array(groups.length);

  // Transform to summary in one pass
  for (let i = 0; i < groups.length; i++) {
    const { name, transactions: trs, totalAmount: amount, totalCount: count } = groups[i];
    const absAmount = Math.abs(amount);

    result[i] = {
      name,
      amount: absAmount,
      count,
      amountPercentage: (absAmount / Math.abs(totalAmount)) * 100,
      countPercentage: (count / totalCount) * 100,
      transactions: trs,
    };
  }

  // Sort the final result
  return result.sort((a, b) => b[sortBy] - a[sortBy]);
}

export function getAllAccountNames(transactions: Transaction[]): string[] {
  // Use a Set to automatically handle duplicates
  const accountNamesSet = new Set<string>();

  // Iterate through transactions and add each account name to the set
  transactions.forEach((transaction) => {
    if (transaction.account) {
      accountNamesSet.add(transaction.account);
    }
  });

  // Convert the Set back to an array
  return Array.from(accountNamesSet);
}
