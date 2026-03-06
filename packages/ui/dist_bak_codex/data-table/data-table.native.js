import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useTheme } from "../_shared/theme/context";
export function DataTable({ columns, data, pageSize = 5, searchKey, searchPlaceholder = "Filter rows", }) {
    const theme = useTheme();
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
    return (_jsxs(View, { style: { gap: 16 }, children: [_jsxs(View, { style: { gap: 12 }, children: [_jsx(TextInput, { accessibilityLabel: "Filter table rows", onChangeText: setQuery, placeholder: searchPlaceholder, placeholderTextColor: theme.colors.foregroundMuted, style: {
                            borderWidth: 1,
                            borderColor: theme.colors.border,
                            borderRadius: theme.radius.md,
                            backgroundColor: theme.colors.surface,
                            color: theme.colors.foreground,
                            paddingHorizontal: 14,
                            paddingVertical: 10,
                        }, value: query }), _jsxs(Text, { style: { color: theme.colors.foregroundMuted, fontSize: theme.typography.size.sm }, children: [sortedData.length, " row", sortedData.length === 1 ? "" : "s"] })] }), _jsx(ScrollView, { horizontal: true, style: {
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    borderRadius: theme.radius.lg,
                    backgroundColor: theme.colors.surface,
                }, children: _jsxs(View, { style: { minWidth: 560 }, children: [_jsx(View, { style: {
                                flexDirection: "row",
                                borderBottomWidth: 1,
                                borderBottomColor: theme.colors.border,
                            }, children: columns.map((column) => {
                                const activeDirection = sort?.columnId === column.id ? sort.direction : null;
                                return (_jsx(Pressable, { onPress: () => setSort((current) => {
                                        if (!current || current.columnId !== column.id) {
                                            return { columnId: column.id, direction: "asc" };
                                        }
                                        return {
                                            columnId: column.id,
                                            direction: current.direction === "asc" ? "desc" : "asc",
                                        };
                                    }), style: {
                                        flex: 1,
                                        paddingHorizontal: 16,
                                        paddingVertical: 14,
                                    }, children: _jsxs(Text, { style: {
                                            color: theme.colors.foregroundMuted,
                                            fontSize: theme.typography.size.xs,
                                            fontWeight: theme.typography.weight.semibold,
                                            textAlign: resolveNativeAlignment(column.align),
                                            textTransform: "uppercase",
                                        }, children: [String(column.header), " ", activeDirection === "asc" ? "▲" : activeDirection === "desc" ? "▼" : ""] }) }, column.id));
                            }) }), pageData.length > 0 ? (pageData.map((row, rowIndex) => (_jsx(View, { style: {
                                flexDirection: "row",
                                borderBottomWidth: rowIndex === pageData.length - 1 ? 0 : 1,
                                borderBottomColor: theme.colors.border,
                            }, children: columns.map((column) => (_jsx(View, { style: { flex: 1, paddingHorizontal: 16, paddingVertical: 14 }, children: _jsx(Text, { style: {
                                        color: theme.colors.foreground,
                                        fontSize: theme.typography.size.sm,
                                        textAlign: resolveNativeAlignment(column.align),
                                    }, children: String(column.cell ? column.cell(row) : resolveCellValue(row, column)) }) }, column.id))) }, rowIndex)))) : (_jsx(View, { style: { padding: 24 }, children: _jsx(Text, { style: { color: theme.colors.foregroundMuted, textAlign: "center" }, children: "No rows match the current filter." }) }))] }) }), _jsxs(View, { style: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, children: [_jsxs(Text, { style: { color: theme.colors.foregroundMuted, fontSize: theme.typography.size.sm }, children: ["Page ", currentPage + 1, " of ", totalPages] }), _jsxs(View, { style: { flexDirection: "row", gap: 8 }, children: [_jsx(Pressable, { disabled: currentPage === 0, onPress: () => setPage((value) => Math.max(0, value - 1)), style: {
                                    borderWidth: 1,
                                    borderColor: theme.colors.border,
                                    borderRadius: theme.radius.md,
                                    opacity: currentPage === 0 ? 0.45 : 1,
                                    paddingHorizontal: 14,
                                    paddingVertical: 10,
                                }, children: _jsx(Text, { style: { color: theme.colors.foreground }, children: "Previous" }) }), _jsx(Pressable, { disabled: currentPage >= totalPages - 1, onPress: () => setPage((value) => Math.min(totalPages - 1, value + 1)), style: {
                                    borderWidth: 1,
                                    borderColor: theme.colors.border,
                                    borderRadius: theme.radius.md,
                                    opacity: currentPage >= totalPages - 1 ? 0.45 : 1,
                                    paddingHorizontal: 14,
                                    paddingVertical: 10,
                                }, children: _jsx(Text, { style: { color: theme.colors.foreground }, children: "Next" }) })] })] })] }));
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
function resolveNativeAlignment(align = "left") {
    return align;
}
