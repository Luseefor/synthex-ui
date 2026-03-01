import * as React from "react";
import {
  Pressable,
  Text,
  type TextProps,
  View,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import { CheckIcon, ChevronDownIcon } from "../icons/index.native";
import { useTheme } from "../_shared/theme/context";
import {
  SelectProvider,
  useSelectContext,
  useSelectController,
  type SelectItemSharedProps,
  type SelectSharedProps,
} from "./select.shared";

export interface SelectProps
  extends Omit<ViewProps, "style">,
    SelectSharedProps {
  readonly style?: StyleProp<ViewStyle>;
}

export function Select({
  children,
  defaultOpen,
  defaultValue,
  onOpenChange,
  onValueChange,
  open,
  placeholder,
  style,
  value,
  ...props
}: SelectProps) {
  const controller = useSelectController({
    defaultOpen,
    defaultValue,
    onOpenChange,
    onValueChange,
    open,
    placeholder,
    value,
  });

  return (
    <SelectProvider value={controller}>
      <View style={style} {...props}>
        {children}
      </View>
    </SelectProvider>
  );
}

export interface SelectTriggerProps extends Omit<PressableProps, "style"> {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
}

export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  SelectTriggerProps
>(({ children, onPress, style, ...props }, ref) => {
  const context = useSelectContext();
  const theme = useTheme();

  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityState={{ expanded: context.open }}
      onPress={(event) => {
        context.setOpen(!context.open);
        onPress?.(event);
      }}
      style={({ pressed }) => [
        {
          minHeight: 40,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors.surfaceRaised,
          paddingHorizontal: 14,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          opacity: pressed ? 0.94 : 1,
        },
        style,
      ]}
      {...props}
    >
      <View style={{ flex: 1 }}>{children}</View>
      <View style={{ transform: [{ rotate: context.open ? "180deg" : "0deg" }] }}>
        <ChevronDownIcon size={16} />
      </View>
    </Pressable>
  );
});

SelectTrigger.displayName = "SelectTrigger";

export interface SelectValueProps extends Omit<TextProps, "style"> {
  readonly style?: StyleProp<TextStyle>;
}

export const SelectValue = React.forwardRef<React.ElementRef<typeof Text>, SelectValueProps>(
  ({ children, style, ...props }, ref) => {
    const context = useSelectContext();
    const theme = useTheme();
    const selectedLabel = context.getLabel(context.value);
    void context.labelVersion;

    return (
      <Text
        ref={ref}
        numberOfLines={1}
        style={[
          {
            color:
              selectedLabel || children
                ? theme.colors.foreground
                : theme.colors.foregroundMuted,
            fontFamily: theme.typography.family.sans,
            fontSize: theme.typography.size.sm,
          },
          style,
        ]}
        {...props}
      >
        {typeof children === "string" || typeof children === "number"
          ? children
          : selectedLabel ?? context.placeholder ?? "Select an option"}
      </Text>
    );
  },
);

SelectValue.displayName = "SelectValue";

export interface SelectContentProps extends Omit<ViewProps, "style"> {
  readonly style?: StyleProp<ViewStyle>;
}

export const SelectContent = React.forwardRef<
  React.ElementRef<typeof View>,
  SelectContentProps
>(({ style, ...props }, ref) => {
  const context = useSelectContext();
  const theme = useTheme();

  if (!context.open) {
    return null;
  }

  return (
    <View
      ref={ref}
      style={[
        {
          marginTop: 8,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
          backgroundColor: theme.colors.surface,
          padding: 6,
          gap: 4,
        },
        style,
      ]}
      {...props}
    />
  );
});

SelectContent.displayName = "SelectContent";

export interface SelectItemProps
  extends Omit<PressableProps, "style">,
    SelectItemSharedProps {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly textStyle?: StyleProp<TextStyle>;
}

export const SelectItem = React.forwardRef<React.ElementRef<typeof Pressable>, SelectItemProps>(
  ({ children, onPress, style, textStyle, textValue, value, ...props }, ref) => {
    const context = useSelectContext();
    const theme = useTheme();
    const active = context.value === value;
    const label =
      textValue ??
      (typeof children === "string" || typeof children === "number" ? String(children) : value);

    React.useEffect(() => {
      context.registerItem(value, label);
    }, [context, label, value]);

    return (
      <Pressable
        ref={ref}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        onPress={(event) => {
          context.setValue(value);
          context.setOpen(false);
          onPress?.(event);
        }}
        style={({ pressed }) => [
          {
            minHeight: 40,
            borderRadius: theme.radius.md,
            paddingHorizontal: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            backgroundColor: active ? theme.colors.primaryMuted : theme.colors.surface,
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
                color: active ? theme.colors.primary : theme.colors.foreground,
                fontFamily: theme.typography.family.sans,
                fontSize: theme.typography.size.sm,
              },
              textStyle,
            ]}
          >
            {children}
          </Text>
        ) : (
          children
        )}
        {active ? <CheckIcon size={14} strokeWidth={2.4} /> : null}
      </Pressable>
    );
  },
);

SelectItem.displayName = "SelectItem";
