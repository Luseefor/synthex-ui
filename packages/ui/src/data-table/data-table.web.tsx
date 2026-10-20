import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { Input } from "../input/input.web";
import { Button } from "../button/button.web";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../table/table.web";
import { cn } from "../_shared/variants";
import {
  createDataTableGlobalFilterFn,
  normalizeColumnId,
  resolveDataTableUpdater,
  toTanStackColumns,
  type DataTableAlign,
  type DataTablePaginationState,
  type DataTableSharedProps,
  type DataTableSorting,
  type DataTableUpdater,
} from "./data-table.shared";

export interface DataTableProps<TData>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    DataTableSharedProps<TData> {}

/**
 * Cross-platform data table backed by `@tanstack/react-table`.
 *
 * Supports TanStack-style controlled `sorting` / `globalFilter` / `pagination`
 * state plus legacy `searchKey` / `pageSize` props. Sorting is single-column
 * (first `sorting` entry) with removal disabled to preserve legacy toggle
 * behaviour; the global filter is case-insensitive and honours `searchKey`
 * when provided.
 */
export function DataTable<TData extends Record<string, unknown>>({
  className,
  columns,
  data,
  pageSize = 5,
  searchKey,
  searchPlaceholder = "Filter rows",
  sorting: controlledSorting,
  defaultSorting,
  onSortingChange,
  globalFilter: controlledGlobalFilter,
  defaultGlobalFilter = "",
  onGlobalFilterChange,
  enableSorting: enableSortingProp = true,
  enableGlobalFilter = true,
  pagination: controlledPagination,
  defaultPagination,
  onPaginationChange,
  pageIndex: controlledPageIndex,
  defaultPageIndex,
  onPageIndexChange,
  ...props
}: DataTableProps<TData>) {
  const [internalSorting, setInternalSorting] = React.useState<DataTableSorting[]>(
    defaultSorting ? [...defaultSorting] : [],
  );
  const [internalGlobalFilter, setInternalGlobalFilter] = React.useState<string>(defaultGlobalFilter);
  const [internalPagination, setInternalPagination] = React.useState<DataTablePaginationState>(() => ({
    pageIndex: defaultPagination?.pageIndex ?? defaultPageIndex ?? 0,
    pageSize: defaultPagination?.pageSize ?? pageSize,
  }));

  const prevPageSizeRef = React.useRef(pageSize);
  React.useEffect(() => {
    if (prevPageSizeRef.current !== pageSize && controlledPagination === undefined) {
      setInternalPagination((prev) => ({ ...prev, pageSize }));
    }
    prevPageSizeRef.current = pageSize;
  }, [pageSize, controlledPagination]);

  const sortingState = controlledSorting ?? internalSorting;
  const globalFilterValue = controlledGlobalFilter ?? internalGlobalFilter;
  const paginationState: PaginationState = React.useMemo(() => {
    if (controlledPagination) {
      return { pageIndex: controlledPagination.pageIndex, pageSize: controlledPagination.pageSize };
    }
    return {
      pageIndex: controlledPageIndex ?? internalPagination.pageIndex,
      pageSize: internalPagination.pageSize,
    };
  }, [controlledPagination, controlledPageIndex, internalPagination]);

  const handleSortingChange: OnChangeFn<SortingState> = React.useCallback(
    (updater) => {
      const next = resolveDataTableUpdater(
        updater as DataTableUpdater<SortingState>,
        sortingState as SortingState,
      );
      const nextSorting: DataTableSorting[] = next.map((entry) => ({ id: entry.id, desc: entry.desc }));
      if (controlledSorting === undefined) {
        setInternalSorting(nextSorting);
      }
      onSortingChange?.(nextSorting);
    },
    [sortingState, controlledSorting, onSortingChange],
  );

  const handleGlobalFilterChange: OnChangeFn<string> = React.useCallback(
    (updater) => {
      const next = resolveDataTableUpdater(updater as DataTableUpdater<string>, globalFilterValue);
      const nextValue = String(next ?? "");
      if (controlledGlobalFilter === undefined) {
        setInternalGlobalFilter(nextValue);
      }
      onGlobalFilterChange?.(nextValue);
    },
    [globalFilterValue, controlledGlobalFilter, onGlobalFilterChange],
  );

  const handlePaginationChange: OnChangeFn<PaginationState> = React.useCallback(
    (updater) => {
      const next = resolveDataTableUpdater(
        updater as DataTableUpdater<PaginationState>,
        paginationState,
      );
      const nextPagination: DataTablePaginationState = {
        pageIndex: next.pageIndex,
        pageSize: next.pageSize,
      };
      if (controlledPagination === undefined) {
        if (controlledPageIndex === undefined) {
          setInternalPagination(nextPagination);
        } else {
          setInternalPagination((prev) => ({ ...prev, pageSize: nextPagination.pageSize }));
        }
      }
      onPaginationChange?.(nextPagination);
      onPageIndexChange?.(nextPagination.pageIndex);
    },
    [paginationState, controlledPagination, controlledPageIndex, onPaginationChange, onPageIndexChange],
  );

  const columnsById = React.useMemo(
    () => new Map(columns.map((column, index) => [normalizeColumnId(column, index), column] as const)),
    [columns],
  );

  const tanStackColumns = React.useMemo(
    () => toTanStackColumns(columns, { enableSorting: enableSortingProp }),
    [columns, enableSortingProp],
  );

  const tanStackGlobalFilterFn = React.useMemo(
    () => createDataTableGlobalFilterFn(columnsById, searchKey),
    [columnsById, searchKey],
  );

  const tableData = React.useMemo(() => [...data], [data]);

  const table = useReactTable({
    data: tableData,
    columns: tanStackColumns,
    state: {
      sorting: sortingState as unknown as SortingState,
      globalFilter: globalFilterValue,
      pagination: paginationState,
    },
    onSortingChange: handleSortingChange,
    onGlobalFilterChange: handleGlobalFilterChange,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: tanStackGlobalFilterFn,
    enableSorting: enableSortingProp,
    enableGlobalFilter,
    enableMultiSort: false,
    enableSortingRemoval: false,
    sortDescFirst: false,
    autoResetPageIndex: true,
  });

  const headerGroups = table.getHeaderGroups();
  const rows = table.getRowModel().rows;
  const filteredRowCount = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();
  const pageIndexValue = table.getState().pagination.pageIndex;

  return (
    <div data-slot="data-table" className={cn("flex flex-col gap-4", className)} {...props}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          aria-label="Filter table rows"
          className="w-full sm:max-w-xs"
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          placeholder={searchPlaceholder}
          value={globalFilterValue}
        />
        <div className="text-sm text-[color:var(--sx-color-foreground-muted)]">
          {filteredRowCount} row{filteredRowCount === 1 ? "" : "s"}
        </div>
      </div>

      <div className="rounded-[var(--sx-radius-lg)] border border-[color:var(--sx-color-border)]">
        <Table>
          <TableHeader>
            {headerGroups.map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const original = columnsById.get(header.column.id);
                  const align = original?.align ?? "left";
                  const canSort = header.column.getCanSort();
                  const sortDirection = header.column.getIsSorted();
                  const headerLabel = flexRender(header.column.columnDef.header, header.getContext());
                  const originalHeaderText =
                    original && (typeof original.header === "string" || typeof original.header === "number")
                      ? String(original.header)
                      : undefined;
                  const accessibleName =
                    originalHeaderText ??
                    (typeof headerLabel === "string" || typeof headerLabel === "number"
                      ? String(headerLabel)
                      : header.column.id);
                  return (
                    <TableHead key={header.id} className={resolveAlignmentClass(align)}>
                      {canSort ? (
                        <button
                          className="inline-flex items-center gap-2 text-inherit"
                          onClick={header.column.getToggleSortingHandler()}
                          type="button"
                          aria-label={`Sort by ${accessibleName}`}
                        >
                          <span>{headerLabel}</span>
                          <span className="text-[10px] text-[color:var(--sx-color-foreground-muted)]">
                            {sortDirection === "asc" ? "▲" : sortDirection === "desc" ? "▼" : "↕"}
                          </span>
                        </button>
                      ) : (
                        headerLabel
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    const original = columnsById.get(cell.column.id);
                    return (
                      <TableCell key={cell.id} className={resolveAlignmentClass(original?.align)}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="py-10 text-center text-[color:var(--sx-color-foreground-muted)]" colSpan={tanStackColumns.length}>
                  No rows match the current filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-[color:var(--sx-color-foreground-muted)]">
          Page {pageIndexValue + 1} of {Math.max(1, pageCount)}
        </div>
        <div className="flex items-center gap-2">
          <Button
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            size="sm"
            variant="outline"
          >
            Previous
          </Button>
          <Button
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            size="sm"
            variant="outline"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

function resolveAlignmentClass(align: DataTableAlign = "left") {
  if (align === "center") {
    return "text-center";
  }

  if (align === "right") {
    return "text-end";
  }

  return "text-start";
}
