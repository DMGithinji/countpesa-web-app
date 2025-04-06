import { useMemo } from "react";
import { ActionItem } from "@/components/GroupedTrsTable/RowAction";
import { GroupByField, TransactionSummary } from "@/lib/groupByField";
import { Filter, FilterMode } from "@/types/Filters";
import { SidepanelMode, SidepanelTransactions } from "@/stores/ui.store";

interface UseTableActionsProps {
  groupByField: GroupByField;
  validateAndAddFilters: (filter: Filter) => void;
  setTransactionsData: (data: SidepanelTransactions) => void;
  setSidepanelMode: (mode: SidepanelMode) => void;
  onCategorizeClick?: (group: TransactionSummary) => void;
}

export const useTableActions = ({
  groupByField,
  validateAndAddFilters,
  setTransactionsData,
  setSidepanelMode,
  onCategorizeClick,
}: UseTableActionsProps) => {
  const actions: ActionItem[] = useMemo(() => {
    const baseActions: ActionItem[] = [
      {
        title: "Show Similar",
        onClick: (row) => {
          const filter: Filter = {
            field: groupByField,
            operator: "==",
            value: row.name,
            mode: FilterMode.AND,
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
            mode: FilterMode.AND,
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
