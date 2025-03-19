import { MinusCircle, PlusCircle } from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { GroupByField } from "@/lib/groupByField";
import useTransactionStore from "@/stores/transactions.store";
import AmtSummaryCard from "@/components/AmtSummaryCard";
import BalanceTrendCard from "@/components/BalanceTrend";
import PeriodicTransactionsChart from "@/components/PeriodicTransactionsChart";
import TopTrsGroupedByField from "@/components/TopTrsGroupedByField";
import { MoneyMode } from "@/types/Transaction";

const DashboardPage = () => {
  const transactions = useTransactionStore((state) => state.transactions);
  const { transactionTotals, balance, balanceTrend,
    topAccountsSentToByAmt, topAccountsReceivedFromByAmt,
    topCategoriesMoneyInByAmt, topCategoriesMoneyOutByAmt,
    topAccountsSentToByCount, topAccountsReceivedFromByCount,
    topCategoriesMoneyInByCount, topCategoriesMoneyOutByCount
  } = useDashboard();
  const loading = useTransactionStore((state) => state.loading);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto max-w-5xl">

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AmtSummaryCard
          type='Received'
          count={transactionTotals.moneyInCount}
          amount={transactionTotals.moneyInAmount}
          mode={MoneyMode.MoneyIn}
          Icon={PlusCircle}
        />
        <AmtSummaryCard
          type='Sent'
          count={transactionTotals.moneyOutCount}
          amount={transactionTotals.moneyOutAmount}
          mode={MoneyMode.MoneyOut}
          Icon={MinusCircle}
        />
        <BalanceTrendCard latestBalance={balance} data={balanceTrend} />
      </div>

      <div className="py-4">
        <PeriodicTransactionsChart transactions={transactions} />
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        <TopTrsGroupedByField
          groupedBy={GroupByField.Account}
          moneyInSummaryByAmt={topAccountsSentToByAmt}
          moneyOutSummaryByAmt={topAccountsReceivedFromByAmt}
          moneyInSummaryByCount={topAccountsSentToByCount}
          moneyOutSummaryByCount={topAccountsReceivedFromByCount}
        />
        <TopTrsGroupedByField
          groupedBy={GroupByField.Category}
          moneyInSummaryByAmt={topCategoriesMoneyInByAmt}
          moneyOutSummaryByAmt={topCategoriesMoneyOutByAmt}
          moneyInSummaryByCount={topCategoriesMoneyInByCount}
          moneyOutSummaryByCount={topCategoriesMoneyOutByCount}
        />
      </div>
    </div>
  );
};

export default DashboardPage;
