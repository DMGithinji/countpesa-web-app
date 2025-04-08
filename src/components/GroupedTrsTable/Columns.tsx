import { ColumnDef } from "@tanstack/react-table";
import { TransactionSummary } from "@/lib/groupByField";
import { formatCurrency } from "@/lib/utils";
import { Filter } from "@/types/Filters";
import HoverableActionText from "../HoverableActionText";
import { DataTableColumnHeader } from "../ui/table/data-table-column-header";

type TrGroupProps = {
  title: string;
  filters?: (value: string) => Filter[];
  rows?: Array<{
    headerTitle: string;
    rowElement: (row: TransactionSummary) => React.ReactElement;
  }>;
};

export const transactionGroupSummaryColumns = (
  props: TrGroupProps
): ColumnDef<TransactionSummary>[] => {
  const items: ColumnDef<TransactionSummary>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title={props.title} />,
      cell: ({ row }) => {
        return !props.filters ? (
          <span className="underline">{row.getValue("name")}</span>
        ) : (
          <div className="w-[240px] max-w-[240px]">
            <HoverableActionText
              className="max-w-[200px]"
              actions={props.filters(row.getValue("name"))}
            >
              <span
                title={row.getValue("name")}
                className="block truncate max-w-full capitalize underline"
              >
                {row.getValue("name")}
              </span>
            </HoverableActionText>
          </div>
        );
      },
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: "totalCount",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="No. of Trs"
          className="text-center w-[100px]"
        />
      ),
      cell: ({ row }) => (
        <div className="px-6 w-[150px] font-semibold">{row.getValue("totalCount")}</div>
      ),
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: "moneyOutAmount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Money Out" />,
      cell: ({ row }) => {
        const amount = row.getValue("moneyOutAmount") as number;
        return (
          <div className="text-money-out w-[150px] font-semibold">{formatCurrency(amount)}</div>
        );
      },
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: "moneyInAmount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Money In" />,
      cell: ({ row }) => {
        const amount = row.getValue("moneyInAmount") as number;
        return (
          <div className="text-money-in w-[150px] font-semibold">{formatCurrency(amount)}</div>
        );
      },
      enableSorting: true,
      enableHiding: false,
    },
  ];

  // Add actions column only if actions prop is provided
  props.rows?.forEach((val, i) => {
    items.push({
      id: `actions-${i}`,
      header: ({ column }) => <DataTableColumnHeader column={column} title={val.headerTitle} />,
      cell: ({ row }) => val.rowElement(row.original), // Use the actions function with row data
      enableSorting: false,
      enableHiding: false,
    });
  });

  return items;
};
