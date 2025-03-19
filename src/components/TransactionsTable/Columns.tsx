import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { DataTableColumnHeader } from "../ui/table/data-table-column-header";
import { Transaction } from "@/types/Transaction";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";

export const transactionColumns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "account",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sender/Receiver" />
    ),
    cell: ({ row }) => <div className="font-medium text-gray-700 max-w-[250px] truncate">{row.getValue("account")}</div>,
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number;
      const formattedAmount = amount < 0
        ? `-Ksh ${Math.abs(amount)}`
        : `Ksh ${amount}`;

      return (
        <div className={`w-[100px] ${amount < 0 ? 'text-red-600' : 'text-green-600'} font-semibold`}>
          {formattedAmount}
        </div>
      );
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const timestamp = row.getValue("date") as number;
      const date = new Date(timestamp);

      return (
        <div className="w-[160px]">
          {format(date, 'EEE, MMM dd yyyy HH:mm')}
        </div>
      );
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => {
      const category = row.getValue("category") as string;

      return (
        <Badge
          className={cn('w-[120px]', category !== 'Uncategorized' ? 'bg-green-100 text-green-500 border-green-200' : 'bg-orange-100/80 text-orange-400/80 border-orange-100')}
        >
          {category === 'Uncategorized' ? 'Categorize' : category }
        </Badge>
      );
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "transactionType",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => <div  className="w-[100px]">{row.getValue("transactionType")}</div>,
    enableSorting: true,
    enableHiding: false,
  }
]