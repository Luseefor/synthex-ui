import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { ScrollView, Text, View, } from "react-native";
import { useTheme } from "../_shared/theme/context";
function renderCellContent(children, textStyle) {
    if (typeof children === "string" || typeof children === "number") {
        return _jsx(Text, { style: textStyle, children: children });
    }
    return children;
}
export const Table = React.forwardRef(({ children, horizontal = true, style, ...props }, ref) => (_jsx(ScrollView, { ref: ref, horizontal: horizontal, style: style, ...props, children: _jsx(View, { children: children }) })));
Table.displayName = "Table";
export const TableHeader = React.forwardRef(({ style, ...props }, ref) => _jsx(View, { ref: ref, style: style, ...props }));
TableHeader.displayName = "TableHeader";
export const TableBody = React.forwardRef(({ style, ...props }, ref) => _jsx(View, { ref: ref, style: style, ...props }));
TableBody.displayName = "TableBody";
export const TableFooter = React.forwardRef(({ style, ...props }, ref) => {
    const theme = useTheme();
    return (_jsx(View, { ref: ref, style: [
            {
                backgroundColor: theme.colors.surfaceMuted,
            },
            style,
        ], ...props }));
});
TableFooter.displayName = "TableFooter";
export const TableRow = React.forwardRef(({ style, ...props }, ref) => {
    const theme = useTheme();
    return (_jsx(View, { ref: ref, style: [
            {
                flexDirection: "row",
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border,
            },
            style,
        ], ...props }));
});
TableRow.displayName = "TableRow";
export const TableHead = React.forwardRef(({ children, style, ...props }, ref) => {
    const theme = useTheme();
    return (_jsx(View, { ref: ref, style: [{ minWidth: 140, paddingHorizontal: 16, paddingVertical: 12 }, style], ...props, children: renderCellContent(children, {
            color: theme.colors.foregroundMuted,
            fontFamily: theme.typography.family.sans,
            fontSize: theme.typography.size.xs,
            fontWeight: theme.typography.weight.semibold,
            textTransform: "uppercase",
            letterSpacing: 0.8,
        }) }));
});
TableHead.displayName = "TableHead";
export const TableCell = React.forwardRef(({ children, style, ...props }, ref) => {
    const theme = useTheme();
    return (_jsx(View, { ref: ref, style: [{ minWidth: 140, paddingHorizontal: 16, paddingVertical: 12 }, style], ...props, children: renderCellContent(children, {
            color: theme.colors.foreground,
            fontFamily: theme.typography.family.sans,
            fontSize: theme.typography.size.sm,
        }) }));
});
TableCell.displayName = "TableCell";
export const TableCaption = React.forwardRef(({ style, ...props }, ref) => {
    const theme = useTheme();
    return (_jsx(Text, { ref: ref, style: [
            {
                marginTop: 12,
                color: theme.colors.foregroundMuted,
                fontFamily: theme.typography.family.sans,
                fontSize: theme.typography.size.sm,
            },
            style,
        ], ...props }));
});
TableCaption.displayName = "TableCaption";
