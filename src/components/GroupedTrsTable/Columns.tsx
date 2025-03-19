import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "../ui/table/data-table-column-header"
import { Button } from "../ui/button"
import { Ellipsis } from "lucide-react"
import { TransactionSummary } from "@/lib/groupByField"
import { formatCurrency } from "@/lib/utils"

type TrGroupProps = {
  title: string
}

export const transactionGroupSummaryColumns = (
  props: TrGroupProps
): ColumnDef<TransactionSummary>[] => [
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
      <DataTableColumnHeader column={column} title="No. of Trs"  className="text-center w-[100px]" />
    ),
    cell: ({ row }) => (
      <div className="text-center w-[100px]">
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
        <div className={"text-red-500 w-[120px]"}>
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
        <div className={"text-green-600 w-[120px]"}>
          {formatCurrency(amount)}
        </div>
      );
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Actions" className="text-center" />
    ),
    cell: () => {
      return (
        <div className="text-center">
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">Open menu</span>
            <Ellipsis className="h-4 w-4" />
          </Button>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];

