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
    const topAccountsSentTo = groupTransactionsByField(moneyOutTrs, GroupByField.Account).slice(0, 5);
    const topAccountsReceivedFrom = groupTransactionsByField(moneyInTrs, GroupByField.Account).slice(0, 5);

    // Top categories
    const topCategoriesMoneyOut = groupTransactionsByField(moneyOutTrs, GroupByField.Category).slice(0, 5);
    const topCategoriesMoneyIn = groupTransactionsByField(moneyInTrs, GroupByField.Category).slice(0, 5);

    // Calculate current balance
    const balance = sortedTxs.length > 0 ? sortedTxs[sortedTxs.length - 1].balance : 0;
    const balanceTrend = sortedTxs.map(tx => ({
      date: formatDate(new Date(tx.date), 'dd-MM-yyyy HH:mm'),
      balance: tx.balance,
    }))


    return {
      transactionTotals,
      topAccountsSentTo,
      topAccountsReceivedFrom,
      topCategoriesMoneyOut,
      topCategoriesMoneyIn,
      balance,
      balanceTrend,
    };
  }, [transactions]);

  return dashboardData;
}
