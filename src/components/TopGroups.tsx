import TopTrsGroupedByField from './TopTrsGroupedByField'
import ChartTransactions from './ChartTransactions'
import { GroupByField } from '@/lib/groupByField'
import { useTransactionContext } from '@/context/TransactionDataContext'
import { useState } from 'react'
import { Transaction } from '@/types/Transaction'

const TopGroups = () => {
  const [selectedTransactions, setSelectedTransactions] = useState<{
    title: string;
    transactions: Transaction[];
  }>({
    title: '',
    transactions: [],
  });
  const { calculatedData } = useTransactionContext();
  const {
    topAccountsSentToByAmt,
    topAccountsReceivedFromByAmt,
    topCategoriesMoneyInByAmt,
    topCategoriesMoneyOutByAmt,
    topAccountsSentToByCount,
    topAccountsReceivedFromByCount,
    topCategoriesMoneyInByCount,
    topCategoriesMoneyOutByCount,
  } = calculatedData;

  return (
    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
    <TopTrsGroupedByField
      groupedBy={GroupByField.Account}
      moneyInSummaryByAmt={topAccountsReceivedFromByAmt.slice(0, 6)}
      moneyOutSummaryByAmt={topAccountsSentToByAmt.slice(0, 6)}
      moneyInSummaryByCount={topAccountsReceivedFromByCount.slice(0, 6)}
      moneyOutSummaryByCount={topAccountsSentToByCount.slice(0, 6)}
      onSelectGroup={setSelectedTransactions}
    />
    <TopTrsGroupedByField
      groupedBy={GroupByField.Category}
      moneyInSummaryByAmt={topCategoriesMoneyInByAmt.slice(0, 6)}
      moneyOutSummaryByAmt={topCategoriesMoneyOutByAmt.slice(0, 6)}
      moneyInSummaryByCount={topCategoriesMoneyInByCount.slice(0, 6)}
      moneyOutSummaryByCount={topCategoriesMoneyOutByCount.slice(0, 6)}
      onSelectGroup={setSelectedTransactions}
    />
    <ChartTransactions
      selected={selectedTransactions}
      defaultDisplayMode={'all'}
      defaultSortBy='date'
    />
    </div>
  )
}

export default TopGroups