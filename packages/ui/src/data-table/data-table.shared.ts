import type { ReactNode } from "react";

export type DataTableAlign = "left" | "center" | "right";

export interface DataTableColumn<TData> {
  readonly id: string;
  readonly header: ReactNode;
  readonly accessor: keyof TData | ((row: TData) => ReactNode);
  readonly cell?: (row: TData) => ReactNode;
  readonly sortable?: boolean;
  readonly searchValue?: (row: TData) => string;
  readonly align?: DataTableAlign;
}

export interface DataTableSharedProps<TData> {
  readonly columns: readonly DataTableColumn<TData>[];
  readonly data: readonly TData[];
  readonly pageSize?: number;
  readonly searchKey?: keyof TData;
  readonly searchPlaceholder?: string;
}
