import { Transaction } from "@/types/Transaction";
import { UNCATEGORIZED } from "@/types/Categories";
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
 * Optimized version of groupTrxByField with reduced memory allocations
 */
export function groupTrxByField(
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

export function groupTrxByFieldAndSummarize(
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
  const groups = groupTrxByField(transactions, field);
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

export function getAllAccountNames(transactions: Transaction[]) {
  const trsGroupedByAccount = groupTrxByFieldAndSummarize(transactions, GroupByField.Account);
  // Get dict of account name and the category it has
  const accountNamesSet = trsGroupedByAccount.reduce((acc, group) => {
    const accountName = group.name;
    const { category } = group.transactions[0];
    return {
      ...acc,
      [accountName]: category || UNCATEGORIZED,
    };
  }, {});

  // Iterate through transactions and add each account name to the set
  const accountNames = Object.keys(accountNamesSet);

  // Convert the Set back to an array
  return { accountNames, accountCategoryDict: accountNamesSet };
}

interface MoneyGroupsData {
  title: string;
  groupByField: GroupByField;
  moneyOutGroups: FieldGroupSummary[];
  moneyInGroups: FieldGroupSummary[];
}

export const getGroupByCategoryOrSubcategory = (
  topCategoriesMoneyInByAmt: FieldGroupSummary[],
  topCategoriesMoneyOutByAmt: FieldGroupSummary[]
): MoneyGroupsData => {
  const isSingleMoneyOutCategory =
    topCategoriesMoneyOutByAmt.length === 1 && topCategoriesMoneyOutByAmt[0].name !== UNCATEGORIZED;

  const isSingleMoneyInCategory =
    topCategoriesMoneyInByAmt.length === 1 && topCategoriesMoneyInByAmt[0].name !== UNCATEGORIZED;

  const isSubcategory =
    (!topCategoriesMoneyInByAmt.length && isSingleMoneyOutCategory) ||
    (!topCategoriesMoneyOutByAmt.length && isSingleMoneyInCategory) ||
    (isSingleMoneyInCategory &&
      isSingleMoneyOutCategory &&
      topCategoriesMoneyInByAmt[0].name === topCategoriesMoneyOutByAmt[0].name);

  return {
    title: isSubcategory ? "Subcategories" : "Categories",
    groupByField: isSubcategory ? GroupByField.Subcategory : GroupByField.Category,
    moneyOutGroups:
      isSingleMoneyInCategory && isSubcategory
        ? groupTrxByFieldAndSummarize(
            topCategoriesMoneyOutByAmt[0]?.transactions || [],
            GroupByField.Subcategory
          )
        : topCategoriesMoneyOutByAmt,
    moneyInGroups:
      isSingleMoneyOutCategory && isSubcategory
        ? groupTrxByFieldAndSummarize(
            topCategoriesMoneyInByAmt[0]?.transactions || [],
            GroupByField.Subcategory
          )
        : topCategoriesMoneyInByAmt,
  };
};
