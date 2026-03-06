import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { Input } from "../input/input.web";
import { Button } from "../button/button.web";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "../table/table.web";
import { cn } from "../_shared/variants";
export function DataTable({ className, columns, data, pageSize = 5, searchKey, searchPlaceholder = "Filter rows", ...props }) {
    const [page, setPage] = React.useState(0);
    const [query, setQuery] = React.useState("");
    const [sort, setSort] = React.useState(null);
    const filteredData = React.useMemo(() => {
        if (!query.trim()) {
            return data;
        }
        const normalized = query.trim().toLowerCase();
        return data.filter((row) => {
            if (searchKey) {
                return String(row[searchKey] ?? "")
                    .toLowerCase()
                    .includes(normalized);
            }
            return columns.some((column) => resolveSearchValue(row, column)
                .toLowerCase()
                .includes(normalized));
        });
    }, [columns, data, query, searchKey]);
    const sortedData = React.useMemo(() => {
        if (!sort) {
            return filteredData;
        }
        const column = columns.find((entry) => entry.id === sort.columnId);
        if (!column) {
            return filteredData;
        }
        const directionFactor = sort.direction === "asc" ? 1 : -1;
        return [...filteredData].sort((left, right) => {
            const leftValue = resolveSortValue(left, column);
            const rightValue = resolveSortValue(right, column);
            if (leftValue < rightValue) {
                return -1 * directionFactor;
            }
            if (leftValue > rightValue) {
                return 1 * directionFactor;
            }
            return 0;
        });
    }, [columns, filteredData, sort]);
    const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
    const currentPage = Math.min(page, totalPages - 1);
    const pageData = sortedData.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
    React.useEffect(() => {
        setPage(0);
    }, [query]);
    return (_jsxs("div", { className: cn("flex flex-col gap-4", className), ...props, children: [_jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [_jsx(Input, { "aria-label": "Filter table rows", className: "w-full sm:max-w-xs", onChange: (event) => setQuery(event.target.value), placeholder: searchPlaceholder, value: query }), _jsxs("div", { className: "text-sm text-[color:var(--sx-color-foreground-muted)]", children: [sortedData.length, " row", sortedData.length === 1 ? "" : "s"] })] }), _jsx("div", { className: "rounded-[var(--sx-radius-lg)] border border-[color:var(--sx-color-border)]", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsx(TableRow, { children: columns.map((column) => {
                                    const sortable = column.sortable !== false;
                                    const activeDirection = sort?.columnId === column.id ? sort.direction : null;
                                    return (_jsx(TableHead, { className: resolveAlignmentClass(column.align), children: sortable ? (_jsxs("button", { className: "inline-flex items-center gap-2 text-inherit", onClick: () => {
                                                setSort((current) => {
                                                    if (!current || current.columnId !== column.id) {
                                                        return { columnId: column.id, direction: "asc" };
                                                    }
                                                    return {
                                                        columnId: column.id,
                                                        direction: current.direction === "asc" ? "desc" : "asc",
                                                    };
                                                });
                                            }, type: "button", children: [_jsx("span", { children: column.header }), _jsx("span", { className: "text-[10px] text-[color:var(--sx-color-foreground-muted)]", children: activeDirection === "asc" ? "▲" : activeDirection === "desc" ? "▼" : "↕" })] })) : (column.header) }, column.id));
                                }) }) }), _jsx(TableBody, { children: pageData.length > 0 ? (pageData.map((row, rowIndex) => (_jsx(TableRow, { children: columns.map((column) => (_jsx(TableCell, { className: resolveAlignmentClass(column.align), children: column.cell ? column.cell(row) : resolveCellValue(row, column) }, column.id))) }, rowIndex)))) : (_jsx(TableRow, { children: _jsx(TableCell, { className: "py-10 text-center text-[color:var(--sx-color-foreground-muted)]", colSpan: columns.length, children: "No rows match the current filter." }) })) })] }) }), _jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsxs("div", { className: "text-sm text-[color:var(--sx-color-foreground-muted)]", children: ["Page ", currentPage + 1, " of ", totalPages] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { disabled: currentPage === 0, onClick: () => setPage((value) => Math.max(0, value - 1)), size: "sm", variant: "outline", children: "Previous" }), _jsx(Button, { disabled: currentPage >= totalPages - 1, onClick: () => setPage((value) => Math.min(totalPages - 1, value + 1)), size: "sm", variant: "outline", children: "Next" })] })] })] }));
}
function resolveCellValue(row, column) {
    if (typeof column.accessor === "function") {
        return column.accessor(row);
    }
    return String(row[column.accessor] ?? "");
}
function resolveSearchValue(row, column) {
    if (column.searchValue) {
        return column.searchValue(row);
    }
    return typeof column.accessor === "function"
        ? String(column.accessor(row) ?? "")
        : String(row[column.accessor] ?? "");
}
function resolveSortValue(row, column) {
    const rawValue = typeof column.accessor === "function" ? column.accessor(row) : row[column.accessor];
    if (typeof rawValue === "number") {
        return rawValue;
    }
    return String(rawValue ?? "").toLowerCase();
}
function resolveAlignmentClass(align = "left") {
    if (align === "center") {
        return "text-center";
    }
    if (align === "right") {
        return "text-right";
    }
    return "text-left";
}
