import * as React from "react";
import {
  Pressable,
  Text,
  type GestureResponderEvent,
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
import type { OverlayPositionProps } from "../_shared/positioning";
import {
  NativeOverlayContent,
  NativeOverlayProvider,
  useNativeOverlayTriggerRef,
} from "../_shared/overlay.native";
import {
  SelectProvider,
  useSelectContext,
  useSelectController,
  type SelectItemSharedProps,
  type SelectSharedProps,
} from "./select.shared";

const NativeSelectDisabledContext = React.createContext(false);

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
    <NativeOverlayProvider dir={dir}>
      <SelectProvider value={controller}>
        <NativeSelectDisabledContext.Provider value={!!disabled}>
        {/* testID mirrors web `data-slot="select"` for parity. */}
        <View testID={testID ?? "select"} style={[dir ? { direction: dir } : null, style]} {...props}>
          {children}
        </View>
        </NativeSelectDisabledContext.Provider>
      </SelectProvider>
    </NativeOverlayProvider>
  );
}

export interface SelectTriggerProps extends Omit<PressableProps, "style"> {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly asChild?: boolean;
}

export const SelectTrigger: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<SelectTriggerProps> & React.RefAttributes<React.ElementRef<typeof Pressable>>
> = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  SelectTriggerProps
>(({ children, onPress, style, asChild, testID, disabled, accessibilityState, ...props }, ref) => {
  const context = useSelectContext();
  const rootDisabled = React.useContext(NativeSelectDisabledContext);
  const theme = useTheme();

  type AsChildProps = {
    readonly onPress?: ((event: GestureResponderEvent) => void) | null;
    readonly disabled?: boolean;
    readonly accessibilityState?: PressableProps["accessibilityState"];
    readonly testID?: string;
    readonly style?: PressableProps["style"];
    readonly accessibilityRole?: PressableProps["accessibilityRole"];
    readonly [key: string]: unknown;
  };

  const childElement =
    asChild && React.isValidElement<AsChildProps>(children) ? children : null;
  const childRef = (
    childElement?.props as { readonly ref?: React.Ref<React.ElementRef<typeof View>> } | undefined
  )?.ref;
  const mergedRef = useNativeOverlayTriggerRef(
    ref as React.Ref<React.ElementRef<typeof View>>,
    childRef,
  );

  if (childElement) {
    const childProps = childElement.props as AsChildProps;
    const childDisabled = childProps.disabled === true;
    const isDisabled = !!rootDisabled || !!disabled || childDisabled;
    const childOnPress = childProps.onPress;
    const childAccessibilityState = childProps.accessibilityState;
    const childTestID = childProps.testID;
    const childStyle = childProps.style as PressableProps["style"] | undefined;
    const childRole = childProps.accessibilityRole;
    const resolvedStyle = (() => {
      if (style == null) return childStyle;
      if (childStyle == null) return style;
      if (typeof childStyle === "function") {
        return (state: { pressed: boolean }) => [style, childStyle(state)];
      }
      return [style, childStyle];
    })();
    return React.cloneElement(childElement, {
      ref: mergedRef,
      testID: childTestID ?? testID ?? "select-trigger",
      disabled: isDisabled,
      collapsable: false,
      accessibilityRole: childRole ?? "button",
      ...props,
      accessibilityState: {
        ...childAccessibilityState,
        ...accessibilityState,
        expanded: context.open,
        disabled: isDisabled,
      },
      style: resolvedStyle,
      onPress: (event: GestureResponderEvent) => {
        if (isDisabled) return;
        childOnPress?.(event);
        if (event.defaultPrevented) return;
        onPress?.(event);
        if (event.defaultPrevented) return;
        context.setOpen(!context.open);
      },
    });
  }

  const isDisabled = !!rootDisabled || !!disabled;

  return (
    <Pressable
      ref={mergedRef as React.Ref<React.ElementRef<typeof Pressable>>}
      collapsable={false}
      testID={testID ?? "select-trigger"}
      accessibilityRole="button"
      accessibilityState={{ ...accessibilityState, expanded: context.open, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={(event) => {
        if (isDisabled) return;
        onPress?.(event);
        if (event.defaultPrevented) return;
        context.setOpen(!context.open);
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

export const SelectValue: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<SelectValueProps> & React.RefAttributes<React.ElementRef<typeof Text>>
> = React.forwardRef<React.ElementRef<typeof Text>, SelectValueProps>(
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

export interface SelectContentProps extends Omit<ViewProps, "style">, OverlayPositionProps {
  readonly style?: StyleProp<ViewStyle>;
  readonly position?: "item-aligned" | "popper";
}

export const SelectContent: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<SelectContentProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<
  React.ElementRef<typeof View>,
  SelectContentProps
>(({ style, position, side, align, sideOffset, alignOffset, testID, ...props }, ref) => {
  void position;
  const context = useSelectContext();
  const theme = useTheme();

  return (
    <NativeOverlayContent
      ref={ref}
      open={context.open}
      onDismiss={() => context.setOpen(false)}
      testID={testID ?? "select-content"}
      side={side}
      align={align}
      sideOffset={sideOffset}
      alignOffset={alignOffset}
      style={[
        {
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

export const SelectItem: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<SelectItemProps> & React.RefAttributes<React.ElementRef<typeof Pressable>>
> = React.forwardRef<React.ElementRef<typeof Pressable>, SelectItemProps>(
  ({ children, onPress, style, textStyle, textValue, testID, value, disabled, accessibilityState, ...props }, ref) => {
    const context = useSelectContext();
    const rootDisabled = React.useContext(NativeSelectDisabledContext);
    const isDisabled = rootDisabled || !!disabled;
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
        accessibilityState={{ ...accessibilityState, selected: active, disabled: isDisabled }}
        disabled={isDisabled}
        onPress={(event) => {
          if (isDisabled) return;
          onPress?.(event);
          if (event.defaultPrevented) return;
          context.setValue(value);
          context.setOpen(false);
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

export const SelectGroup: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<SelectGroupProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<React.ElementRef<typeof View>, SelectGroupProps>(
  ({ style, testID, ...props }, ref) => (
    <View ref={ref} testID={testID ?? "select-group"} style={style} {...props} />
  ),
);

SelectGroup.displayName = "SelectGroup";

export interface SelectLabelProps extends Omit<TextProps, "style"> {
  readonly style?: StyleProp<TextStyle>;
}

export const SelectLabel: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<SelectLabelProps> & React.RefAttributes<React.ElementRef<typeof Text>>
> = React.forwardRef<React.ElementRef<typeof Text>, SelectLabelProps>(
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

export const SelectSeparator: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<SelectSeparatorProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<
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

export const SelectScrollUpButton: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<SelectScrollButtonProps> & React.RefAttributes<React.ElementRef<typeof Pressable>>
> = React.forwardRef<
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

export const SelectScrollDownButton: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<SelectScrollButtonProps> & React.RefAttributes<React.ElementRef<typeof Pressable>>
> = React.forwardRef<
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

export const SelectArrow: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<SelectArrowProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<React.ElementRef<typeof View>, SelectArrowProps>(
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
