import * as React from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import { CheckIcon, ChevronDownIcon, SearchIcon } from "../icons/index.native";
import { renderNativeInlineText } from "../_shared/native-text";
import { useTheme } from "../_shared/theme/context";
import type { OverlayPositionProps } from "../_shared/positioning";
import {
  NativeOverlayContent,
  NativeOverlayProvider,
  useNativeOverlayTriggerRef,
} from "../_shared/overlay.native";
import {
  ComboboxProvider,
  matchesComboboxQuery,
  useComboboxContext,
  useComboboxController,
  type ComboboxItemSharedProps,
  type ComboboxSharedProps,
} from "./combobox.shared";

export interface ComboboxProps
  extends Omit<ViewProps, "style">,
    ComboboxSharedProps {
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

export function Combobox({
  children,
  defaultOpen,
  defaultQuery,
  defaultValue,
  filter,
  label,
  loop,
  onOpenChange,
  onQueryChange,
  onValueChange,
  open,
  placeholder,
  query,
  shouldFilter,
  style,
  testID,
  value,
  ...props
}: ComboboxProps) {
  const controller = useComboboxController({
    defaultOpen,
    defaultQuery,
    defaultValue,
    filter,
    label,
    loop,
    onOpenChange,
    onQueryChange,
    onValueChange,
    open,
    placeholder,
    query,
    shouldFilter,
    value,
  });

  // testID mirrors web data-slot="combobox" for parity.
  return (
    <NativeOverlayProvider>
      <ComboboxProvider value={controller}>
        <View testID={testID ?? "combobox"} style={style} {...props}>
          {children}
        </View>
      </ComboboxProvider>
    </NativeOverlayProvider>
  );
}

export interface ComboboxTriggerProps extends Omit<PressableProps, "style"> {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

export const ComboboxTrigger: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<ComboboxTriggerProps> & React.RefAttributes<React.ElementRef<typeof Pressable>>
> = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  ComboboxTriggerProps
>(({ children, onPress, style, testID, disabled, accessibilityState, ...props }, ref) => {
  const context = useComboboxContext();
  const theme = useTheme();
  const mergedRef = useNativeOverlayTriggerRef(
    ref as React.Ref<React.ElementRef<typeof View>>,
  );
  const isDisabled = !!disabled;

  return (
    <Pressable
      ref={mergedRef as React.Ref<React.ElementRef<typeof Pressable>>}
      collapsable={false}
      testID={testID ?? "combobox-trigger"}
      accessibilityRole="button"
      accessibilityState={{ ...accessibilityState, expanded: context.open, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={(event: GestureResponderEvent) => {
        if (isDisabled) return;
        onPress?.(event);
        if (event.defaultPrevented) return;
        context.setOpen(!context.open);
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
      <View style={{ flex: 1 }}>{renderNativeInlineText(children, {
        color: theme.colors.foreground,
        fontFamily: theme.typography.family.sans,
        fontSize: theme.typography.size.sm,
      })}</View>
      <View style={{ transform: [{ rotate: context.open ? "180deg" : "0deg" }] }}>
        <ChevronDownIcon size={16} />
      </View>
    </Pressable>
  );
});

ComboboxTrigger.displayName = "ComboboxTrigger";

export interface ComboboxValueProps {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<TextStyle>;
  readonly testID?: string;
}

export const ComboboxValue: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<ComboboxValueProps> & React.RefAttributes<React.ElementRef<typeof Text>>
> = React.forwardRef<React.ElementRef<typeof Text>, ComboboxValueProps>(
  ({ children, style, testID }, ref) => {
    const context = useComboboxContext();
    const theme = useTheme();
    const selectedLabel = context.getLabel(context.value);
    void context.labelVersion;

    return (
      <Text
        ref={ref}
        testID={testID ?? "combobox-value"}
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
      >
        {typeof children === "string" || typeof children === "number"
          ? children
          : selectedLabel ?? context.placeholder ?? "Select an option"}
      </Text>
    );
  },
);

ComboboxValue.displayName = "ComboboxValue";

export interface ComboboxContentProps extends Omit<ViewProps, "style">, OverlayPositionProps {
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

export const ComboboxContent: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<ComboboxContentProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<
  React.ElementRef<typeof View>,
  ComboboxContentProps
>(({ style, testID, side, align, sideOffset, alignOffset, ...props }, ref) => {
  const context = useComboboxContext();
  const theme = useTheme();

  return (
    <NativeOverlayContent
      ref={ref}
      open={context.open}
      onDismiss={() => context.setOpen(false)}
      testID={testID ?? "combobox-content"}
      side={side}
      align={align}
      sideOffset={sideOffset}
      alignOffset={alignOffset}
      style={[
        {
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg + 2,
          backgroundColor: theme.colors.surface,
        },
        style,
      ]}
      {...props}
    />
  );
});

ComboboxContent.displayName = "ComboboxContent";

export interface ComboboxInputProps extends Omit<TextInputProps, "defaultValue" | "onChange" | "value"> {
  readonly style?: StyleProp<TextStyle>;
  readonly testID?: string;
}

export const ComboboxInput: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<ComboboxInputProps> & React.RefAttributes<React.ElementRef<typeof TextInput>>
> = React.forwardRef<
  React.ElementRef<typeof TextInput>,
  ComboboxInputProps
>(({ onChangeText, placeholder = "Search options", style, testID, ...props }, ref) => {
  const context = useComboboxContext();
  const theme = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        paddingHorizontal: 14,
        paddingVertical: 12,
      }}
    >
      <SearchIcon size={15} color={theme.colors.foregroundMuted} />
      <TextInput
        ref={ref}
        testID={testID ?? "combobox-input"}
        value={context.query}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.foregroundMuted}
        style={[
          {
            flex: 1,
            color: theme.colors.foreground,
            fontFamily: theme.typography.family.sans,
            fontSize: theme.typography.size.sm,
          },
          style,
        ]}
        onChangeText={(nextValue) => {
          context.setQuery(nextValue);
          onChangeText?.(nextValue);
        }}
        {...props}
      />
    </View>
  );
});

ComboboxInput.displayName = "ComboboxInput";

export interface ComboboxListProps extends Omit<ViewProps, "style"> {
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

export const ComboboxList: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<ComboboxListProps> & React.RefAttributes<React.ElementRef<typeof ScrollView>>
> = React.forwardRef<React.ElementRef<typeof ScrollView>, ComboboxListProps>(
  ({ children, style, testID, ...props }, ref) => (
    <ScrollView
      ref={ref}
      testID={testID ?? "combobox-list"}
      style={[{ maxHeight: 256 }, style]}
      contentContainerStyle={{ padding: 8 }}
      {...props}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled
    >
      {children}
    </ScrollView>
  ),
);

ComboboxList.displayName = "ComboboxList";

export interface ComboboxEmptyProps extends Omit<ViewProps, "style"> {
  readonly style?: StyleProp<ViewStyle>;
  readonly textStyle?: StyleProp<TextStyle>;
  readonly testID?: string;
}

export const ComboboxEmpty: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<ComboboxEmptyProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<React.ElementRef<typeof View>, ComboboxEmptyProps>(
  ({ children = "No results found.", style, textStyle, testID, ...props }, ref) => {
    const context = useComboboxContext();
    const theme = useTheme();

    if (context.visibleItemCount > 0) {
      return null;
    }

    return (
      <View ref={ref} testID={testID ?? "combobox-empty"} style={[{ paddingHorizontal: 12, paddingVertical: 32 }, style]} {...props}>
        <Text
          style={[
            {
              textAlign: "center",
              color: theme.colors.foregroundMuted,
              fontFamily: theme.typography.family.sans,
              fontSize: theme.typography.size.sm,
            },
            textStyle,
          ]}
        >
          {children}
        </Text>
      </View>
    );
  },
);

ComboboxEmpty.displayName = "ComboboxEmpty";

export interface ComboboxItemProps
  extends Omit<PressableProps, "style">,
    ComboboxItemSharedProps {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly textStyle?: StyleProp<TextStyle>;
  readonly testID?: string;
}

export const ComboboxItem: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<ComboboxItemProps> & React.RefAttributes<React.ElementRef<typeof Pressable>>
> = React.forwardRef<React.ElementRef<typeof Pressable>, ComboboxItemProps>(
  ({ children, keywords, onPress, style, textStyle, textValue, testID, value, disabled, accessibilityState, ...props }, ref) => {
    const context = useComboboxContext();
    const theme = useTheme();
    const itemId = React.useId();
    const isDisabled = !!disabled;
    const label =
      textValue ??
      (typeof children === "string" || typeof children === "number" ? String(children) : value);
    const visible = matchesComboboxQuery(context.query, label, keywords);
    const active = context.value === value;

    React.useEffect(() => {
      context.registerItem(value, label);
    }, [context, label, value]);

    React.useEffect(() => {
      context.setItemVisibility(itemId, visible);
      return () => context.unregisterItem(itemId);
    }, [context, itemId, visible]);

    if (!visible) {
      return null;
    }

    return (
      <Pressable
        ref={ref}
        testID={testID ?? "combobox-item"}
        accessibilityRole="button"
        accessibilityState={{ ...accessibilityState, selected: active, disabled: isDisabled }}
        disabled={isDisabled}
        onPress={(event: GestureResponderEvent) => {
          if (isDisabled) return;
          onPress?.(event);
          if (event.defaultPrevented) return;
          context.setValue(value);
          context.setQuery("");
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
        {renderNativeInlineText(children, [
          {
            color: active ? theme.colors.primary : theme.colors.foreground,
            fontFamily: theme.typography.family.sans,
            fontSize: theme.typography.size.sm,
          },
          textStyle,
        ])}
        {active ? <CheckIcon size={14} strokeWidth={2.4} /> : null}
      </Pressable>
    );
  },
);

ComboboxItem.displayName = "ComboboxItem";
