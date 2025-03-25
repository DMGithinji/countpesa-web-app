import { useCallback, useMemo, useState } from "react";
import { useTransactionContext } from "@/context/TransactionDataContext";
import {
  GroupByField,
  GroupByTrxSortBy,
  groupedTrxByField,
  TransactionSummary,
} from "@/lib/groupByField";
import { filterTransactions, sortBy } from "@/lib/utils";
import useSidepanelStore, {
  SidepanelMode,
  SidepanelTransactions,
} from "@/stores/sidepanel.store";
import { MoneyMode, Transaction } from "@/types/Transaction";
import { transactionGroupSummaryColumns } from "@/components/GroupedTrsTable/Columns";
import { TransactionSearch } from "@/components/SearchInput";
import TopAccountsChart from "@/components/TopAccountsChart";
import GroupedTrsTable, { SortBy } from "@/components/GroupedTrsTable/Table";
import {
  ActionItem,
  TableRowActions,
} from "@/components/GroupedTrsTable/RowAction";
import CategorizeModal from "@/components/CategorizeModal";
import { Badge } from "@/components/ui/badge";
import { Filter } from "@/types/Filters";

const AccountsPage = () => {
  const { transactions, calculatedData, validateAndAddFilters } = useTransactionContext();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const {
    transactionTotals,
    topAccountsSentToByAmt,
    topAccountsReceivedFromByAmt,
    topAccountsReceivedFromByCount,
    topAccountsSentToByCount,
  } = calculatedData;

  const setSidepanelMode = useSidepanelStore((state) => state.setMode);
  const setTransactionsData = useSidepanelStore(
    (state) => state.setTransactionsData
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const [sortingState, setSortingState] = useState<SortBy>({
    desc: false,
    id: GroupByTrxSortBy.MoneyOut,
  });

  const groupedTrs = useMemo(() => {
    const filteredTrs = filterTransactions(transactions, searchQuery);
    const groupedTrx = groupedTrxByField(filteredTrs, GroupByField.Account);
    return sortBy(
      groupedTrx,
      sortingState.id,
      sortingState.desc ? "desc" : "asc"
    );
  }, [searchQuery, transactions, sortingState]);

  const handlePieChartClick = useCallback(
    (summary: SidepanelTransactions) => {
      setTransactionsData(summary);
      setSidepanelMode(SidepanelMode.Transactions);
    },
    [setSidepanelMode, setTransactionsData]
  );

  const handleCategoryClick = useCallback((group: TransactionSummary) => {
    setSelectedTransaction(group.transactions[0]);
    setIsModalOpen(true);
  }, []);

  const actions: ActionItem[] = useMemo(() => [
    {
      title: "Categorize All",
      onClick: handleCategoryClick,
    },
    {
      title: "Show Similar",
      onClick: (row) => {
        console.log(`Editing card for ${row.name}`)
        const filter: Filter = {
          field: "account",
          operator: "==",
          value: row.name,
          mode: 'and',
        };
        validateAndAddFilters(filter);
      },
    },
    {
      title: "Exclude Similar",
      onClick: (row) => {
        console.log(`Editing card for ${row.name}`)
        const filter: Filter = {
          field: "account",
          operator: "!=",
          value: row.name,
          mode: 'and',
        };
        validateAndAddFilters(filter);
      },
    },
    {
      title: "View Transactions",
      onClick: (row) => {
        setTransactionsData(row);
        setSidepanelMode(SidepanelMode.Transactions);
      },
    },
  ]
  , [handleCategoryClick, validateAndAddFilters, setTransactionsData, setSidepanelMode]
  );

  const columnsWithActions = useMemo(() => transactionGroupSummaryColumns({
    title: "Sender/Receiver",
    rows: [
      {
        headerTitle: "Main Category",
        rowElement: (row) => {
          const groups = groupedTrxByField(
            row.transactions,
            GroupByField.Category
          );
          const mainCateg = groups[0];
          return (
            <Badge
              onClick={(e) => {
                e.stopPropagation();
                handleCategoryClick(row);
              }}
              className="bg-primary/20 font-semibold text-primary"
            >
              {mainCateg.name}
            </Badge>
          );
        },
      },
      {
        headerTitle: "Actions",
        rowElement: (row) => <TableRowActions row={row} actions={actions} />,
      },
    ],
  })
  , [actions, handleCategoryClick]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
        <TopAccountsChart
          moneyMode={MoneyMode.MoneyIn}
          totalAmount={transactionTotals.moneyInAmount}
          groupedDataByAmount={topAccountsReceivedFromByAmt}
          groupedDataByCount={topAccountsReceivedFromByCount}
          onItemClick={handlePieChartClick}
        />
        <TopAccountsChart
          moneyMode={MoneyMode.MoneyOut}
          totalAmount={transactionTotals.moneyOutAmount}
          groupedDataByAmount={topAccountsSentToByAmt}
          groupedDataByCount={topAccountsSentToByCount}
          onItemClick={handlePieChartClick}
        />
      </div>
      <div>
        <div className="flex justify-between items-center mb-4">
          <TransactionSearch onSearch={setSearchQuery} />
        </div>
        <GroupedTrsTable
          transactions={groupedTrs}
          columnDef={columnsWithActions}
          onSortingChange={setSortingState}
          sortBy={sortingState}
        />
      </div>
      {selectedTransaction && (
        <CategorizeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          transaction={selectedTransaction}
          mode={"multiple"}
        />
      )}
    </>
  );
};

export default AccountsPage;
