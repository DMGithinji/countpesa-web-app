import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { DataTableColumnHeader } from "../ui/table/data-table-column-header";
import { Transaction } from "@/types/Transaction";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { UNCATEGORIZED } from "@/types/Categories";
import HoverableActionText from "../HoverableActionText";
import { Filter } from "@/types/Filters";

type TransactionColumnProps = {
  onCategoryClick?: (transaction: Transaction) => void;
};

const getFilters = (tr: Transaction) => {
  return [
    {
      field: "account",
      operator: "==",
      value: tr.account,
    },
    {
      field: "account",
      operator: "!=",
      value: tr.account,
    },
    {
      field: "code",
      operator: "==",
      value: tr.code,
    },
  ] as Filter[];
};

export const createTransactionColumns = ({
  onCategoryClick,
}: TransactionColumnProps = {}): ColumnDef<Transaction>[] => [
  {
    accessorKey: "account",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sender/Receiver" />
    ),
    cell: ({ row }) => {
      const transaction = row.original;
      return (
        <div className="w-[250px] max-w-[250px]">
          <HoverableActionText
            className="max-w-[240px]"
            actions={getFilters(transaction)}
          >
            <span
              title={transaction.account}
              className="block truncate max-w-full"
            >
              {transaction.account}
            </span>
          </HoverableActionText>
        </div>
      );
    },
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
      const formattedAmount =
        amount < 0 ? `-Ksh ${Math.abs(amount)}` : `Ksh ${amount}`;

      return (
        <div
          className={`w-[100px] ${
            amount < 0 ? "text-red-600" : "text-green-600"
          } font-semibold`}
        >
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
          {format(date, "EEE, MMM dd yyyy HH:mm")}
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
      const transaction = row.original;

      return (
        <Badge
          className={cn(
            "w-[120px] cursor-pointer hover:opacity-80 truncate",
            category !== UNCATEGORIZED
              ? "bg-green-100 text-green-500 border-green-200"
              : "bg-orange-100/80 text-orange-400/80 border-orange-100"
          )}
          onClick={() => onCategoryClick && onCategoryClick(transaction)}
        >
          <span className="truncate">
            {category === UNCATEGORIZED ? "Categorize" : category}
          </span>
        </Badge>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "transactionType",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => (
      <div className="w-[100px]">{row.getValue("transactionType")}</div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
];
