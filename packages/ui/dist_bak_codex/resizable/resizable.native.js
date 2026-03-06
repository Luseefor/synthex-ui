import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { Pressable, View } from "react-native";
import { useTheme } from "../_shared/theme/context";
import { normalizePanelSizes, } from "./resizable.shared";
export const ResizablePanel = React.forwardRef(({ children, defaultSize, minSize = 15, style, ...props }, ref) => {
    const { __direction, __size, ...viewProps } = props;
    const theme = useTheme();
    const size = __size ?? defaultSize ?? 100;
    return (_jsx(View, { ...viewProps, ref: ref, style: [
            {
                flexGrow: size,
                flexShrink: 1,
                minHeight: __direction === "vertical" ? `${minSize}%` : undefined,
                minWidth: __direction === "horizontal" ? `${minSize}%` : undefined,
                overflow: "hidden",
                backgroundColor: theme.colors.surfaceRaised,
            },
            style,
        ], children: children }));
});
ResizablePanel.displayName = "ResizablePanel";
export const ResizableHandle = React.forwardRef(({ style, withHandle = true, ...props }, ref) => {
    const theme = useTheme();
    const handleStyle = {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
        minHeight: 12,
        minWidth: 12,
    };
    return (_jsx(Pressable, { ref: ref, accessibilityRole: "adjustable", ...props, style: typeof style === "function" ? style : [handleStyle, style], children: withHandle ? (_jsx(View, { style: {
                backgroundColor: theme.colors.borderStrong,
                borderRadius: 999,
                height: 4,
                width: 40,
            } })) : null }));
});
ResizableHandle.displayName = "ResizableHandle";
export const ResizablePanelGroup = React.forwardRef(({ children, direction, style, ...props }, ref) => {
    const theme = useTheme();
    const childArray = React.Children.toArray(children).filter(React.isValidElement);
    const panels = childArray.filter((child) => child.type === ResizablePanel);
    const sizes = normalizePanelSizes(panels.map((panel) => ({
        defaultSize: panel.props.defaultSize,
        minSize: panel.props.minSize ?? 15,
    })));
    let panelIndex = 0;
    return (_jsx(View, { ...props, ref: ref, style: [
            {
                flexDirection: direction === "horizontal" ? "row" : "column",
                overflow: "hidden",
                borderRadius: theme.radius.lg,
                borderWidth: 1,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
                minHeight: 192,
            },
            style,
        ], children: childArray.map((child) => {
            if (child.type === ResizablePanel) {
                const next = React.cloneElement(child, {
                    __direction: direction,
                    __size: sizes[panelIndex],
                });
                panelIndex += 1;
                return next;
            }
            return child;
        }) }));
});
ResizablePanelGroup.displayName = "ResizablePanelGroup";
