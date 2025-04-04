import { useMemo } from "react";
import { transactionGroupSummaryColumns } from "@/components/GroupedTrsTable/Columns";
import { TableRowActions, ActionItem } from "@/components/GroupedTrsTable/RowAction";
import { GroupByField, TransactionSummary, groupedTrxByField } from "@/lib/groupByField";
import { Filter } from "@/types/Filters";
import { Badge } from "@/components/ui/badge";

interface UseTransactionColumnsProps {
  groupByField: "category" | "account";
  actions: ActionItem[];
  title: string;
  onCategoryClick?: (group: TransactionSummary) => void;
}

const createFilters = (field: "category" | "account", value: string): Filter[] => [
  { field, operator: "==", value },
  { field, operator: "!=", value },
];

export const useTransactionColumns = ({
  groupByField,
  actions,
  title,
  onCategoryClick,
}: UseTransactionColumnsProps) => {
  const columns = useMemo(() => {
    const baseRows = [
      {
        headerTitle: "Actions",
        rowElement: (row: TransactionSummary) => (
          <TableRowActions row={row} actions={actions} />
        ),
      },
    ];

    const categoryRow = onCategoryClick
      ? [
          {
            headerTitle: "Main Category",
            rowElement: (row: TransactionSummary) => {
              const groups = groupedTrxByField(row.transactions, GroupByField.Category);
              const mainCateg = groups[0];
              return (
                <div className="w-[180px]">
                  <Badge
                    onClick={(e) => {
                      e.stopPropagation();
                      onCategoryClick(row);
                    }}
                    className="bg-primary/10 font-semibold text-primary"
                  >
                    {mainCateg.name}
                  </Badge>
                </div>
              );
            },
          },
        ]
      : [];

    return transactionGroupSummaryColumns({
      title,
      filters: (value: string) => createFilters(groupByField, value),
      rows: [...categoryRow, ...baseRows],
    });
  }, [groupByField, actions, title, onCategoryClick]);

  return columns;
};