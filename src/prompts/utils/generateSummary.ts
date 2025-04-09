import { calculateTransactionTotals } from "@/lib/getTotal";
import { FieldGroupSummary } from "@/lib/groupByField";
import { groupTransactionsByPeriod } from "@/lib/groupByPeriod";
import { DerivedState } from "@/stores/transactions.store";

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
