import * as React from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type PressableProps,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import { CheckIcon, ChevronDownIcon, SearchIcon } from "../icons/index.native";
import { useTheme } from "../_shared/theme/context";
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
    <ComboboxProvider value={controller}>
      <View testID={testID ?? "combobox"} style={style} {...props}>
        {children}
      </View>
    </ComboboxProvider>
  );
}

export interface ComboboxTriggerProps extends Omit<PressableProps, "style"> {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

export const ComboboxTrigger = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  ComboboxTriggerProps
>(({ children, onPress, style, testID, ...props }, ref) => {
  const context = useComboboxContext();
  const theme = useTheme();

  return (
    <Pressable
      ref={ref}
      testID={testID ?? "combobox-trigger"}
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

ComboboxTrigger.displayName = "ComboboxTrigger";

export interface ComboboxValueProps {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<TextStyle>;
  readonly testID?: string;
}

export const ComboboxValue = React.forwardRef<React.ElementRef<typeof Text>, ComboboxValueProps>(
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

export interface ComboboxContentProps extends Omit<ViewProps, "style"> {
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

export const ComboboxContent = React.forwardRef<
  React.ElementRef<typeof View>,
  ComboboxContentProps
>(({ style, testID, ...props }, ref) => {
  const context = useComboboxContext();
  const theme = useTheme();

  if (!context.open) {
    return null;
  }

  return (
    <View
      ref={ref}
      testID={testID ?? "combobox-content"}
      style={[
        {
          marginTop: 8,
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

export const ComboboxInput = React.forwardRef<
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

export const ComboboxList = React.forwardRef<React.ElementRef<typeof ScrollView>, ComboboxListProps>(
  ({ children, style, testID, ...props }, ref) => (
    <ScrollView
      ref={ref}
      testID={testID ?? "combobox-list"}
      style={[{ maxHeight: 256 }, style]}
      contentContainerStyle={{ padding: 8 }}
      {...props}
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

export const ComboboxEmpty = React.forwardRef<React.ElementRef<typeof View>, ComboboxEmptyProps>(
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

export const ComboboxItem = React.forwardRef<React.ElementRef<typeof Pressable>, ComboboxItemProps>(
  ({ children, keywords, onPress, style, textStyle, textValue, testID, value, ...props }, ref) => {
    const context = useComboboxContext();
    const theme = useTheme();
    const itemId = React.useId();
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
        accessibilityState={{ selected: active }}
        onPress={(event) => {
          context.setValue(value);
          context.setQuery("");
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

ComboboxItem.displayName = "ComboboxItem";
