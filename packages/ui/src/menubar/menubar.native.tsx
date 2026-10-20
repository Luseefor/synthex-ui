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
}

export const Menubar = React.forwardRef<React.ElementRef<typeof View>, MenubarProps>(
  ({ style, ...props }, ref) => {
    const theme = useTheme();

    return (
      <View
        ref={ref}
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

export function MenubarMenu({ children, defaultOpen, onOpenChange, open, ...props }: DropdownMenuProps) {
  return (
    <DropdownMenu defaultOpen={defaultOpen} onOpenChange={onOpenChange} open={open} {...props}>
      {children}
    </DropdownMenu>
  );
}

export const MenubarTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuTrigger>,
  DropdownMenuTriggerProps
>(({ style, ...props }, ref) => {
  const theme = useTheme();

  return (
    <DropdownMenuTrigger
      ref={ref}
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
  DropdownMenuContentProps
>(({ style, ...props }, ref) => (
  <DropdownMenuContent ref={ref} style={[{ minWidth: 208 }, style]} {...props} />
));

MenubarContent.displayName = "MenubarContent";

export const MenubarItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuItem>,
  DropdownMenuItemProps
>(({ style, ...props }, ref) => <DropdownMenuItem ref={ref} style={style} {...props} />);

MenubarItem.displayName = "MenubarItem";

export const MenubarLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuLabel>,
  DropdownMenuLabelProps
>(({ style, ...props }, ref) => <DropdownMenuLabel ref={ref} style={style} {...props} />);

MenubarLabel.displayName = "MenubarLabel";

export const MenubarSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuSeparator>,
  DropdownMenuSeparatorProps
>(({ style, ...props }, ref) => (
  <DropdownMenuSeparator ref={ref} style={style} {...props} />
));

MenubarSeparator.displayName = "MenubarSeparator";

export type MenubarSubProps = BaseMenuSubProps;
export function MenubarSub(props: MenubarSubProps) {
  return <BaseMenuSub {...props} />;
}

export type MenubarSubTriggerProps = BaseMenuSubTriggerProps;
export const MenubarSubTrigger = React.forwardRef<
  React.ElementRef<typeof BaseMenuSubTrigger>,
  MenubarSubTriggerProps
>((props, ref) => <BaseMenuSubTrigger ref={ref} {...props} />);
MenubarSubTrigger.displayName = "MenubarSubTrigger";

export type MenubarSubContentProps = BaseMenuSubContentProps;
export const MenubarSubContent = React.forwardRef<
  React.ElementRef<typeof BaseMenuSubContent>,
  MenubarSubContentProps
>((props, ref) => <BaseMenuSubContent ref={ref} {...props} />);
MenubarSubContent.displayName = "MenubarSubContent";

export type MenubarCheckboxItemProps = BaseMenuCheckboxItemProps;
export const MenubarCheckboxItem = React.forwardRef<
  React.ElementRef<typeof BaseMenuCheckboxItem>,
  MenubarCheckboxItemProps
>((props, ref) => <BaseMenuCheckboxItem ref={ref} {...props} />);
MenubarCheckboxItem.displayName = "MenubarCheckboxItem";

export type MenubarRadioGroupProps = BaseMenuRadioGroupProps;
export function MenubarRadioGroup(props: MenubarRadioGroupProps) {
  return <BaseMenuRadioGroup {...props} />;
}

export type MenubarRadioItemProps = BaseMenuRadioItemProps;
export const MenubarRadioItem = React.forwardRef<
  React.ElementRef<typeof BaseMenuRadioItem>,
  MenubarRadioItemProps
>((props, ref) => <BaseMenuRadioItem ref={ref} {...props} />);
MenubarRadioItem.displayName = "MenubarRadioItem";

export type MenubarShortcutProps = BaseMenuShortcutProps;
export const MenubarShortcut = React.forwardRef<
  React.ElementRef<typeof BaseMenuShortcut>,
  MenubarShortcutProps
>((props, ref) => <BaseMenuShortcut ref={ref} {...props} />);
MenubarShortcut.displayName = "MenubarShortcut";

export type MenubarArrowProps = BaseMenuArrowProps;
export const MenubarArrow = React.forwardRef<
  React.ElementRef<typeof BaseMenuArrow>,
  MenubarArrowProps
>((props, ref) => <BaseMenuArrow ref={ref} {...props} />);
MenubarArrow.displayName = "MenubarArrow";
