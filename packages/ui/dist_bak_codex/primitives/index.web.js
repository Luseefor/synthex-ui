import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { useTheme } from "../_shared/theme/context";
import { createBoxStyle, createSurfaceStyle, createTextStyle, resolveSpace, } from "./shared";
export const Box = React.forwardRef(({ as: Component = "div", style, align, background, basis, border, direction, foreground, gap, grow, height, justify, margin, maxHeight, maxWidth, minHeight, minWidth, padding, paddingX, paddingY, radius, shadow, shrink, width, wrap, ...domProps }, ref) => {
    const theme = useTheme();
    const boxStyle = createBoxStyle(theme, {
        align,
        background,
        basis,
        border,
        direction,
        foreground,
        gap,
        grow,
        height,
        justify,
        margin,
        maxHeight,
        maxWidth,
        minHeight,
        minWidth,
        padding,
        paddingX,
        paddingY,
        radius,
        shadow,
        shrink,
        width,
        wrap,
    });
    return React.createElement(Component, {
        ...domProps,
        ref,
        style: { ...boxStyle, ...style },
    });
});
Box.displayName = "Box";
export const Text = React.forwardRef(({ as: Component = "span", style, align, mono, size, tone, weight, ...domProps }, ref) => {
    const theme = useTheme();
    const textStyle = createTextStyle(theme, {
        align,
        mono,
        size,
        tone,
        weight,
    });
    return React.createElement(Component, {
        ...domProps,
        ref,
        style: { ...textStyle, ...style },
    });
});
Text.displayName = "Text";
export const Stack = React.forwardRef((props, ref) => (_jsx(Box, { ref: ref, direction: "column", ...props })));
Stack.displayName = "Stack";
export const Inline = React.forwardRef((props, ref) => (_jsx(Box, { ref: ref, direction: "row", ...props })));
Inline.displayName = "Inline";
export const Grid = React.forwardRef(({ columns = 3, minItemWidth, style, align, background, basis, border, foreground, gap, grow, height, justify, margin, maxHeight, maxWidth, minHeight, minWidth, padding, paddingX, paddingY, radius, shadow, shrink, width, ...domProps }, ref) => {
    const theme = useTheme();
    const boxStyle = createBoxStyle(theme, {
        align,
        background,
        basis,
        border,
        foreground,
        gap,
        grow,
        height,
        justify,
        margin,
        maxHeight,
        maxWidth,
        minHeight,
        minWidth,
        padding,
        paddingX,
        paddingY,
        radius,
        shadow,
        shrink,
        width,
    });
    return (_jsx("div", { ...domProps, ref: ref, style: {
            ...boxStyle,
            display: "grid",
            gridTemplateColumns: minItemWidth
                ? `repeat(auto-fit, minmax(${String(minItemWidth)}, 1fr))`
                : `repeat(${columns}, minmax(0, 1fr))`,
            ...style,
        } }));
});
Grid.displayName = "Grid";
export const Surface = React.forwardRef(({ style, align, background, basis, border, direction, foreground, gap, grow, height, justify, margin, maxHeight, maxWidth, minHeight, minWidth, padding, paddingX, paddingY, radius, shadow, shrink, tone, width, wrap, ...domProps }, ref) => {
    const theme = useTheme();
    const surfaceStyle = createSurfaceStyle(theme, {
        align,
        background,
        basis,
        border,
        direction,
        foreground,
        gap,
        grow,
        height,
        justify,
        margin,
        maxHeight,
        maxWidth,
        minHeight,
        minWidth,
        padding,
        paddingX,
        paddingY,
        radius,
        shadow,
        shrink,
        tone,
        width,
        wrap,
    });
    return _jsx("div", { ...domProps, ref: ref, style: { ...surfaceStyle, ...style } });
});
Surface.displayName = "Surface";
export const PressablePrimitive = React.forwardRef(({ style, type = "button", align, background, basis, border, direction, foreground, gap, grow, height, justify, margin, maxHeight, maxWidth, minHeight, minWidth, padding, paddingX, paddingY, radius, shadow, shrink, width, wrap, ...domProps }, ref) => {
    const theme = useTheme();
    const pressableStyle = createBoxStyle(theme, {
        align,
        background,
        basis,
        border,
        direction,
        foreground,
        gap,
        grow,
        height,
        justify,
        margin,
        maxHeight,
        maxWidth,
        minHeight,
        minWidth,
        padding,
        paddingX,
        paddingY,
        radius,
        shadow,
        shrink,
        width,
        wrap,
    });
    return (_jsx("button", { ...domProps, ref: ref, type: type, style: {
            ...pressableStyle,
            cursor: domProps.disabled ? "not-allowed" : "pointer",
            fontFamily: theme.typography.family.sans,
            backgroundColor: pressableStyle.backgroundColor ?? "transparent",
            color: pressableStyle.color ?? theme.colors.foreground,
            transition: `transform var(--sx-motion-fast) var(--sx-easing-standard), box-shadow var(--sx-motion-fast) var(--sx-easing-standard)`,
            ...style,
        } }));
});
PressablePrimitive.displayName = "PressablePrimitive";
export const ScrollArea = React.forwardRef(({ children, scrollbar = "visible", style, viewportStyle, contentStyle, align, background, basis, border, foreground, gap, grow, height, justify, margin, maxHeight, maxWidth, minHeight, minWidth, padding, paddingX, paddingY, radius, shadow, shrink, width, ...domProps }, ref) => {
    const theme = useTheme();
    const shellStyle = createBoxStyle(theme, {
        align,
        background,
        basis,
        border,
        foreground,
        gap,
        grow,
        height,
        justify,
        margin,
        maxHeight,
        maxWidth,
        minHeight,
        minWidth,
        padding,
        paddingX,
        paddingY,
        radius,
        shadow,
        shrink,
        width,
    });
    const contentBoxStyle = createBoxStyle(theme, {
        align,
        foreground,
        gap,
        justify,
        padding,
        paddingX,
        paddingY,
    });
    return (_jsx("div", { ...domProps, ref: ref, style: {
            ...shellStyle,
            overflow: "hidden",
            ...style,
        }, children: _jsx("div", { style: {
                width: "100%",
                height: "100%",
                minHeight: 0,
                minWidth: 0,
                overflow: "auto",
                scrollbarWidth: scrollbar === "hidden" ? "none" : undefined,
                scrollbarGutter: scrollbar === "hidden" ? undefined : "stable both-edges",
                overscrollBehavior: "contain",
                ...viewportStyle,
            }, children: _jsx("div", { style: {
                    ...contentBoxStyle,
                    minHeight: "100%",
                    minWidth: "100%",
                    boxSizing: "border-box",
                    ...contentStyle,
                }, children: children }) }) }));
});
ScrollArea.displayName = "ScrollArea";
export function useResolvedGap(gap) {
    const theme = useTheme();
    return resolveSpace(theme, gap);
}
