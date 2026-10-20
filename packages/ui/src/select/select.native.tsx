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
import { createFieldControlStyle } from "../_shared/field-control.native";
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
  readonly dir?: "ltr" | "rtl";
  readonly disabled?: boolean;
  readonly name?: string;
  readonly required?: boolean;
}

export function Select({
  children,
  defaultOpen,
  defaultValue,
  dir,
  disabled,
  name,
  onOpenChange,
  onValueChange,
  open,
  placeholder,
  required,
  style,
  testID,
  value,
  ...props
}: SelectProps) {
  void dir;
  void disabled;
  void name;
  void required;
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
      {/* testID mirrors web `data-slot="select"` for parity. */}
      <View testID={testID ?? "select"} style={style} {...props}>
        {children}
      </View>
    </SelectProvider>
  );
}

export interface SelectTriggerProps extends Omit<PressableProps, "style"> {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly asChild?: boolean;
}

export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  SelectTriggerProps
>(({ children, onPress, style, asChild, testID, ...props }, ref) => {
  const context = useSelectContext();
  void asChild;
  const theme = useTheme();

  return (
    <Pressable
      ref={ref}
      testID={testID ?? "select-trigger"}
      accessibilityRole="button"
      accessibilityState={{ expanded: context.open }}
      onPress={(event) => {
        context.setOpen(!context.open);
        onPress?.(event);
      }}
      style={({ pressed }) => [
        {
          ...createFieldControlStyle(theme, {}),
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
  readonly placeholder?: string;
}

export const SelectValue = React.forwardRef<React.ElementRef<typeof Text>, SelectValueProps>(
  ({ children, placeholder: valuePlaceholder, style, testID, ...props }, ref) => {
    const context = useSelectContext();
    const theme = useTheme();
    const selectedLabel = context.getLabel(context.value);
    void context.labelVersion;
    const placeholder = valuePlaceholder ?? context.placeholder ?? "Select an option";

    return (
      <Text
        ref={ref}
        testID={testID ?? "select-value"}
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
          : selectedLabel ?? placeholder}
      </Text>
    );
  },
);

SelectValue.displayName = "SelectValue";

export interface SelectContentProps extends Omit<ViewProps, "style"> {
  readonly style?: StyleProp<ViewStyle>;
  readonly position?: "item-aligned" | "popper";
  readonly side?: "top" | "right" | "bottom" | "left";
  readonly align?: "start" | "center" | "end";
  readonly sideOffset?: number;
  readonly alignOffset?: number;
}

export const SelectContent = React.forwardRef<
  React.ElementRef<typeof View>,
  SelectContentProps
>(({ style, position, side, align, sideOffset, alignOffset, testID, ...props }, ref) => {
  void position;
  void side;
  void align;
  void sideOffset;
  void alignOffset;
  const context = useSelectContext();
  const theme = useTheme();

  if (!context.open) {
    return null;
  }

  return (
    <View
      ref={ref}
      testID={testID ?? "select-content"}
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
  ({ children, onPress, style, textStyle, textValue, testID, value, ...props }, ref) => {
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
        testID={testID ?? "select-item"}
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

export interface SelectGroupProps extends Omit<ViewProps, "style"> {
  readonly style?: StyleProp<ViewStyle>;
}

export const SelectGroup = React.forwardRef<React.ElementRef<typeof View>, SelectGroupProps>(
  ({ style, testID, ...props }, ref) => (
    <View ref={ref} testID={testID ?? "select-group"} style={style} {...props} />
  ),
);

SelectGroup.displayName = "SelectGroup";

export interface SelectLabelProps extends Omit<TextProps, "style"> {
  readonly style?: StyleProp<TextStyle>;
}

export const SelectLabel = React.forwardRef<React.ElementRef<typeof Text>, SelectLabelProps>(
  ({ style, testID, ...props }, ref) => {
    const theme = useTheme();

    return (
      <Text
        ref={ref}
        testID={testID ?? "select-label"}
        style={[
          {
            color: theme.colors.foregroundMuted,
            fontFamily: theme.typography.family.sans,
            fontSize: theme.typography.size.xs,
            fontWeight: theme.typography.weight.semibold,
            letterSpacing: 1,
            textTransform: "uppercase",
            paddingHorizontal: 12,
            paddingVertical: 6,
          },
          style,
        ]}
        {...props}
      />
    );
  },
);

SelectLabel.displayName = "SelectLabel";

export interface SelectSeparatorProps extends Omit<ViewProps, "style"> {
  readonly style?: StyleProp<ViewStyle>;
}

export const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof View>,
  SelectSeparatorProps
>(({ style, testID, ...props }, ref) => {
  const theme = useTheme();

  return (
    <View
      ref={ref}
      testID={testID ?? "select-separator"}
      accessibilityRole="none"
      style={[
        {
          height: 1,
          marginVertical: 4,
          backgroundColor: theme.colors.border,
        },
        style,
      ]}
      {...props}
    />
  );
});

SelectSeparator.displayName = "SelectSeparator";

export interface SelectScrollButtonProps extends Omit<PressableProps, "style"> {
  readonly style?: StyleProp<ViewStyle>;
  readonly scrollAmount?: number;
}

export const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  SelectScrollButtonProps
>(({ onPress, style, scrollAmount, testID, ...props }, ref) => {
  void scrollAmount;
  return (
  <Pressable
    ref={ref}
    testID={testID ?? "select-scroll-up-button"}
    accessibilityRole="button"
    accessibilityLabel="Scroll up"
    onPress={onPress}
    style={[{ alignItems: "center", paddingVertical: 4 }, style]}
    {...props}
  >
    <View style={{ transform: [{ rotate: "180deg" }] }}>
      <ChevronDownIcon size={14} />
    </View>
  </Pressable>
  );
});

SelectScrollUpButton.displayName = "SelectScrollUpButton";

export const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  SelectScrollButtonProps
>(({ onPress, style, scrollAmount, testID, ...props }, ref) => {
  void scrollAmount;
  return (
  <Pressable
    ref={ref}
    testID={testID ?? "select-scroll-down-button"}
    accessibilityRole="button"
    accessibilityLabel="Scroll down"
    onPress={onPress}
    style={[{ alignItems: "center", paddingVertical: 4 }, style]}
    {...props}
  >
    <ChevronDownIcon size={14} />
  </Pressable>
  );
});

SelectScrollDownButton.displayName = "SelectScrollDownButton";

export interface SelectArrowProps extends Omit<ViewProps, "style"> {
  readonly style?: StyleProp<ViewStyle>;
}

export const SelectArrow = React.forwardRef<React.ElementRef<typeof View>, SelectArrowProps>(
  ({ style, testID, ...props }, ref) => {
    const theme = useTheme();

    return (
      <View
        ref={ref}
        testID={testID ?? "select-arrow"}
        accessible={false}
        style={[
          {
            alignSelf: "center",
            width: 8,
            height: 8,
            transform: [{ rotate: "45deg" }],
            borderBottomWidth: 1,
            borderRightWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
          },
          style,
        ]}
        {...props}
      />
    );
  },
);

SelectArrow.displayName = "SelectArrow";
