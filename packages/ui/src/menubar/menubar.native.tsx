import * as React from "react";
import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { useTheme } from "../_shared/theme/context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  type DropdownMenuContentProps,
  type DropdownMenuItemProps,
  type DropdownMenuLabelProps,
  type DropdownMenuProps,
  type DropdownMenuSeparatorProps,
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

export function MenubarMenu(props: DropdownMenuProps) {
  return <DropdownMenu {...props} />;
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
