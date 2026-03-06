import * as React from "react";
import type { DataTableSharedProps } from "./data-table.shared";
export interface DataTableProps<TData> extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">, DataTableSharedProps<TData> {
}
export declare function DataTable<TData extends Record<string, unknown>>({ className, columns, data, pageSize, searchKey, searchPlaceholder, ...props }: DataTableProps<TData>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=data-table.web.d.ts.map