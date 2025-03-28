import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import useTransactionStore from "@/stores/transactions.store";
import AmtSummaryCard from "@/components/AmtSummaryCard";
import BalanceTrendCard from "@/components/BalanceTrend";
import PeriodicTransactionsChart from "@/components/PeriodicTransactionsChart";
import { MoneyMode } from "@/types/Transaction";
import { useTransactionContext } from "@/context/TransactionDataContext";
import TopGroups from "@/components/TopGroups";

const DashboardPage = () => {
  const loading = useTransactionStore((state) => state.loading);
  const transactions = useTransactionStore((state) => state.transactions);
  const { calculatedData, dateRangeData } = useTransactionContext();
  const {
    transactionTotals,
    balance,
    balanceTrend,
  } = calculatedData;
  const { defaultPeriod, periodOptions } = dateRangeData;

  if (loading) return <div>Loading...</div>;

  return (
    <>
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

      <TopGroups />
    </>
  );
};

export default DashboardPage;
