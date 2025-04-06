import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import useTransactionStore from "@/stores/transactions.store";
import AmtSummaryCard from "@/components/AmtSummaryCard";
import BalanceTrendCard from "@/components/BalanceTrend";
import PeriodicTransactionsChart from "@/components/PeriodicTransactionsChart";
import { MoneyMode } from "@/types/Transaction";
import TopGroups from "@/components/TopGroups";
import QuickFiltersCarousel from "@/components/QuickFiltersCarousel";
import TransactionHeatmap from "@/components/TransactionHeatmap";
import { useEffect, useState } from "react";
import { Period } from "@/lib/groupByPeriod";

const DashboardPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>();

  const transactions = useTransactionStore((state) => state.transactions);
  const calculatedData = useTransactionStore((state) => state.calculatedData);
  const dateRangeData = useTransactionStore((state) => state.dateRangeData);
  const periodAverages = useTransactionStore((state) => state.periodAverages);
  const { transactionTotals, balance, balanceTrend } = calculatedData;
  const { defaultPeriod, periodOptions } = dateRangeData;

  useEffect(() => {
    setSelectedPeriod(defaultPeriod);
  }, [defaultPeriod]);

  return (
    <>
      <div className="grid gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        <AmtSummaryCard
          type="Received"
          count={transactionTotals.moneyInCount}
          amount={transactionTotals.moneyInAmount}
          mode={MoneyMode.MoneyIn}
          Icon={ArrowDownCircle}
          period={selectedPeriod || defaultPeriod}
          average={
            periodAverages[selectedPeriod || defaultPeriod]?.moneyInAverage || 0
          }
        />
        <AmtSummaryCard
          type="Sent"
          count={transactionTotals.moneyOutCount}
          amount={transactionTotals.moneyOutAmount}
          mode={MoneyMode.MoneyOut}
          Icon={ArrowUpCircle}
          period={selectedPeriod || defaultPeriod}
          average={
            periodAverages[selectedPeriod || defaultPeriod]?.moneyOutAverage || 0
          }
        />
        <BalanceTrendCard latestBalance={balance} data={balanceTrend} />
        <QuickFiltersCarousel />
      </div>

      <div className="py-4">
        <PeriodicTransactionsChart
          defaultPeriod={selectedPeriod || defaultPeriod}
          onPeriodChange={setSelectedPeriod}
          periodOptions={periodOptions}
          transactions={transactions}
        />
      </div>

      <TopGroups />
      <TransactionHeatmap transactions={transactions} />
    </>
  );
};

export default DashboardPage;
