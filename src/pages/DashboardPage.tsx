import BalanceTrendCard from "@/components/BalanceTrend";
import PeriodicTransactionsChart from "@/components/PeriodicTransactionsChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboard } from "@/hooks/useDashboard";
import { formatCurrency } from "@/lib/utils";
import useTransactionStore from "@/stores/transactions.store";
import { MinusCircle, PlusCircle } from "lucide-react";

const DashboardPage = () => {
  const transactions = useTransactionStore((state) => state.transactions);
  const { transactionTotals, balance, balanceTrend } = useDashboard();
  const loading = useTransactionStore((state) => state.loading);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto max-w-5xl">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Received ({transactionTotals.moneyInCount} Transactions)
            </CardTitle>
            <PlusCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(transactionTotals.moneyInAmount)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sent ({transactionTotals.moneyOutCount} Transactions)
            </CardTitle>
            <MinusCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold  text-red-500">
              {formatCurrency(transactionTotals.moneyOutAmount)}
            </div>
          </CardContent>
        </Card>
        <BalanceTrendCard latestBalance={balance} data={balanceTrend} />
      </div>
      <div className="py-4">
        <PeriodicTransactionsChart transactions={transactions} />
      </div>
    </div>
  );
};

export default DashboardPage;
