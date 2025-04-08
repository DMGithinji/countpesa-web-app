import { FieldGroupSummary, GroupByField, groupTrxByField } from "@/lib/groupByField";
import { Transaction, TransactionTypes } from "@/types/Transaction";
import promptText from "@/configs/prompt.txt?raw";
import { CalculatedData } from "@/lib/getCalculatedData";
import { getPeriodData, Period } from "@/lib/groupByPeriod";

export async function getInitialPrompt(transactions: Transaction[]) {
  const groupedByAccount = groupTrxByField(transactions, GroupByField.Account);
  const groupedByCategory = groupTrxByField(transactions, GroupByField.Category);
  const groupedBySubcategory = groupTrxByField(transactions, GroupByField.Subcategory);
  const accountNames = groupedByAccount.map(({ name }) => name);
  const categoryNames = groupedByCategory.map(({ name }) => name);
  const subcategoryNames = groupedBySubcategory.map(({ name }) => name);

  const promptSuffix = `
  - Valid sender/receiver names are ${accountNames}.
  - Valid categories are ${categoryNames}.
  - Valid subcategories are ${subcategoryNames}
  - Valid transactionTypes are ${Object.values(TransactionTypes)}.
  - The date today is ${new Date()}. This is the USER_PROMPT: `;

  return `${promptText}${promptSuffix}`;
}

export function getCalculationSummary(
  transactions: Transaction[],
  calculatedData: CalculatedData,
  defaultPeriod: Period
) {
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
  } = calculatedData;

  const { totalCount, totalAmount, moneyInAmount, moneyOutAmount } = transactionTotals;

  // Extract top 15 items and map to consistent format
  const getTopItems = (items: FieldGroupSummary[]) =>
    items.slice(0, 15).map(({ amount, count, name }) => ({ amount, count, name }));

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
    dataGroupedByPeriod: getPeriodData(transactions, defaultPeriod),
    totals: {
      totalCount,
      totalAmount,
      moneyInAmount,
      moneyOutAmount,
    },
    ...Object.entries(topData).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [`top${key.charAt(0).toUpperCase() + key.slice(1)}`]: value,
      }),
      {}
    ),
  };
}
