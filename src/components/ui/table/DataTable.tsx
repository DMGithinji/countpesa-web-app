import { useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import NoData from "@/components/NoData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../table";
import { DataTablePagination } from "./data-table-pagination";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalCount: number;
  pageIndex: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onRowClick?: (row: TData) => void;
  initialSorting?: SortingState;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  totalCount,
  pageIndex,
  pageSize = 10,
  onPageChange,
  onSortingChange,
  onRowClick,
  initialSorting = [],
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>(initialSorting);

  const handleSortingChange = (
    updaterOrValue: SortingState | ((prev: SortingState) => SortingState)
  ) => {
    // Handle both function updaters and direct value assignments
    let newSorting: SortingState;

    if (typeof updaterOrValue === "function") {
      newSorting = updaterOrValue(sorting);
    } else {
      newSorting = updaterOrValue;
    }

    // Update internal state
    setSorting(newSorting);

    // Call the parent callback if provided
    if (onSortingChange) {
      onPageChange(0);
      onSortingChange(newSorting);
    }
  };

  const table = useReactTable({
    data,
    pageCount: Math.ceil(totalCount / pageSize),
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({ pageIndex, pageSize });
        onPageChange(newState.pageIndex);
      }
    },
    manualPagination: false,
    enableRowSelection: true,
    onSortingChange: handleSortingChange,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const handleRowClick = (e: React.MouseEvent, row: TData) => {
    if ((e.target as HTMLElement).closest(".actions-menu")) {
      return;
    }
    if (onRowClick) {
      onRowClick(row);
    }
  };

  return (
    <div className="space-y-4 w-full max-w-80vw">
      {/* <DataTableToolbar table={table} /> */}
      <div>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={(e) => handleRowClick(e, row.original)}
                  className={cn(onRowClick ? "cursor-pointer" : "")}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns?.length || 0} className="h-24 text-center">
                  <NoData />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {totalCount > pageSize && <DataTablePagination table={table} />}
    </div>
  );
}
