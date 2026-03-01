import * as React from "react";
import {
  Text as NativeText,
  View,
  type StyleProp,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../_shared/theme/context";
import { Label } from "../label/label.native";
import {
  FormFieldProvider,
  FormItemProvider,
  useFormFieldMeta,
  type FormFieldSharedProps,
  type FormItemSharedProps,
} from "./form.shared";

export interface FormProps extends ViewProps {
  readonly style?: StyleProp<ViewStyle>;
}

export const Form = React.forwardRef<React.ElementRef<typeof View>, FormProps>(
  ({ children, style, ...props }, ref) => (
    <View ref={ref} style={[{ gap: 24 }, style]} {...props}>
      {children}
    </View>
  ),
);

Form.displayName = "Form";

export function FormField(props: FormFieldSharedProps) {
  return <FormFieldProvider {...props} />;
}

export interface FormItemProps extends Omit<ViewProps, "children">, FormItemSharedProps {
  readonly style?: StyleProp<ViewStyle>;
}

export const FormItem = React.forwardRef<React.ElementRef<typeof View>, FormItemProps>(
  ({ children, style, ...props }, ref) => {
    const id = React.useId();

    return (
      <FormItemProvider id={id}>
        <View ref={ref} style={[{ gap: 10 }, style]} {...props}>
          {children}
        </View>
      </FormItemProvider>
    );
  },
);

FormItem.displayName = "FormItem";

export const FormLabel = React.forwardRef<
  React.ElementRef<typeof NativeText>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ style, ...props }, ref) => {
  const theme = useTheme();
  const meta = useFormFieldMeta();

  return (
    <Label
      ref={ref}
      style={[meta.error ? { color: theme.colors.destructive } : null, style]}
      {...props}
    />
  );
});

FormLabel.displayName = "FormLabel";

export const FormControl = React.forwardRef<
  React.ElementRef<typeof View>,
  Omit<ViewProps, "children"> & { readonly children: React.ReactElement<any> }
>(({ children, style, ...props }, ref) => {
  const meta = useFormFieldMeta();
  const control = children as React.ReactElement<Record<string, unknown>>;

  return (
    <View ref={ref} style={style} {...props}>
      {React.cloneElement(control, {
        accessibilityState: {
          ...(control.props.accessibilityState as Record<string, unknown> | undefined),
          invalid: Boolean(meta.error),
        },
        nativeID: meta.controlId,
      })}
    </View>
  );
});

FormControl.displayName = "FormControl";

function FormText({
  children,
  color,
  nativeID,
  style,
}: {
  readonly children: React.ReactNode;
  readonly color: string;
  readonly nativeID: string;
  readonly style?: StyleProp<TextStyle>;
}) {
  const theme = useTheme();

  if (!children) {
    return null;
  }

  return (
    <NativeText
      nativeID={nativeID}
      style={[
        {
          color,
          fontFamily: theme.typography.family.sans,
          fontSize: 13,
          lineHeight: 20,
        },
        style,
      ]}
    >
      {children}
    </NativeText>
  );
}

export interface FormTextProps {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<TextStyle>;
}

export function FormDescription({ children, style }: FormTextProps) {
  const meta = useFormFieldMeta();
  const theme = useTheme();

  return (
    <FormText nativeID={meta.descriptionId} color={theme.colors.foregroundMuted} style={style}>
      {children ?? meta.description}
    </FormText>
  );
}

export function FormMessage({ children, style }: FormTextProps) {
  const meta = useFormFieldMeta();
  const theme = useTheme();

  return (
    <FormText
      nativeID={meta.messageId}
      color={theme.colors.destructive}
      style={[{ fontWeight: "600" }, style]}
    >
      {meta.error ?? children}
    </FormText>
  );
}
