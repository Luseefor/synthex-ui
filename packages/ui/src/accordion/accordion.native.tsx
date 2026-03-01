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
import { ChevronDownIcon } from "../icons/index.native";
import { useTheme } from "../_shared/theme/context";
import {
  AccordionItemProvider,
  AccordionProvider,
  useAccordionContext,
  useAccordionController,
  useAccordionItemContext,
  type AccordionItemSharedProps,
  type AccordionSharedProps,
} from "./accordion.shared";

export interface AccordionProps
  extends Omit<ViewProps, "style">,
    AccordionSharedProps {
  readonly style?: StyleProp<ViewStyle>;
}

export function Accordion({
  children,
  collapsible,
  defaultValue,
  onValueChange,
  style,
  type,
  value,
  ...props
}: AccordionProps) {
  const controller = useAccordionController({
    collapsible,
    defaultValue,
    onValueChange,
    type,
    value,
  });

  return (
    <AccordionProvider value={controller}>
      <View style={style} {...props}>
        {children}
      </View>
    </AccordionProvider>
  );
}

export interface AccordionItemProps
  extends Omit<ViewProps, "style">,
    AccordionItemSharedProps {
  readonly style?: StyleProp<ViewStyle>;
}

export const AccordionItem = React.forwardRef<React.ElementRef<typeof View>, AccordionItemProps>(
  ({ children, style, value, ...props }, ref) => {
    const theme = useTheme();

    return (
      <AccordionItemProvider value={{ value }}>
        <View
          ref={ref}
          style={[
            {
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border,
            },
            style,
          ]}
          {...props}
        >
          {children}
        </View>
      </AccordionItemProvider>
    );
  },
);

AccordionItem.displayName = "AccordionItem";

export interface AccordionTriggerProps extends Omit<PressableProps, "style"> {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly textStyle?: StyleProp<TextStyle>;
}

export const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  AccordionTriggerProps
>(({ children, onPress, style, textStyle, ...props }, ref) => {
  const accordion = useAccordionContext();
  const item = useAccordionItemContext();
  const theme = useTheme();
  const open = accordion.isItemOpen(item.value);

  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      onPress={(event) => {
        accordion.toggleItem(item.value);
        onPress?.(event);
      }}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          paddingVertical: 16,
          opacity: pressed ? 0.92 : 1,
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
      <View style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}>
        <ChevronDownIcon size={16} strokeWidth={2} />
      </View>
    </Pressable>
  );
});

AccordionTrigger.displayName = "AccordionTrigger";

export interface AccordionContentProps extends Omit<ViewProps, "style"> {
  readonly style?: StyleProp<ViewStyle>;
}

export const AccordionContent = React.forwardRef<
  React.ElementRef<typeof View>,
  AccordionContentProps
>(({ children, style, ...props }, ref) => {
  const accordion = useAccordionContext();
  const item = useAccordionItemContext();
  const open = accordion.isItemOpen(item.value);

  if (!open) {
    return null;
  }

  return (
    <View ref={ref} style={[{ paddingBottom: 16 }, style]} {...props}>
      {children}
    </View>
  );
});

AccordionContent.displayName = "AccordionContent";
