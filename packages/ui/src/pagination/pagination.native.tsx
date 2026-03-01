import * as React from "react";
import {
  Pressable,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons/index.native";
import { useTheme } from "../_shared/theme/context";
import type { PaginationLinkSharedProps } from "./pagination.shared";

export interface PaginationProps extends Omit<ViewProps, "style"> {
  readonly style?: StyleProp<ViewStyle>;
}

export const Pagination = React.forwardRef<React.ElementRef<typeof View>, PaginationProps>(
  ({ style, ...props }, ref) => (
    <View ref={ref} accessible style={[{ width: "100%" }, style]} {...props} />
  ),
);

Pagination.displayName = "Pagination";

export const PaginationContent = React.forwardRef<
  React.ElementRef<typeof View>,
  PaginationProps
>(({ style, ...props }, ref) => (
  <View
    ref={ref}
    style={[{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }, style]}
    {...props}
  />
));

PaginationContent.displayName = "PaginationContent";

export const PaginationItem = React.forwardRef<React.ElementRef<typeof View>, PaginationProps>(
  ({ style, ...props }, ref) => <View ref={ref} style={style} {...props} />,
);

PaginationItem.displayName = "PaginationItem";

export interface PaginationLinkProps
  extends Omit<PressableProps, "style">,
    PaginationLinkSharedProps {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly textStyle?: StyleProp<TextStyle>;
}

export const PaginationLink = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  PaginationLinkProps
>(({ children, isActive, style, textStyle, ...props }, ref) => {
  const theme = useTheme();

  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      style={({ pressed }) => [
        {
          minWidth: 40,
          height: 40,
          paddingHorizontal: 12,
          borderRadius: theme.radius.md,
          borderWidth: 1,
          borderColor: isActive ? theme.colors.primary : theme.colors.border,
          backgroundColor: isActive ? theme.colors.primary : theme.colors.surface,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 8,
          opacity: pressed ? 0.94 : 1,
        },
        style,
      ]}
      {...props}
    >
      {typeof children === "string" || typeof children === "number" ? (
        <Text
          style={[
            {
              color: isActive ? theme.colors.foregroundOnBrand : theme.colors.foreground,
              fontFamily: theme.typography.family.sans,
              fontSize: theme.typography.size.sm,
              fontWeight: theme.typography.weight.medium,
            },
            textStyle,
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
});

PaginationLink.displayName = "PaginationLink";

export const PaginationPrevious = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  PaginationLinkProps
>(({ children = "Previous", ...props }, ref) => (
  <PaginationLink ref={ref} {...props}>
    <ChevronLeftIcon size={16} />
    <PaginationLabel>{children}</PaginationLabel>
  </PaginationLink>
));

PaginationPrevious.displayName = "PaginationPrevious";

export const PaginationNext = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  PaginationLinkProps
>(({ children = "Next", ...props }, ref) => (
  <PaginationLink ref={ref} {...props}>
    <PaginationLabel>{children}</PaginationLabel>
    <ChevronRightIcon size={16} />
  </PaginationLink>
));

PaginationNext.displayName = "PaginationNext";

export function PaginationEllipsis({ style, ...props }: Omit<TextProps, "style"> & { readonly style?: StyleProp<TextStyle> }) {
  const theme = useTheme();

  return (
    <Text
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          minWidth: 40,
          textAlign: "center",
          color: theme.colors.foregroundMuted,
          fontFamily: theme.typography.family.sans,
          fontSize: theme.typography.size.sm,
        },
        style,
      ]}
      {...props}
    >
      ...
    </Text>
  );
}

function PaginationLabel({ children }: { readonly children: React.ReactNode }) {
  const theme = useTheme();

  return (
    <Text
      style={{
        color: theme.colors.foreground,
        fontFamily: theme.typography.family.sans,
        fontSize: theme.typography.size.sm,
        fontWeight: theme.typography.weight.medium,
      }}
    >
      {children}
    </Text>
  );
}
