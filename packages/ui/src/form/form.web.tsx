import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import {
  Controller,
  useFormContext,
  type ControllerProps,
  type FieldError,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { cn } from "../_shared/variants";
import { Label } from "../label/label.web";
import type { FormFieldSharedProps } from "./form.shared";

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {}

const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, ...props }, ref) => (
    <form ref={ref} data-slot="form" className={cn("space-y-8", className)} {...props} />
  ),
);

Form.displayName = "Form";

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  readonly description?: React.ReactNode;
  readonly error?: React.ReactNode;
  readonly name: TName;
  readonly required?: boolean;
};

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);

type FormItemContextValue = {
  readonly id: string;
};

const FormItemContext = React.createContext<FormItemContextValue | null>(null);

type FormFieldStateContextValue = {
  readonly rhfError?: FieldError;
};

const FormFieldStateContext = React.createContext<FormFieldStateContextValue | null>(null);

export interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  readonly children?: React.ReactNode;
  readonly control?: ControllerProps<TFieldValues, TName>["control"];
  readonly description?: FormFieldSharedProps["description"];
  readonly disabled?: boolean;
  readonly error?: FormFieldSharedProps["error"];
  readonly name: TName;
  readonly render?: ControllerProps<TFieldValues, TName>["render"];
  readonly required?: FormFieldSharedProps["required"];
  readonly rules?: ControllerProps<TFieldValues, TName>["rules"];
  readonly shouldUnregister?: ControllerProps<TFieldValues, TName>["shouldUnregister"];
}

function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: FormFieldProps<TFieldValues, TName>) {
  const {
    children,
    control,
    description,
    disabled,
    error,
    name,
    render,
    required = false,
    rules,
    shouldUnregister,
  } = props;
  const contextValue = React.useMemo<FormFieldContextValue<TFieldValues, TName>>(
    () => ({ description, error, name, required }),
    [description, error, name, required],
  );

  return (
    <FormFieldContext.Provider value={contextValue}>
      {render ? (
        <Controller
          control={control}
          disabled={disabled}
          name={name}
          render={(renderProps) => (
            <FormFieldStateContext.Provider value={{ rhfError: renderProps.fieldState.error }}>
              {render(renderProps)}
            </FormFieldStateContext.Provider>
          )}
          rules={rules}
          shouldUnregister={shouldUnregister}
        />
      ) : (
        children
      )}
    </FormFieldContext.Provider>
  );
}

function useOptionalFormContext(): ReturnType<typeof useFormContext> | null {
  try {
    return useFormContext();
  } catch {
    return null;
  }
}

export function useFormField() {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const fieldStateContext = React.useContext(FormFieldStateContext);
  const formContext = useOptionalFormContext();

  if (!fieldContext) {
    throw new Error("useFormField must be used within <FormField>.");
  }

  if (!itemContext) {
    throw new Error("useFormField must be used within <FormItem>.");
  }

  const { id } = itemContext;
  const formItemId = `${id}-form-item`;
  const formDescriptionId = `${id}-form-item-description`;
  const formMessageId = `${id}-form-item-message`;

  let rhfError: FieldError | undefined = fieldStateContext?.rhfError;

  if (!rhfError && formContext) {
    rhfError = formContext.getFieldState(fieldContext.name, formContext.formState).error;
  }

  const error: React.ReactNode = rhfError?.message ?? fieldContext.error;
  const describedBy = [formDescriptionId, error ? formMessageId : null]
    .filter(Boolean)
    .join(" ");

  return {
    description: fieldContext.description,
    error,
    formDescriptionId,
    formItemId,
    formMessageId,
    id,
    name: fieldContext.name,
    required: fieldContext.required ?? false,
    describedBy: describedBy || undefined,
  };
}

export interface FormItemProps extends React.ComponentPropsWithoutRef<"div"> {}

const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(
  ({ children, className, ...props }, ref) => {
    const id = React.useId();

    return (
      <FormItemContext.Provider value={React.useMemo(() => ({ id }), [id])}>
        <div ref={ref} data-slot="form-item" className={cn("space-y-2", className)} {...props}>
          {children}
        </div>
      </FormItemContext.Provider>
    );
  },
);

FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return (
    <Label
      ref={ref}
      data-slot="form-label"
      htmlFor={formItemId}
      className={cn(error && "text-destructive", className)}
      {...props}
    />
  );
});

FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot> & { readonly required?: boolean }
>(({ ...props }, ref) => {
  const { error, formDescriptionId, formItemId, formMessageId, required } = useFormField();

  return (
    <Slot
      ref={ref}
      data-slot="form-control"
      id={formItemId}
      aria-describedby={!error ? formDescriptionId : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={Boolean(error) || undefined}
      required={required || undefined}
      {...props}
    />
  );
});

FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ children, className, ...props }, ref) => {
  const { description, formDescriptionId } = useFormField();
  const content = children ?? description;

  if (!content) {
    return null;
  }

  return (
    <p
      ref={ref}
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    >
      {content}
    </p>
  );
});

FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ children, className, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const content = error ?? children;

  if (!content) {
    return null;
  }

  return (
    <p
      ref={ref}
      data-slot="form-message"
      id={formMessageId}
      className={cn("text-destructive text-sm font-medium", className)}
      {...props}
    >
      {content}
    </p>
  );
});

FormMessage.displayName = "FormMessage";

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
};
