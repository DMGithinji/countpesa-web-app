import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import useTransactionStore from "@/stores/transactions.store";
import AmtSummaryCard from "@/components/AmtSummaryCard";
import BalanceTrendCard from "@/components/BalanceTrend";
import PeriodicTransactionsChart from "@/components/PeriodicTransactionsChart";
import { MoneyMode } from "@/types/Transaction";
import { useTransactionContext } from "@/context/TransactionDataContext";
import TopGroups from "@/components/TopGroups";
import QuickFiltersCarousel from "@/components/QuickFiltersCarousel";
import TransactionHeatmap from "@/components/TransactionHeatmap";
import { useState } from "react";
import { Period } from "@/lib/groupByPeriod";

const DashboardPage = () => {
  const transactions = useTransactionStore((state) => state.transactions);
  const { calculatedData, dateRangeData, periodAverages } =
    useTransactionContext();
  const { transactionTotals, balance, balanceTrend } = calculatedData;
  const { defaultPeriod, periodOptions } = dateRangeData;
  const [selectedPeriod, setSelectedPeriod] = useState<Period>(defaultPeriod);

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
            periodAverages[selectedPeriod || defaultPeriod].moneyInAverage
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
            periodAverages[selectedPeriod || defaultPeriod].moneyOutAverage
          }
        />
        <BalanceTrendCard latestBalance={balance} data={balanceTrend} />
        <QuickFiltersCarousel />
      </div>

      <div className="py-4">
        <PeriodicTransactionsChart
          defaultPeriod={selectedPeriod}
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
