import * as React from "react";
import { Pressable, Text, View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { useTheme } from "../_shared/theme/context";
import { CalendarIcon } from "../icons/index.native";
import { Calendar } from "../calendar/calendar.native";
import { useControllableState } from "../hooks/useControllableState";
import { getDatePickerLabel, type DatePickerSharedProps } from "./date-picker.shared";

export interface DatePickerProps extends Omit<ViewProps, "style">, DatePickerSharedProps {
  readonly style?: StyleProp<ViewStyle>;
}

export function DatePicker({
  defaultValue,
  onValueChange,
  placeholder,
  style,
  testID,
  value,
  ...props
}: DatePickerProps) {
  const theme = useTheme();
  const [currentValue, setCurrentValue] = useControllableState<Date | undefined>({
    defaultValue,
    onChange: onValueChange,
    value,
  });
  const [open, setOpen] = React.useState(false);

  // testIDs mirror web `data-slot="date-picker-*"` for parity.
  return (
    <View testID={testID ?? "date-picker"} style={[{ gap: 8 }, style]} {...props}>
      <Pressable
        testID="date-picker-trigger"
        accessibilityRole="button"
        onPress={() => setOpen((current) => !current)}
        style={{
          minHeight: 40,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors.surfaceRaised,
          paddingHorizontal: 14,
        }}
      >
        <Text style={{ color: theme.colors.foreground, fontSize: theme.typography.size.sm }}>
          {getDatePickerLabel(currentValue, placeholder)}
        </Text>
        <CalendarIcon size={16} />
      </Pressable>
      {open ? (
        <View testID="date-picker-content">
          <Calendar
            value={currentValue}
            onValueChange={(next) => {
              setCurrentValue(next);
              setOpen(false);
            }}
          />
        </View>
      ) : null}
    </View>
  );
}
