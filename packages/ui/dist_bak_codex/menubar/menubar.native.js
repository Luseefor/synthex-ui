import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { View } from "react-native";
import { useTheme } from "../_shared/theme/context";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "../dropdown-menu/dropdown-menu.native";
export const Menubar = React.forwardRef(({ style, ...props }, ref) => {
    const theme = useTheme();
    return (_jsx(View, { ref: ref, style: [
            {
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                padding: 4,
                borderRadius: theme.radius.lg + 2,
                borderWidth: 1,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.backgroundSubtle,
            },
            style,
        ], ...props }));
});
Menubar.displayName = "Menubar";
export function MenubarMenu(props) {
    return _jsx(DropdownMenu, { ...props });
}
export const MenubarTrigger = React.forwardRef(({ style, ...props }, ref) => {
    const theme = useTheme();
    return (_jsx(DropdownMenuTrigger, { ref: ref, style: [
            {
                minWidth: 96,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: theme.radius.md,
                paddingHorizontal: 12,
                paddingVertical: 10,
            },
            style,
        ], ...props }));
});
MenubarTrigger.displayName = "MenubarTrigger";
export const MenubarContent = React.forwardRef(({ style, ...props }, ref) => (_jsx(DropdownMenuContent, { ref: ref, style: [{ minWidth: 208 }, style], ...props })));
MenubarContent.displayName = "MenubarContent";
export const MenubarItem = React.forwardRef(({ style, ...props }, ref) => _jsx(DropdownMenuItem, { ref: ref, style: style, ...props }));
MenubarItem.displayName = "MenubarItem";
export const MenubarLabel = React.forwardRef(({ style, ...props }, ref) => _jsx(DropdownMenuLabel, { ref: ref, style: style, ...props }));
MenubarLabel.displayName = "MenubarLabel";
export const MenubarSeparator = React.forwardRef(({ style, ...props }, ref) => (_jsx(DropdownMenuSeparator, { ref: ref, style: style, ...props })));
MenubarSeparator.displayName = "MenubarSeparator";
