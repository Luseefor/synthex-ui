import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "../_shared/variants";
import { clampPanelSizes, normalizePanelSizes, } from "./resizable.shared";
export const ResizablePanel = React.forwardRef(({ children, className, defaultSize, minSize = 15, style, ...props }, ref) => {
    const { __direction, __size, ...domProps } = props;
    const size = __size ?? defaultSize ?? 100;
    const isHorizontal = __direction === "horizontal";
    return (_jsx("div", { ...domProps, ref: ref, "data-size": size.toFixed(2), "data-slot": "resizable-panel", className: cn("min-w-0 min-h-0 overflow-hidden", className), style: {
            flexBasis: `${size}%`,
            flexGrow: 0,
            flexShrink: 0,
            minHeight: isHorizontal ? undefined : `${minSize}%`,
            minWidth: isHorizontal ? `${minSize}%` : undefined,
            ...style,
        }, children: children }));
});
ResizablePanel.displayName = "ResizablePanel";
export const ResizableHandle = React.forwardRef(({ className, onMouseDown, style, withHandle = true, ...props }, ref) => {
    const { __direction, __index, __onResize, ...buttonProps } = props;
    const isHorizontal = __direction === "horizontal";
    return (_jsxs("button", { ...buttonProps, ref: ref, type: "button", "aria-label": "Resize panels", "aria-orientation": isHorizontal ? "vertical" : "horizontal", "data-slot": "resizable-handle", className: cn("group relative shrink-0 border-0 bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sx-color-background)]", isHorizontal ? "w-3 cursor-col-resize" : "h-3 cursor-row-resize", className), onMouseDown: (event) => {
            __onResize?.(__index ?? 0, event);
            onMouseDown?.(event);
        }, style: style, children: [_jsx("span", { "aria-hidden": "true", className: cn("absolute rounded-full bg-[color:var(--sx-color-border-strong)] transition-colors duration-[var(--sx-motion-fast)] group-hover:bg-[color:var(--sx-color-primary)]", isHorizontal
                    ? "left-1/2 top-1/2 h-12 w-1 -translate-x-1/2 -translate-y-1/2"
                    : "left-1/2 top-1/2 h-1 w-12 -translate-x-1/2 -translate-y-1/2") }), withHandle ? (_jsx("span", { "aria-hidden": "true", className: cn("absolute rounded-full border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface-raised)]", isHorizontal
                    ? "left-1/2 top-1/2 h-10 w-1.5 -translate-x-1/2 -translate-y-1/2"
                    : "left-1/2 top-1/2 h-1.5 w-10 -translate-x-1/2 -translate-y-1/2") })) : null] }));
});
ResizableHandle.displayName = "ResizableHandle";
export const ResizablePanelGroup = React.forwardRef(({ children, className, direction, style, ...props }, ref) => {
    const containerRef = React.useRef(null);
    const childArray = React.Children.toArray(children).filter(React.isValidElement);
    const panels = childArray.filter((child) => child.type === ResizablePanel);
    const panelMetrics = panels.map((panel) => ({
        defaultSize: panel.props.defaultSize,
        minSize: panel.props.minSize ?? 15,
    }));
    const [sizes, setSizes] = React.useState(() => normalizePanelSizes(panelMetrics));
    React.useEffect(() => {
        setSizes((current) => current.length === panelMetrics.length ? current : normalizePanelSizes(panelMetrics));
    }, [panelMetrics.length]);
    const isHorizontal = direction === "horizontal";
    const handleResize = React.useCallback((index, event) => {
        const container = containerRef.current;
        if (!container) {
            return;
        }
        const total = isHorizontal ? container.clientWidth : container.clientHeight;
        if (!total) {
            return;
        }
        const start = isHorizontal ? event.clientX : event.clientY;
        const initialSizes = [...sizes];
        const onMove = (moveEvent) => {
            const current = isHorizontal ? moveEvent.clientX : moveEvent.clientY;
            const delta = ((current - start) / total) * 100;
            setSizes(clampPanelSizes(initialSizes, index, delta, panelMetrics));
        };
        const onUp = () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
    }, [isHorizontal, panelMetrics, sizes]);
    let panelIndex = 0;
    let handleIndex = 0;
    return (_jsx("div", { ...props, ref: (node) => {
            containerRef.current = node;
            if (typeof ref === "function") {
                ref(node);
            }
            else if (ref) {
                ref.current = node;
            }
        }, "data-testid": "resizable-group", "data-slot": "resizable-panel-group", className: cn("flex min-h-[12rem] min-w-0 overflow-hidden rounded-[var(--sx-radius-lg)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)]", isHorizontal ? "flex-row" : "flex-col", className), style: style, children: childArray.map((child) => {
            if (child.type === ResizablePanel) {
                const next = React.cloneElement(child, {
                    __direction: direction,
                    __size: sizes[panelIndex],
                });
                panelIndex += 1;
                return next;
            }
            if (child.type === ResizableHandle) {
                const next = React.cloneElement(child, {
                    __direction: direction,
                    __index: handleIndex,
                    __onResize: handleResize,
                });
                handleIndex += 1;
                return next;
            }
            return child;
        }) }));
});
ResizablePanelGroup.displayName = "ResizablePanelGroup";
