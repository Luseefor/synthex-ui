import * as React from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  type PressableProps,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
  View,
} from "react-native";
import { SearchIcon } from "../icons/index.native";
import { useTheme } from "../_shared/theme/context";
import {
  CommandProvider,
  matchesCommandQuery,
  resolveCommandSearch,
  useCommandContext,
  useCommandController,
  type CommandItemSharedProps,
  type CommandSharedProps,
} from "./command.shared";

export interface CommandProps
  extends Omit<ViewProps, "style">,
    CommandSharedProps {
  readonly style?: StyleProp<ViewStyle>;
}

export function Command({
  children,
  defaultQuery,
  defaultValue,
  label: _label,
  filter: _filter,
  loop: _loop,
  onQueryChange,
  onValueChange,
  query,
  value,
  shouldFilter,
  style,
  ...props
}: CommandProps) {
  void _label;
  void _filter;
  void _loop;
  const theme = useTheme();
  const resolved = resolveCommandSearch({
    defaultQuery,
    defaultValue,
    onQueryChange,
    onValueChange,
    query,
    value,
  });
  const controller = useCommandController({
    defaultQuery: resolved.defaultQuery,
    onQueryChange: resolved.onQueryChange,
    query: resolved.query,
    shouldFilter,
  });

  return (
    <CommandProvider value={controller}>
      <View
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
      >
        {children}
      </View>
    </CommandProvider>
  );
}

export interface CommandInputProps extends Omit<TextInputProps, "defaultValue" | "onChange" | "value"> {
  readonly style?: StyleProp<TextStyle>;
}

export const CommandInput: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<CommandInputProps> & React.RefAttributes<React.ElementRef<typeof TextInput>>
> = React.forwardRef<React.ElementRef<typeof TextInput>, CommandInputProps>(
  ({ onChangeText, placeholder = "Search commands", style, ...props }, ref) => {
    const context = useCommandContext();
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
  },
);

CommandInput.displayName = "CommandInput";

export interface CommandListProps extends Omit<ViewProps, "style"> {
  readonly style?: StyleProp<ViewStyle>;
}

export const CommandList: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<CommandListProps> & React.RefAttributes<React.ElementRef<typeof ScrollView>>
> = React.forwardRef<React.ElementRef<typeof ScrollView>, CommandListProps>(
  ({ children, style, ...props }, ref) => (
    <ScrollView
      ref={ref}
      style={[{ maxHeight: 288 }, style]}
      contentContainerStyle={{ padding: 8 }}
      {...props}
    >
      {children}
    </ScrollView>
  ),
);

CommandList.displayName = "CommandList";

export interface CommandEmptyProps extends Omit<ViewProps, "style"> {
  readonly style?: StyleProp<ViewStyle>;
  readonly textStyle?: StyleProp<TextStyle>;
}

export const CommandEmpty: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<CommandEmptyProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<React.ElementRef<typeof View>, CommandEmptyProps>(
  ({ children = "No results found.", style, textStyle, ...props }, ref) => {
    const context = useCommandContext();
    const theme = useTheme();

    if (context.visibleItemCount > 0) {
      return null;
    }

    return (
      <View ref={ref} style={[{ paddingHorizontal: 12, paddingVertical: 32 }, style]} {...props}>
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

CommandEmpty.displayName = "CommandEmpty";

export interface CommandGroupProps extends Omit<ViewProps, "style"> {
  readonly heading?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly headingStyle?: StyleProp<TextStyle>;
}

export const CommandGroup: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<CommandGroupProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<React.ElementRef<typeof View>, CommandGroupProps>(
  ({ children, heading, headingStyle, style, ...props }, ref) => {
    const theme = useTheme();

    return (
      <View ref={ref} style={[{ paddingVertical: 4, gap: 4 }, style]} {...props}>
        {heading ? (
          <Text
            style={[
              {
                paddingHorizontal: 8,
                paddingVertical: 4,
                color: theme.colors.foregroundMuted,
                fontFamily: theme.typography.family.sans,
                fontSize: 11,
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: 1.2,
              },
              headingStyle,
            ]}
          >
            {heading}
          </Text>
        ) : null}
        <View style={{ gap: 4 }}>{children}</View>
      </View>
    );
  },
);

CommandGroup.displayName = "CommandGroup";

export interface CommandItemProps
  extends Omit<PressableProps, "style">,
    CommandItemSharedProps {
  readonly children?: React.ReactNode;
  readonly onCommandSelect?: (value: string) => void;
  readonly style?: StyleProp<ViewStyle>;
  readonly textStyle?: StyleProp<TextStyle>;
}

export const CommandItem: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<CommandItemProps> & React.RefAttributes<React.ElementRef<typeof Pressable>>
> = React.forwardRef<React.ElementRef<typeof Pressable>, CommandItemProps>(
  ({ children, keywords, onCommandSelect, onPress, style, textStyle, textValue, value, ...props }, ref) => {
    const context = useCommandContext();
    const theme = useTheme();
    const itemId = React.useId();
    const searchValue =
      textValue ??
      (typeof children === "string" || typeof children === "number" ? String(children) : value) ??
      "";
    const itemValue = value ?? searchValue;
    const visible = matchesCommandQuery(context.query, searchValue, keywords);

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
        accessibilityRole="button"
        onPress={(event) => {
          onCommandSelect?.(itemValue);
          onPress?.(event);
        }}
        style={({ pressed }) => [
          {
            minHeight: 40,
            borderRadius: theme.radius.md,
            justifyContent: "center",
            paddingHorizontal: 12,
            paddingVertical: 10,
            backgroundColor: pressed ? theme.colors.surfaceMuted : "transparent",
          },
          style,
        ]}
        {...props}
      >
        {typeof children === "string" || typeof children === "number" ? (
          <Text
            style={[
              {
                color: theme.colors.foreground,
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
      </Pressable>
    );
  },
);

CommandItem.displayName = "CommandItem";
