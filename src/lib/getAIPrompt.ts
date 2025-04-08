import { FieldGroupSummary, GroupByField, groupTrxByField } from "@/lib/groupByField";
import { Transaction, TransactionTypes } from "@/types/Transaction";
import promptText from "@/configs/prompt.txt?raw";
import { getCalculatedData } from "@/lib/getCalculatedData";
import { DerivedState } from "@/stores/transactions.store";
import { getDateRangeData } from "./getDateRangeData";
import { groupTransactionsByPeriod } from "./groupByPeriod";
import { calculateTransactionTotals } from "./getTotal";

export async function getInitialPrompt(transactions: Transaction[]) {
  const groupedByAccount = groupTrxByField(transactions, GroupByField.Account);
  const groupedByCategory = groupTrxByField(transactions, GroupByField.Category);
  const groupedBySubcategory = groupTrxByField(transactions, GroupByField.Subcategory);
  const accountNames = groupedByAccount.map(({ name }) => name);
  const categoryNames = groupedByCategory.map(({ name }) => name);
  const subcategoryNames = groupedBySubcategory.map(({ name }) => name);
  const dateRangeData = getDateRangeData({ transactions });
  const calculatedData = getCalculatedData(transactions);
  const transactionDataSummary = getCalculationSummary({
    dateRangeData,
    calculatedData,
    transactions,
  });

  const promptSuffix = `
  - Valid sender/receiver names are ${accountNames}.
  - Valid categories are ${categoryNames}.
  - Valid subcategories are ${subcategoryNames}
  - Valid transactionTypes are ${Object.values(TransactionTypes)}.
  - Transaction Data Summary: ${transactionDataSummary}
  - The date today is ${new Date()}. This is the USER_PROMPT: `;

  return `${promptText}${promptSuffix}`;
}

export function getCalculationSummary(derivedState: DerivedState) {
  const {
    transactionTotals,
    topAccountsSentToByAmt,
    topAccountsReceivedFromByAmt,
    topCategoriesMoneyInByAmt,
    topCategoriesMoneyOutByAmt,
    topAccountsSentToByCount,
    topAccountsReceivedFromByCount,
    topCategoriesMoneyInByCount,
    topCategoriesMoneyOutByCount,
  } = derivedState.calculatedData;

  const trsGroupedByPeriod = groupTransactionsByPeriod(
    derivedState.transactions,
    derivedState.dateRangeData.defaultPeriod
  );
  const periodTotals = Object.keys(trsGroupedByPeriod).map((key) => {
    const trs = trsGroupedByPeriod[key];
    const trsTotals = calculateTransactionTotals(trs);
    return {
      period: key,
      totalAmount: Math.abs(trsTotals.totalAmount),
      moneyInAmount: Math.abs(trsTotals.moneyInAmount),
      moneyOutAmount: Math.abs(trsTotals.moneyOutAmount),
    };
  });

  const { totalCount, totalAmount, moneyInAmount, moneyOutAmount } = transactionTotals;

  // Extract top 15 items and map to consistent format
  const getTopItems = (items: FieldGroupSummary[]) =>
    items.slice(0, 6).map(({ amount, count, name }) => ({ amount, count, name }));

  const topData = {
    accountsSentToByAmt: getTopItems(topAccountsSentToByAmt),
    accountsReceivedFromByAmt: getTopItems(topAccountsReceivedFromByAmt),
    categoriesMoneyInByAmt: getTopItems(topCategoriesMoneyInByAmt),
    categoriesMoneyOutByAmt: getTopItems(topCategoriesMoneyOutByAmt),
    accountsSentToByCount: getTopItems(topAccountsSentToByCount),
    accountsReceivedFromByCount: getTopItems(topAccountsReceivedFromByCount),
    categoriesMoneyInByCount: getTopItems(topCategoriesMoneyInByCount),
    categoriesMoneyOutByCount: getTopItems(topCategoriesMoneyOutByCount),
  };

  return {
    dataGroupedByPeriod: derivedState.dateRangeData.dateRange,
    totals: {
      totalCount,
      totalAmount,
      moneyInAmount,
      moneyOutAmount,
    },
    periodTotals,
    ...Object.entries(topData).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [`top${key.charAt(0).toUpperCase() + key.slice(1)}`]: value,
      }),
      {}
    ),
  };
}
