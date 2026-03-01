import * as React from "react";

export interface FormFieldSharedProps {
  readonly children: React.ReactNode;
  readonly description?: React.ReactNode;
  readonly error?: React.ReactNode;
  readonly name: string;
  readonly required?: boolean;
}

export interface FormItemSharedProps {
  readonly children: React.ReactNode;
}

interface FormFieldContextValue {
  readonly description?: React.ReactNode;
  readonly error?: React.ReactNode;
  readonly name: string;
  readonly required: boolean;
}

interface FormItemContextValue {
  readonly controlId: string;
  readonly descriptionId: string;
  readonly itemId: string;
  readonly messageId: string;
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);
const FormItemContext = React.createContext<FormItemContextValue | null>(null);

export function FormFieldProvider({
  children,
  description,
  error,
  name,
  required = false,
}: FormFieldSharedProps) {
  const value = React.useMemo(
    () => ({
      description,
      error,
      name,
      required,
    }),
    [description, error, name, required],
  );

  return <FormFieldContext.Provider value={value}>{children}</FormFieldContext.Provider>;
}

export function FormItemProvider({
  children,
  id,
}: FormItemSharedProps & { readonly id: string }) {
  const value = React.useMemo(
    () => ({
      controlId: `${id}-control`,
      descriptionId: `${id}-description`,
      itemId: id,
      messageId: `${id}-message`,
    }),
    [id],
  );

  return <FormItemContext.Provider value={value}>{children}</FormItemContext.Provider>;
}

export function useFormFieldMeta() {
  const field = React.useContext(FormFieldContext);
  const item = React.useContext(FormItemContext);

  if (!field) {
    throw new Error("Form components must be used within <FormField>.");
  }

  if (!item) {
    throw new Error("Form components must be used within <FormItem>.");
  }

  const describedBy = [
    field.description ? item.descriptionId : null,
    field.error ? item.messageId : null,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    ...field,
    ...item,
    describedBy: describedBy || undefined,
  };
}
