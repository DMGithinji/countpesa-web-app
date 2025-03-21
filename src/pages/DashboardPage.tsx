import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { useCalculate } from "@/hooks/useCalculate";
import { GroupByField } from "@/lib/groupByField";
import useTransactionStore from "@/stores/transactions.store";
import AmtSummaryCard from "@/components/AmtSummaryCard";
import BalanceTrendCard from "@/components/BalanceTrend";
import PeriodicTransactionsChart from "@/components/PeriodicTransactionsChart";
import TopTrsGroupedByField from "@/components/TopTrsGroupedByField";
import { MoneyMode } from "@/types/Transaction";
import { useDateRange } from "@/hooks/useDateRange";

const DashboardPage = () => {
  const transactions = useTransactionStore((state) => state.transactions);
  const {
    transactionTotals,
    balance,
    balanceTrend,
    topAccountsSentToByAmt,
    topAccountsReceivedFromByAmt,
    topCategoriesMoneyInByAmt,
    topCategoriesMoneyOutByAmt,
    topAccountsSentToByCount,
    topAccountsReceivedFromByCount,
    topCategoriesMoneyInByCount,
    topCategoriesMoneyOutByCount,
  } = useCalculate();
  const loading = useTransactionStore((state) => state.loading);
  const { defaultPeriod, periodOptions } = useDateRange();

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto max-w-5xl">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AmtSummaryCard
          type="Received"
          count={transactionTotals.moneyInCount}
          amount={transactionTotals.moneyInAmount}
          mode={MoneyMode.MoneyIn}
          Icon={ArrowDownCircle}
        />
        <AmtSummaryCard
          type="Sent"
          count={transactionTotals.moneyOutCount}
          amount={transactionTotals.moneyOutAmount}
          mode={MoneyMode.MoneyOut}
          Icon={ArrowUpCircle}
        />
        <BalanceTrendCard latestBalance={balance} data={balanceTrend} />
      </div>

      <div className="py-4">
        <PeriodicTransactionsChart
          defaultPeriod={defaultPeriod}
          periodOptions={periodOptions}
          transactions={transactions}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        <TopTrsGroupedByField
          groupedBy={GroupByField.Account}
          moneyInSummaryByAmt={topAccountsReceivedFromByAmt.slice(0, 6)}
          moneyOutSummaryByAmt={topAccountsSentToByAmt.slice(0, 6)}
          moneyInSummaryByCount={topAccountsReceivedFromByCount.slice(0, 6)}
          moneyOutSummaryByCount={topAccountsSentToByCount.slice(0, 6)}
        />
        <TopTrsGroupedByField
          groupedBy={GroupByField.Category}
          moneyInSummaryByAmt={topCategoriesMoneyInByAmt.slice(0, 6)}
          moneyOutSummaryByAmt={topCategoriesMoneyOutByAmt.slice(0, 6)}
          moneyInSummaryByCount={topCategoriesMoneyInByCount.slice(0, 6)}
          moneyOutSummaryByCount={topCategoriesMoneyOutByCount.slice(0, 6)}
        />
      </div>
    </div>
  );
};

export default DashboardPage;
