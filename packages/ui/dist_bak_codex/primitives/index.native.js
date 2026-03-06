import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { Pressable, ScrollView, Text as NativeText, View, } from "react-native";
import { useTheme } from "../_shared/theme/context";
import { createBoxStyle, createSurfaceStyle, createTextStyle, resolveSpace, } from "./shared";
export const Box = React.forwardRef(({ style, ...props }, ref) => {
    const theme = useTheme();
    const boxStyle = toNativeViewStyle(createBoxStyle(theme, props));
    return _jsx(View, { ...props, ref: ref, style: [boxStyle, style] });
});
Box.displayName = "Box";
export const Text = React.forwardRef(({ style, ...props }, ref) => {
    const theme = useTheme();
    const textStyle = createTextStyle(theme, props);
    return _jsx(NativeText, { ...props, ref: ref, style: [textStyle, style] });
});
Text.displayName = "Text";
export const Stack = React.forwardRef((props, ref) => (_jsx(Box, { ref: ref, direction: "column", ...props })));
Stack.displayName = "Stack";
export const Inline = React.forwardRef((props, ref) => (_jsx(Box, { ref: ref, direction: "row", ...props })));
Inline.displayName = "Inline";
export const Grid = React.forwardRef(({ children, columns = 2, gap, minItemWidth, style, ...props }, ref) => {
    const theme = useTheme();
    const resolvedGap = resolveSpace(theme, gap) ?? 0;
    const itemWidth = minItemWidth !== undefined
        ? minItemWidth
        : `${100 / columns}%`;
    return (_jsx(View, { ...props, ref: ref, style: [
            {
                flexDirection: "row",
                flexWrap: "wrap",
                gap: resolvedGap,
            },
            style,
        ], children: React.Children.map(children, (child, index) => (_jsx(View, { style: { width: toNativeDimension(itemWidth) }, children: child }, typeof child === "object" && child && "key" in child ? child.key?.toString() ?? index : index))) }));
});
Grid.displayName = "Grid";
export const Surface = React.forwardRef(({ style, ...props }, ref) => {
    const theme = useTheme();
    const surfaceStyle = toNativeViewStyle(createSurfaceStyle(theme, props));
    return _jsx(View, { ...props, ref: ref, style: [surfaceStyle, style] });
});
Surface.displayName = "Surface";
export const PressablePrimitive = React.forwardRef(({ style, ...props }, ref) => {
    const theme = useTheme();
    const pressableStyle = toNativeViewStyle(createBoxStyle(theme, props));
    return (_jsx(Pressable, { ...props, ref: ref, style: ({ pressed }) => [
            pressableStyle,
            {
                opacity: pressed ? 0.92 : 1,
            },
            style,
        ] }));
});
PressablePrimitive.displayName = "PressablePrimitive";
export const ScrollArea = React.forwardRef(({ contentContainerStyle, style, ...props }, ref) => {
    const theme = useTheme();
    const boxStyle = toNativeViewStyle(createBoxStyle(theme, props));
    return (_jsx(ScrollView, { ...props, ref: ref, contentContainerStyle: [boxStyle, contentContainerStyle], style: style }));
});
ScrollArea.displayName = "ScrollArea";
function toNativeDimension(value) {
    if (value === undefined) {
        return undefined;
    }
    if (typeof value === "number" || value === "auto") {
        return value;
    }
    if (value.endsWith("%")) {
        return value;
    }
    return undefined;
}
function toNativeViewStyle(style) {
    return {
        backgroundColor: style.backgroundColor,
        borderColor: style.borderColor,
        borderRadius: style.borderRadius,
        borderStyle: style.borderStyle,
        borderWidth: style.borderWidth,
        display: style.display === "flex" ? "flex" : undefined,
        flexBasis: toNativeDimension(style.flexBasis),
        flexDirection: style.flexDirection,
        flexGrow: style.flexGrow,
        flexShrink: style.flexShrink,
        flexWrap: style.flexWrap,
        gap: style.gap,
        height: toNativeDimension(style.height),
        justifyContent: style.justifyContent,
        margin: style.margin,
        maxHeight: toNativeDimension(style.maxHeight),
        maxWidth: toNativeDimension(style.maxWidth),
        minHeight: toNativeDimension(style.minHeight),
        minWidth: toNativeDimension(style.minWidth),
        padding: style.padding,
        paddingBottom: style.paddingBottom,
        paddingLeft: style.paddingLeft,
        paddingRight: style.paddingRight,
        paddingTop: style.paddingTop,
        width: toNativeDimension(style.width),
        alignItems: style.alignItems,
    };
}
