import * as React from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { useTheme } from "../_shared/theme/context";
import {
  createDataTableGlobalFilterFn,
  getColumnValue,
  normalizeColumnId,
  resolveDataTableUpdater,
  toTanStackColumns,
  type DataTableAlign,
  type DataTableColumn,
  type DataTablePaginationState,
  type DataTableSharedProps,
  type DataTableSorting,
  type DataTableUpdater,
} from "./data-table.shared";

export interface DataTableProps<TData> extends DataTableSharedProps<TData> {}

/**
 * React Native data table with the same TanStack-backed props as web.
 * Uses `@tanstack/react-table` for sorting / filtering / pagination state
 * and renders rows with RN primitives.
 */
export function DataTable<TData extends Record<string, unknown>>({
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
}: DataTableProps<TData>) {
  const theme = useTheme();
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

  const headerGroup = table.getHeaderGroups()[0];
  const rows = table.getRowModel().rows;
  const filteredRowCount = table.getFilteredRowModel().rows.length;
  const pageCount = Math.max(1, table.getPageCount());
  const pageIndexValue = table.getState().pagination.pageIndex;

  return (
    <View style={{ gap: 16 }}>
      <View style={{ gap: 12 }}>
        <TextInput
          accessibilityLabel="Filter table rows"
          onChangeText={(value) => table.setGlobalFilter(value)}
          placeholder={searchPlaceholder}
          placeholderTextColor={theme.colors.foregroundMuted}
          style={{
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.surface,
            color: theme.colors.foreground,
            paddingHorizontal: 14,
            paddingVertical: 10,
          }}
          value={globalFilterValue}
        />
        <Text style={{ color: theme.colors.foregroundMuted, fontSize: theme.typography.size.sm }}>
          {filteredRowCount} row{filteredRowCount === 1 ? "" : "s"}
        </Text>
      </View>

      <ScrollView
        horizontal
        style={{
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
          backgroundColor: theme.colors.surface,
        }}
      >
        <View style={{ minWidth: 560 }}>
          <View
            style={{
              flexDirection: "row",
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border,
            }}
          >
            {(headerGroup?.headers ?? []).map((header) => {
              const original = columnsById.get(header.column.id);
              const sortDirection = header.column.getIsSorted();
              const canSort = header.column.getCanSort();
              const headerText =
                typeof original?.header === "string" || typeof original?.header === "number"
                  ? String(original.header)
                  : header.column.id;
              return (
                <Pressable
                  key={header.id}
                  onPress={() => {
                    if (!canSort) return;
                    header.column.toggleSorting(header.column.getIsSorted() === "asc");
                  }}
                  style={{
                    flex: 1,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                  }}
                >
                  <Text
                    style={{
                      color: theme.colors.foregroundMuted,
                      fontSize: theme.typography.size.xs,
                      fontWeight: theme.typography.weight.semibold,
                      textAlign: resolveNativeAlignment(original?.align),
                      textTransform: "uppercase",
                    }}
                  >
                    {headerText} {sortDirection === "asc" ? "▲" : sortDirection === "desc" ? "▼" : ""}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {rows.length > 0 ? (
            rows.map((row) => (
              <View
                key={row.id}
                style={{
                  flexDirection: "row",
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.border,
                }}
              >
                {row.getVisibleCells().map((cell) => {
                  const original = columnsById.get(cell.column.id);
                  return (
                    <View key={cell.id} style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 14 }}>
                      <Text
                        style={{
                          color: theme.colors.foreground,
                          fontSize: theme.typography.size.sm,
                          textAlign: resolveNativeAlignment(original?.align),
                        }}
                      >
                        {resolveNativeCellText(row.original, original)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ))
          ) : (
            <View style={{ padding: 24 }}>
              <Text style={{ color: theme.colors.foregroundMuted, textAlign: "center" }}>
                No rows match the current filter.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ color: theme.colors.foregroundMuted, fontSize: theme.typography.size.sm }}>
          Page {pageIndexValue + 1} of {pageCount}
        </Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Pressable
            disabled={!table.getCanPreviousPage()}
            onPress={() => table.previousPage()}
            style={{
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.md,
              opacity: !table.getCanPreviousPage() ? 0.45 : 1,
              paddingHorizontal: 14,
              paddingVertical: 10,
            }}
          >
            <Text style={{ color: theme.colors.foreground }}>Previous</Text>
          </Pressable>
          <Pressable
            disabled={!table.getCanNextPage()}
            onPress={() => table.nextPage()}
            style={{
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.md,
              opacity: !table.getCanNextPage() ? 0.45 : 1,
              paddingHorizontal: 14,
              paddingVertical: 10,
            }}
          >
            <Text style={{ color: theme.colors.foreground }}>Next</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function resolveNativeCellText<TData>(row: TData, column: DataTableColumn<TData> | undefined): string {
  if (column?.cell) {
    try {
      const rendered = column.cell(row);
      if (typeof rendered === "string" || typeof rendered === "number") return String(rendered);
      if (rendered != null) {
        const raw = getColumnValue(row, column);
        return String((raw as string | number | null) ?? "");
      }
    } catch {
      // fall through
    }
  }
  if (!column) return "";
  const raw = getColumnValue(row, column);
  return String((raw as string | number | null) ?? "");
}

function resolveNativeAlignment(align: DataTableAlign = "left") {
  return align;
}
