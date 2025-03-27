import transactionRepository from "@/database/TransactionRepository";
import {
  FieldGroupSummary,
  GroupByField,
  groupedTrxByField,
} from "@/lib/groupByField";
import { TransactionTypes } from "@/types/Transaction";
import promptText from "@/configs/prompt.txt?raw";
import { getCalculatedData } from "@/lib/getCalculatedData";
import { getPeriodData } from "@/lib/groupByPeriod";
import { Filter } from "@/types/Filters";
import { getDateRangeData } from "@/lib/getDateRangeData";

export async function getInitialPrompt() {
  const transactions = await transactionRepository.getTransactions();

  const groupedByAccount = groupedTrxByField(
    transactions,
    GroupByField.Account
  );
  const groupedByCategory = groupedTrxByField(
    transactions,
    GroupByField.Category
  );
  const groupedBySubcategory = groupedTrxByField(
    transactions,
    GroupByField.Subcategory
  );
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

async function getCalculatedOverview(filters: Filter[]) {
  const transactions = await transactionRepository.getTransactions(filters);

  const { defaultPeriod, dateRange } = getDateRangeData({
    transactions,
    currentFilters: filters,
  });

  const dataGroupedByPeriod = getPeriodData(transactions, defaultPeriod);
  const calculatedData = getCalculatedData(transactions);
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
  const topLimit = 20;
  const getTopItems = (items: FieldGroupSummary[]) =>
    items.slice(0, topLimit).map(({ amount, count, name }) => ({
      amount,
      noOfTransactions: count,
      name,
    }));
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
  const formattedOutput = Object.entries(topData).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [`Top${topLimit}${key.charAt(0).toUpperCase() + key.slice(1)}`]: value,
    }),
    {}
  );

  const { totalCount, totalAmount, moneyInAmount, moneyOutAmount } =
    transactionTotals;
  const UserTransactionHistoryOverview = {
    transactionTotals: {
      totalCount,
      totalAmount,
      moneyInAmount,
      moneyOutAmount,
    },
    dataGroupedByPeriod,
    ...formattedOutput,
  };

  return `User's Transaction History ${JSON.stringify(
    dateRange
  )}: ${JSON.stringify(UserTransactionHistoryOverview)}.`;
}
