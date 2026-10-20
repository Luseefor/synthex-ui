import type { ReactNode } from "react";
import type { ColumnDef, FilterFn, Row, SortingFn } from "@tanstack/react-table";

export type DataTableAlign = "left" | "center" | "right";

export interface DataTableColumn<TData> {
  readonly id?: string;
  readonly header: ReactNode | ((context: { readonly column: DataTableColumn<TData> }) => ReactNode);
  /** Legacy accessor: key or getter returning cell value. */
  readonly accessor?: keyof TData | ((row: TData) => ReactNode);
  /** TanStack accessor key. Maps directly to a TanStack `accessorKey` column. */
  readonly accessorKey?: keyof TData;
  /** TanStack accessor fn. Maps directly to a TanStack `accessorFn` column. */
  readonly accessorFn?: (row: TData) => unknown;
  readonly cell?: (row: TData) => ReactNode;
  readonly sortable?: boolean;
  /** TanStack sorting toggle. Alias of `sortable`. */
  readonly enableSorting?: boolean | undefined;
  readonly searchValue?: (row: TData) => string;
  readonly align?: DataTableAlign;
  /** TanStack compat: disable global filter for this column. */
  readonly enableGlobalFilter?: boolean | undefined;
}

export interface DataTableSorting {
  readonly id: string;
  readonly desc: boolean;
}

export interface DataTablePaginationState {
  readonly pageIndex: number;
  readonly pageSize: number;
}

export type DataTableUpdater<T> = T | ((old: T) => T);

export interface DataTableSharedProps<TData> {
  readonly columns: readonly DataTableColumn<TData>[];
  readonly data: readonly TData[];
  readonly pageSize?: number;
  readonly searchKey?: keyof TData;
  readonly searchPlaceholder?: string;
  /** Controlled TanStack sorting state. */
  readonly sorting?: readonly DataTableSorting[];
  readonly defaultSorting?: readonly DataTableSorting[];
  readonly onSortingChange?: (sorting: DataTableSorting[]) => void;
  /** Controlled TanStack global filter. */
  readonly globalFilter?: string;
  readonly defaultGlobalFilter?: string;
  readonly onGlobalFilterChange?: (value: string) => void;
  readonly enableSorting?: boolean;
  readonly enableGlobalFilter?: boolean;
  /** Controlled TanStack pagination state. Takes precedence over `pageIndex`/`pageSize`. */
  readonly pagination?: DataTablePaginationState;
  readonly defaultPagination?: DataTablePaginationState;
  readonly onPaginationChange?: (pagination: DataTablePaginationState) => void;
  /** Controlled page index (zero-based). */
  readonly pageIndex?: number;
  readonly defaultPageIndex?: number;
  readonly onPageIndexChange?: (pageIndex: number) => void;
}

export function normalizeColumnId<TData>(column: DataTableColumn<TData>, index: number): string {
  if (column.id) return column.id;
  if (column.accessorKey != null) return String(column.accessorKey);
  if (typeof column.accessor === "string" || typeof column.accessor === "number") {
    return String(column.accessor);
  }
  return `column-${index}`;
}

export function getColumnValue<TData>(row: TData, column: DataTableColumn<TData>): unknown {
  if (column.accessorFn) return column.accessorFn(row);
  if (column.accessorKey != null) return row[column.accessorKey];
  if (typeof column.accessor === "function") return column.accessor(row);
  if (column.accessor != null) return row[column.accessor];
  return undefined;
}

export function isColumnSortable<TData>(column: DataTableColumn<TData>): boolean {
  if (column.sortable !== undefined) return column.sortable;
  if (column.enableSorting !== undefined) return column.enableSorting;
  return false;
}

export function resolveColumnHeader<TData>(
  column: DataTableColumn<TData>,
): ReactNode {
  if (typeof column.header === "function") {
    return (column.header as (ctx: { readonly column: DataTableColumn<TData> }) => ReactNode)({ column });
  }
  return column.header;
}

export function getColumnSearchText<TData>(row: TData, column: DataTableColumn<TData>): string {
  if (column.searchValue) {
    return column.searchValue(row);
  }
  const raw = getColumnValue(row, column);
  return String((raw as string | number | null) ?? "");
}

export function getColumnSortValue<TData>(row: TData, column: DataTableColumn<TData>): number | string {
  const rawValue = getColumnValue(row, column);
  if (typeof rawValue === "number") {
    return rawValue;
  }
  return String((rawValue as string | number | null) ?? "").toLowerCase();
}

export function compareDataTableValues(a: number | string, b: number | string): number {
  if (typeof a === "number" && typeof b === "number") {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  }
  const left = String(a);
  const right = String(b);
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

export function resolveDataTableUpdater<T>(updater: DataTableUpdater<T>, old: T): T {
  return typeof updater === "function" ? (updater as (prev: T) => T)(old) : updater;
}

export function createDataTableSortingFn<TData>(
  column: DataTableColumn<TData>,
): SortingFn<TData> {
  return (rowA: Row<TData>, rowB: Row<TData>) => {
    const left = getColumnSortValue(rowA.original, column);
    const right = getColumnSortValue(rowB.original, column);
    return compareDataTableValues(left, right);
  };
}

export function createDataTableGlobalFilterFn<TData>(
  columnsById: ReadonlyMap<string, DataTableColumn<TData>>,
  searchKey?: keyof TData,
): FilterFn<TData> {
  return (row: Row<TData>, columnId: string, filterValue: unknown) => {
    const normalized = String(filterValue ?? "").trim().toLowerCase();
    if (!normalized) return true;
    if (searchKey !== undefined) {
      return String(row.original[searchKey as keyof TData] ?? "")
        .toLowerCase()
        .includes(normalized);
    }
    const column = columnsById.get(columnId);
    if (!column) return false;
    if (column.enableGlobalFilter === false) return false;
    return getColumnSearchText(row.original, column).toLowerCase().includes(normalized);
  };
}

export function toTanStackColumns<TData extends Record<string, unknown>>(
  columns: readonly DataTableColumn<TData>[],
  options?: { readonly enableSorting?: boolean },
): Array<ColumnDef<TData, unknown>> {
  const tableLevelSorting = options?.enableSorting ?? true;
  return columns.map((column, index) => {
    const id = normalizeColumnId(column, index);
    const sortable = tableLevelSorting && isColumnSortable(column);
    const base: ColumnDef<TData, unknown> = {
      id,
      header: (() => resolveColumnHeader(column)) as ColumnDef<TData, unknown>["header"],
      enableSorting: sortable,
      enableGlobalFilter: column.enableGlobalFilter ?? true,
      sortingFn: createDataTableSortingFn(column),
      sortDescFirst: false,
      cell: (({ row }: { row: Row<TData> }) => {
        if (column.cell) {
          try {
            const rendered = column.cell(row.original);
            if (rendered !== undefined) return rendered;
          } catch {
            // fall through to accessor
          }
        }
        const raw = getColumnValue(row.original, column);
        if (raw == null) return "";
        if (typeof raw === "string" || typeof raw === "number") return String(raw);
        return raw as ReactNode;
      }) as ColumnDef<TData, unknown>["cell"],
    };

    if (column.accessorKey != null) {
      return {
        ...base,
        accessorKey: column.accessorKey as string,
      } as ColumnDef<TData, unknown>;
    }
    if (column.accessorFn) {
      const accessorFn = column.accessorFn;
      return {
        ...base,
        accessorFn: (row: TData) => accessorFn(row),
      } as ColumnDef<TData, unknown>;
    }
    if (typeof column.accessor === "string" || typeof column.accessor === "number") {
      return {
        ...base,
        accessorKey: String(column.accessor) as string,
      } as ColumnDef<TData, unknown>;
    }
    if (typeof column.accessor === "function") {
      const legacyFn = column.accessor as (row: TData) => unknown;
      return {
        ...base,
        accessorFn: (row: TData) => legacyFn(row),
      } as ColumnDef<TData, unknown>;
    }
    return {
      ...base,
      accessorFn: (_row: TData) => undefined,
    } as ColumnDef<TData, unknown>;
  });
}
