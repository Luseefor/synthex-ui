import type { DataTableSharedProps } from "./data-table.shared";
export interface DataTableProps<TData> extends DataTableSharedProps<TData> {
}
export declare function DataTable<TData extends Record<string, unknown>>({ columns, data, pageSize, searchKey, searchPlaceholder, }: DataTableProps<TData>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=data-table.native.d.ts.map