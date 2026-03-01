import * as React from "react";
import {
  Pressable,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../_shared/theme/context";
import {
  TabsProvider,
  useTabsContext,
  useTabsController,
  type TabsContentSharedProps,
  type TabsSharedProps,
  type TabsTriggerSharedProps,
} from "./tabs.shared";

export interface TabsProps extends Omit<ViewProps, "style">, TabsSharedProps {
  readonly style?: StyleProp<ViewStyle>;
}

export function Tabs({
  children,
  defaultValue,
  onValueChange,
  style,
  value,
  ...props
}: TabsProps) {
  const controller = useTabsController({ defaultValue, onValueChange, value });

  return (
    <TabsProvider value={controller}>
      <View
        style={[
          {
            gap: 16,
          },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    </TabsProvider>
  );
}

export interface TabsListProps extends Omit<ViewProps, "style"> {
  readonly style?: StyleProp<ViewStyle>;
}

export const TabsList = React.forwardRef<React.ElementRef<typeof View>, TabsListProps>(
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

TabsList.displayName = "TabsList";

export interface TabsTriggerProps
  extends Omit<PressableProps, "children" | "style">,
    TabsTriggerSharedProps {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly textStyle?: StyleProp<TextStyle>;
}

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  TabsTriggerProps
>(({ children, disabled, style, textStyle, value, ...props }, ref) => {
  const context = useTabsContext();
  const theme = useTheme();
  const isActive = context.value === value;

  const containerStyle: ViewStyle = {
    minWidth: 104,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: isActive ? theme.colors.surface : "transparent",
  };

  const labelStyle: TextStyle = {
    color: isActive ? theme.colors.foreground : theme.colors.foregroundMuted,
    fontFamily: theme.typography.family.sans,
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.medium,
    letterSpacing: -0.2,
  };

  return (
    <Pressable
      ref={ref}
      accessibilityRole="tab"
      accessibilityState={{ disabled: disabled || undefined, selected: isActive }}
      disabled={disabled}
      onPress={() => {
        context.setValue(value);
      }}
      style={({ pressed }) => [
        containerStyle,
        isActive && {
          shadowColor: "#0f172a",
          shadowOpacity: 0.08,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
          elevation: 2,
        },
        pressed && {
          opacity: 0.92,
        },
        disabled && {
          opacity: 0.45,
        },
        style,
      ]}
      {...props}
    >
      {renderTabsText(children, [labelStyle, textStyle])}
    </Pressable>
  );
});

TabsTrigger.displayName = "TabsTrigger";

export interface TabsContentProps extends Omit<ViewProps, "style">, TabsContentSharedProps {
  readonly style?: StyleProp<ViewStyle>;
}

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof View>,
  TabsContentProps
>(({ children, forceMount, style, value, ...props }, ref) => {
  const context = useTabsContext();
  const theme = useTheme();
  const isActive = context.value === value;

  if (!isActive && !forceMount) {
    return null;
  }

  return (
    <View
      ref={ref}
      style={[
        {
          borderRadius: theme.radius.xl,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          padding: 20,
        },
        !isActive && {
          display: "none",
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
});

TabsContent.displayName = "TabsContent";

function renderTabsText(
  children: React.ReactNode,
  textStyle: StyleProp<TextStyle>,
) {
  return React.Children.map(children, (child) => {
    if (typeof child === "string" || typeof child === "number") {
      return <Text style={textStyle}>{child}</Text>;
    }

    return child;
  });
}
