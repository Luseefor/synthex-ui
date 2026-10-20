import * as React from "react";
import {
  Text as NativeText,
  TextInput,
  View,
  type TextInputProps,
  type TextProps as NativeTextProps,
  type ViewProps,
} from "react-native";
import { createFieldControlStyle } from "../_shared/field-control.native";
import { useTheme } from "../_shared/theme/context";
import { Label } from "../label/label.native";

export interface SpinnerProps extends ViewProps {
  readonly size?: "sm" | "md" | "lg";
}

export function Spinner({ size = "md", style, testID, ...props }: SpinnerProps & { readonly testID?: string }) {
  const theme = useTheme();
  const dimension = size === "sm" ? 16 : size === "lg" ? 28 : 20;

  return (
    <View
      testID={testID ?? "spinner"}
      accessibilityLabel="Loading"
      accessibilityRole="progressbar"
      style={[
        {
          borderColor: theme.colors.border,
          borderRadius: 999,
          borderTopColor: theme.colors.primary,
          borderWidth: 2,
          height: dimension,
          width: dimension,
        },
        style,
      ]}
      {...props}
    />
  );
}

export interface KbdProps extends NativeTextProps {}
export function Kbd({ style, testID, ...props }: KbdProps & { readonly testID?: string }) {
  const theme = useTheme();
  return (
    <NativeText
      style={[
        {
          alignSelf: "flex-start",
          backgroundColor: theme.colors.surfaceMuted,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.sm,
          borderWidth: 1,
          color: theme.colors.foregroundMuted,
          fontFamily: theme.typography.family.mono,
          fontSize: 12,
          fontWeight: "600",
          overflow: "hidden",
          paddingHorizontal: 8,
          paddingVertical: 4,
        },
        style,
      ]}
      {...props}
    />
  );
}

export interface ButtonGroupProps extends ViewProps {}
export function ButtonGroup({ style, testID, ...props }: ButtonGroupProps & { readonly testID?: string }) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          alignItems: "center",
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          flexDirection: "row",
          gap: 8,
          padding: 4,
        },
        style,
      ]}
      {...props}
    />
  );
}

export interface FieldProps extends ViewProps {}
export function Field({ style, testID, ...props }: FieldProps & { readonly testID?: string }) {
  return <View testID={testID ?? "field"} style={[{ gap: 10 }, style]} {...props} />;
}

export interface FieldSetProps extends ViewProps {}
export function FieldSet({ style, testID, ...props }: FieldSetProps & { readonly testID?: string }) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          gap: 12,
          padding: 16,
        },
        style,
      ]}
      {...props}
    />
  );
}

export interface FieldLegendProps extends NativeTextProps {}
export function FieldLegend({ style, testID, ...props }: FieldLegendProps & { readonly testID?: string }) {
  const theme = useTheme();
  return (
    <NativeText
      style={[
        {
          color: theme.colors.foreground,
          fontFamily: theme.typography.family.sans,
          fontSize: 14,
          fontWeight: "600",
        },
        style,
      ]}
      {...props}
    />
  );
}

export interface FieldContentProps extends ViewProps {}
export function FieldContent({ style, testID, ...props }: FieldContentProps & { readonly testID?: string }) {
  return <View testID={testID ?? "field-content"} style={[{ gap: 6 }, style]} {...props} />;
}

export interface FieldLabelProps extends React.ComponentPropsWithoutRef<typeof Label> {}
export function FieldLabel({ style, testID, ...props }: FieldLabelProps & { readonly testID?: string }) {
  return <Label testID={testID ?? "field-label"} style={[{ fontSize: 13, fontWeight: "600" }, style]} {...props} />;
}

export interface FieldDescriptionProps extends NativeTextProps {}
export function FieldDescription({ style, testID, ...props }: FieldDescriptionProps & { readonly testID?: string }) {
  const theme = useTheme();
  return (
    <NativeText
      testID={testID ?? "field-description"}
      style={[
        {
          color: theme.colors.foregroundMuted,
          fontFamily: theme.typography.family.sans,
          fontSize: 13,
          lineHeight: 20,
        },
        style,
      ]}
      {...props}
    />
  );
}

export interface FieldErrorProps extends NativeTextProps {}
export function FieldError({ style, testID, ...props }: FieldErrorProps & { readonly testID?: string }) {
  const theme = useTheme();
  return (
    <NativeText
      testID={testID ?? "field-error"}
      style={[
        {
          color: theme.colors.destructive,
          fontFamily: theme.typography.family.sans,
          fontSize: 13,
          fontWeight: "600",
          lineHeight: 20,
        },
        style,
      ]}
      {...props}
    />
  );
}

export interface InputGroupProps extends ViewProps {}
export function InputGroup({ style, testID, ...props }: InputGroupProps & { readonly testID?: string }) {
  const theme = useTheme();
  return (
    <View
      testID={testID ?? "input-group"}
      style={[
        {
          alignItems: "stretch",
          backgroundColor: theme.colors.surfaceRaised,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          borderWidth: 1,
          flexDirection: "row",
          overflow: "hidden",
        },
        style,
      ]}
      {...props}
    />
  );
}

export interface InputGroupAddonProps extends ViewProps {}
export function InputGroupAddon({ style, testID, ...props }: InputGroupAddonProps & { readonly testID?: string }) {
  const theme = useTheme();
  return (
    <View
      testID={testID ?? "input-group-addon"}
      style={[
        {
          alignItems: "center",
          backgroundColor: theme.colors.surfaceMuted,
          borderRightColor: theme.colors.border,
          borderRightWidth: 1,
          justifyContent: "center",
          paddingHorizontal: 12,
        },
        style,
      ]}
      {...props}
    />
  );
}

export interface EmptyProps extends ViewProps {}
export function Empty({ style, testID, ...props }: EmptyProps & { readonly testID?: string }) {
  const theme = useTheme();
  return (
    <View
      testID={testID ?? "empty"}
      style={[
        {
          alignItems: "center",
          backgroundColor: theme.colors.surfaceMuted,
          borderColor: theme.colors.borderStrong,
          borderRadius: theme.radius.lg,
          borderStyle: "dashed",
          borderWidth: 1,
          justifyContent: "center",
          minHeight: 160,
          paddingHorizontal: 24,
          paddingVertical: 32,
        },
        style,
      ]}
      {...props}
    />
  );
}

export interface EmptyHeaderProps extends ViewProps {}
export function EmptyHeader({ style, testID, ...props }: EmptyHeaderProps & { readonly testID?: string }) {
  return <View testID={testID ?? "empty-header"} style={[{ alignItems: "center", gap: 8 }, style]} {...props} />;
}

export interface EmptyTitleProps extends NativeTextProps {}
export function EmptyTitle({ style, testID, ...props }: EmptyTitleProps & { readonly testID?: string }) {
  const theme = useTheme();
  return (
    <NativeText
      testID={testID ?? "empty-title"}
      style={[
        {
          color: theme.colors.foreground,
          fontFamily: theme.typography.family.sans,
          fontSize: 18,
          fontWeight: "600",
        },
        style,
      ]}
      {...props}
    />
  );
}

export interface EmptyDescriptionProps extends NativeTextProps {}
export function EmptyDescription({ style, testID, ...props }: EmptyDescriptionProps & { readonly testID?: string }) {
  const theme = useTheme();
  return (
    <NativeText
      testID={testID ?? "empty-description"}
      style={[
        {
          color: theme.colors.foregroundMuted,
          fontFamily: theme.typography.family.sans,
          fontSize: 14,
          textAlign: "center",
        },
        style,
      ]}
      {...props}
    />
  );
}

export interface ItemProps extends ViewProps {}
export function Item({ style, testID, ...props }: ItemProps & { readonly testID?: string }) {
  const theme = useTheme();
  return (
    <View
      testID={testID ?? "item"}
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          borderWidth: 1,
          gap: 4,
          paddingHorizontal: 16,
          paddingVertical: 12,
        },
        style,
      ]}
      {...props}
    />
  );
}

export interface ItemTitleProps extends NativeTextProps {}
export function ItemTitle({ style, testID, ...props }: ItemTitleProps & { readonly testID?: string }) {
  const theme = useTheme();
  return (
    <NativeText
      testID={testID ?? "item-title"}
      style={[
        {
          color: theme.colors.foreground,
          fontFamily: theme.typography.family.sans,
          fontSize: 14,
          fontWeight: "500",
        },
        style,
      ]}
      {...props}
    />
  );
}

export interface ItemDescriptionProps extends NativeTextProps {}
export function ItemDescription({ style, testID, ...props }: ItemDescriptionProps & { readonly testID?: string }) {
  const theme = useTheme();
  return (
    <NativeText
      testID={testID ?? "item-description"}
      style={[
        {
          color: theme.colors.foregroundMuted,
          fontFamily: theme.typography.family.sans,
          fontSize: 14,
        },
        style,
      ]}
      {...props}
    />
  );
}

export interface NativeSelectProps extends TextInputProps {
  readonly label?: string;
}

export function NativeSelect({ label, style, ...props }: NativeSelectProps) {
  const theme = useTheme();

  return (
    <View style={{ gap: 10 }}>
      {label ? <Label>{label}</Label> : null}
      <TextInput
        style={[
          {
            ...createFieldControlStyle(theme, {}),
            paddingVertical: 10,
          },
          style,
        ]}
        {...props}
      />
    </View>
  );
}
