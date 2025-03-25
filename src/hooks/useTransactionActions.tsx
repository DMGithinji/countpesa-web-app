import { useMemo } from "react";
import { ActionItem } from "@/components/GroupedTrsTable/RowAction";
import { TransactionSummary } from "@/lib/groupByField";
import { Filter } from "@/types/Filters";
import { SidepanelMode, SidepanelTransactions } from "@/stores/sidepanel.store";

interface UseTransactionActionsProps {
  groupByField: "category" | "account";
  validateAndAddFilters: (filter: Filter) => void;
  setTransactionsData: (data: SidepanelTransactions) => void;
  setSidepanelMode: (mode: SidepanelMode) => void;
  onCategorizeClick?: (group: TransactionSummary) => void;
}

export const useTransactionActions = ({
  groupByField,
  validateAndAddFilters,
  setTransactionsData,
  setSidepanelMode,
  onCategorizeClick,
}: UseTransactionActionsProps) => {
  const actions: ActionItem[] = useMemo(() => {
    const baseActions: ActionItem[] = [
      {
        title: "Show Similar",
        onClick: (row) => {
          const filter: Filter = {
            field: groupByField,
            operator: "==",
            value: row.name,
            mode: "and",
          };
          validateAndAddFilters(filter);
        },
      },
      {
        title: "Exclude Similar",
        onClick: (row) => {
          const filter: Filter = {
            field: groupByField,
            operator: "!=",
            value: row.name,
            mode: "and",
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
    ];

    if (onCategorizeClick) {
      return [
        {
          title: "Categorize All",
          onClick: onCategorizeClick,
        },
        ...baseActions,
      ];
    }

    return baseActions;
  }, [
    groupByField,
    validateAndAddFilters,
    setTransactionsData,
    setSidepanelMode,
    onCategorizeClick,
  ]);

  return actions;
};
