import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { Pressable, View } from "react-native";
import { CollapsibleProvider, useCollapsibleContext, useCollapsibleController, } from "./collapsible.shared";
export function Collapsible({ children, defaultOpen, disabled, onOpenChange, open, style, ...props }) {
    const controller = useCollapsibleController({ defaultOpen, disabled, onOpenChange, open });
    return (_jsx(CollapsibleProvider, { value: controller, children: _jsx(View, { style: style, ...props, children: children }) }));
}
export const CollapsibleTrigger = React.forwardRef(({ children, onPress, style, ...props }, ref) => {
    const context = useCollapsibleContext();
    return (_jsx(Pressable, { ref: ref, accessibilityRole: "button", accessibilityState: { disabled: context.disabled, expanded: context.open }, disabled: context.disabled, onPress: (event) => {
            onPress?.(event);
            if (!event.defaultPrevented && !context.disabled) {
                context.setOpen(!context.open);
            }
        }, style: style, ...props, children: children }));
});
CollapsibleTrigger.displayName = "CollapsibleTrigger";
export const CollapsibleContent = React.forwardRef(({ children, style, ...props }, ref) => {
    const context = useCollapsibleContext();
    if (!context.open) {
        return null;
    }
    return _jsx(View, { ref: ref, style: style, ...props, children: children });
});
CollapsibleContent.displayName = "CollapsibleContent";
