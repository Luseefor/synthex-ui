import * as React from "react";
import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { useTheme } from "../_shared/theme/context";
import {
  DropdownMenu,
  DropdownMenuArrow as BaseMenuArrow,
  DropdownMenuCheckboxItem as BaseMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup as BaseMenuRadioGroup,
  DropdownMenuRadioItem as BaseMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut as BaseMenuShortcut,
  DropdownMenuSub as BaseMenuSub,
  DropdownMenuSubContent as BaseMenuSubContent,
  DropdownMenuSubTrigger as BaseMenuSubTrigger,
  DropdownMenuTrigger,
  type DropdownMenuArrowProps as BaseMenuArrowProps,
  type DropdownMenuCheckboxItemProps as BaseMenuCheckboxItemProps,
  type DropdownMenuContentProps,
  type DropdownMenuItemProps,
  type DropdownMenuLabelProps,
  type DropdownMenuProps,
  type DropdownMenuRadioGroupProps as BaseMenuRadioGroupProps,
  type DropdownMenuRadioItemProps as BaseMenuRadioItemProps,
  type DropdownMenuSeparatorProps,
  type DropdownMenuShortcutProps as BaseMenuShortcutProps,
  type DropdownMenuSubContentProps as BaseMenuSubContentProps,
  type DropdownMenuSubProps as BaseMenuSubProps,
  type DropdownMenuSubTriggerProps as BaseMenuSubTriggerProps,
  type DropdownMenuTriggerProps,
} from "../dropdown-menu/dropdown-menu.native";

export interface MenubarProps extends Omit<ViewProps, "style"> {
  readonly style?: StyleProp<ViewStyle>;
  readonly value?: string;
  readonly defaultValue?: string;
  readonly onValueChange?: (value: string) => void;
  readonly dir?: "ltr" | "rtl";
  readonly testID?: string;
}

export const Menubar = React.forwardRef<React.ElementRef<typeof View>, MenubarProps>(
  ({ style, value, defaultValue, onValueChange, dir, testID, ...props }, ref) => {
    // Accepted for web parity (Radix Menubar Root); ignored native (row layout).
    void value;
    void defaultValue;
    void onValueChange;
    void dir;
    const theme = useTheme();

    return (
      <View
        ref={ref}
        testID={testID ?? "menubar"}
        style={[
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
        ]}
        {...props}
      />
    );
  },
);

Menubar.displayName = "Menubar";

export function MenubarMenu({ children, defaultOpen, onOpenChange, open, value, testID, ...props }: DropdownMenuProps & { readonly value?: string; readonly testID?: string }) {
  // `value` is web-only (Radix Menubar.Menu); accepted for parity, ignored native.
  void value;
  return (
    <DropdownMenu defaultOpen={defaultOpen} onOpenChange={onOpenChange} open={open} testID={testID ?? "menubar-menu"} {...props}>
      {children}
    </DropdownMenu>
  );
}

export const MenubarTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuTrigger>,
  DropdownMenuTriggerProps & { readonly testID?: string }
>(({ style, testID, ...props }, ref) => {
  const theme = useTheme();

  return (
    <DropdownMenuTrigger
      ref={ref}
      testID={testID ?? "menubar-trigger"}
      style={[
        {
          minWidth: 96,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: theme.radius.md,
          paddingHorizontal: 12,
          paddingVertical: 10,
        },
        style,
      ]}
      {...props}
    />
  );
});

MenubarTrigger.displayName = "MenubarTrigger";

export const MenubarContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuContent>,
  DropdownMenuContentProps & { readonly testID?: string }
>(({ style, testID, ...props }, ref) => (
  <DropdownMenuContent ref={ref} testID={testID ?? "menubar-content"} style={[{ minWidth: 208 }, style]} {...props} />
));

MenubarContent.displayName = "MenubarContent";

export const MenubarItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuItem>,
  DropdownMenuItemProps & { readonly testID?: string }
>(({ style, testID, ...props }, ref) => <DropdownMenuItem ref={ref} testID={testID ?? "menubar-item"} style={style} {...props} />);

MenubarItem.displayName = "MenubarItem";

export const MenubarLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuLabel>,
  DropdownMenuLabelProps & { readonly testID?: string }
>(({ style, testID, ...props }, ref) => <DropdownMenuLabel ref={ref} testID={testID ?? "menubar-label"} style={style} {...props} />);

MenubarLabel.displayName = "MenubarLabel";

export const MenubarSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuSeparator>,
  DropdownMenuSeparatorProps & { readonly testID?: string }
>(({ style, testID, ...props }, ref) => (
  <DropdownMenuSeparator ref={ref} testID={testID ?? "menubar-separator"} style={style} {...props} />
));

MenubarSeparator.displayName = "MenubarSeparator";

export type MenubarSubProps = BaseMenuSubProps & { readonly testID?: string };
export function MenubarSub({ testID, ...props }: MenubarSubProps) {
  return <BaseMenuSub testID={testID ?? "menubar-sub"} {...props} />;
}

export type MenubarSubTriggerProps = BaseMenuSubTriggerProps & { readonly testID?: string };
export const MenubarSubTrigger = React.forwardRef<
  React.ElementRef<typeof BaseMenuSubTrigger>,
  MenubarSubTriggerProps
>(({ testID, ...props }, ref) => <BaseMenuSubTrigger ref={ref} testID={testID ?? "menubar-sub-trigger"} {...props} />);
MenubarSubTrigger.displayName = "MenubarSubTrigger";

export type MenubarSubContentProps = BaseMenuSubContentProps & { readonly testID?: string };
export const MenubarSubContent = React.forwardRef<
  React.ElementRef<typeof BaseMenuSubContent>,
  MenubarSubContentProps
>(({ testID, ...props }, ref) => <BaseMenuSubContent ref={ref} testID={testID ?? "menubar-sub-content"} {...props} />);
MenubarSubContent.displayName = "MenubarSubContent";

export type MenubarCheckboxItemProps = BaseMenuCheckboxItemProps & { readonly testID?: string };
export const MenubarCheckboxItem = React.forwardRef<
  React.ElementRef<typeof BaseMenuCheckboxItem>,
  MenubarCheckboxItemProps
>(({ testID, ...props }, ref) => <BaseMenuCheckboxItem ref={ref} testID={testID ?? "menubar-checkbox-item"} {...props} />);
MenubarCheckboxItem.displayName = "MenubarCheckboxItem";

export type MenubarRadioGroupProps = BaseMenuRadioGroupProps & { readonly testID?: string };
export function MenubarRadioGroup({ testID, ...props }: MenubarRadioGroupProps) {
  return <BaseMenuRadioGroup testID={testID ?? "menubar-radio-group"} {...props} />;
}

export type MenubarRadioItemProps = BaseMenuRadioItemProps & { readonly testID?: string };
export const MenubarRadioItem = React.forwardRef<
  React.ElementRef<typeof BaseMenuRadioItem>,
  MenubarRadioItemProps
>(({ testID, ...props }, ref) => <BaseMenuRadioItem ref={ref} testID={testID ?? "menubar-radio-item"} {...props} />);
MenubarRadioItem.displayName = "MenubarRadioItem";

export type MenubarShortcutProps = BaseMenuShortcutProps & { readonly testID?: string };
export const MenubarShortcut = React.forwardRef<
  React.ElementRef<typeof BaseMenuShortcut>,
  MenubarShortcutProps
>(({ testID, ...props }, ref) => <BaseMenuShortcut ref={ref} testID={testID ?? "menubar-shortcut"} {...props} />);
MenubarShortcut.displayName = "MenubarShortcut";

export type MenubarArrowProps = BaseMenuArrowProps & { readonly testID?: string };
export const MenubarArrow = React.forwardRef<
  React.ElementRef<typeof BaseMenuArrow>,
  MenubarArrowProps
>(({ testID, ...props }, ref) => <BaseMenuArrow ref={ref} testID={testID ?? "menubar-arrow"} {...props} />);
MenubarArrow.displayName = "MenubarArrow";
