import useTransactionStore from "@/stores/transactions.store"

const DashboardPage = () => {
  const transactions = useTransactionStore(state => state.transactions);
  const loading = useTransactionStore(state => state.loading);

  if (loading) return (
    <div>Loading...</div>
  )

  return (
    <>
      <div>DashboardPage</div>
      <div>{transactions.length}</div>
      </>
  )
}

export default DashboardPage