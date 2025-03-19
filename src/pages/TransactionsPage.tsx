import TransactionsTable from "@/components/TransactionsTable/Table";
import useTransactionStore from "@/stores/transactions.store";

const TransactionsPage = () => {
  const transactions = useTransactionStore((state) => state.transactions);
  const loading = useTransactionStore((state) => state.loading);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto max-w-5xl">
      <TransactionsTable
        transactions={transactions}
      />
    </div>
  );
};

export default TransactionsPage;
