import { useMemo } from "react";
import useTransactionStore from "@/stores/transactions.store";
import { calculateTransactionTotals } from "@/lib/getTotal";
import { groupTransactionsByField, GroupByField } from "@/lib/groupByField";
import { formatDate } from "date-fns";

export function useDashboard() {
  const { transactions } = useTransactionStore();

  // Calculate all dashboard metrics only when transactions change
  const dashboardData = useMemo(() => {
    const sortedTxs = [...transactions].sort((a, b) => a.date - b.date);

    // Calculate summaries
    const transactionTotals = calculateTransactionTotals(transactions);
    const { moneyInTrs, moneyOutTrs } = transactionTotals;

    // Top accounts
    const topAccountsSentToByAmt = groupTransactionsByField(moneyOutTrs, GroupByField.Account, 'amount').slice(0, 6);
    const topAccountsReceivedFromByAmt = groupTransactionsByField(moneyInTrs, GroupByField.Account, 'amount').slice(0, 6);
    const topAccountsSentToByCount = groupTransactionsByField(moneyOutTrs, GroupByField.Account, 'count').slice(0, 6);
    const topAccountsReceivedFromByCount = groupTransactionsByField(moneyInTrs, GroupByField.Account, 'count').slice(0, 6);

    // Top categories
    const topCategoriesMoneyOutByAmt = groupTransactionsByField(moneyOutTrs, GroupByField.Category, 'amount').slice(0, 6);
    const topCategoriesMoneyInByAmt = groupTransactionsByField(moneyInTrs, GroupByField.Category, 'amount').slice(0, 6);
    const topCategoriesMoneyOutByCount = groupTransactionsByField(moneyOutTrs, GroupByField.Category, 'count').slice(0, 6);
    const topCategoriesMoneyInByCount = groupTransactionsByField(moneyInTrs, GroupByField.Category, 'count').slice(0, 6);

    // Calculate current balance
    const balance = sortedTxs.length > 0 ? sortedTxs[sortedTxs.length - 1].balance : 0;
    const balanceTrend = sortedTxs.map(tx => ({
      date: formatDate(new Date(tx.date), 'dd-MM-yyyy HH:mm'),
      balance: tx.balance,
    }))


    return {
      transactionTotals,

      topAccountsSentToByAmt,
      topAccountsReceivedFromByAmt,
      topAccountsSentToByCount,
      topAccountsReceivedFromByCount,

      topCategoriesMoneyOutByAmt,
      topCategoriesMoneyInByAmt,
      topCategoriesMoneyOutByCount,
      topCategoriesMoneyInByCount,

      balance,
      balanceTrend,
    };
  }, [transactions]);

  return dashboardData;
}
