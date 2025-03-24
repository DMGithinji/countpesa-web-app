import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../ui/table/data-table-column-header";
import { TransactionSummary } from "@/lib/groupByField";
import { formatCurrency } from "@/lib/utils";

type TrGroupProps = {
  title: string;
  rows?: Array<{
    headerTitle: string;
    rowElement: (row: TransactionSummary) => React.ReactElement
  }>;
};

export const transactionGroupSummaryColumns = (
  props: TrGroupProps
): ColumnDef<TransactionSummary>[] => {
  const items: ColumnDef<TransactionSummary>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={props.title} />
      ),
      cell: ({ row }) => (
        <div className="font-medium text-gray-700 max-w-[250px] truncate">
          {row.getValue("name")}
        </div>
      ),
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
        <div className="text-center w-[100px] font-semibold">
          {row.getValue("totalCount")}
        </div>
      ),
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: "moneyOutAmount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Money Out" />
      ),
      cell: ({ row }) => {
        const amount = row.getValue("moneyOutAmount") as number;
        return (
          <div className="text-red-600 w-[120px] font-semibold">
            {formatCurrency(amount)}
          </div>
        );
      },
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: "moneyInAmount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Money In" />
      ),
      cell: ({ row }) => {
        const amount = row.getValue("moneyInAmount") as number;
        return (
          <div className="text-green-600 w-[120px] font-semibold">
            {formatCurrency(amount)}
          </div>
        );
      },
      enableSorting: true,
      enableHiding: false,
    },
  ];

  // Add actions column only if actions prop is provided
  props.rows?.forEach((val) => {
    items.push({
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={val.headerTitle}
        />
      ),
      cell: ({ row }) => val.rowElement(row.original), // Use the actions function with row data
      enableSorting: false,
      enableHiding: false,
    });
  })

  return items;
};
