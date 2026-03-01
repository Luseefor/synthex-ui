import * as React from "react";
import { cn } from "../_shared/variants";
import { Label } from "../label/label.web";
import {
  FormFieldProvider,
  FormItemProvider,
  useFormFieldMeta,
  type FormFieldSharedProps,
  type FormItemSharedProps,
} from "./form.shared";

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {}

export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, ...props }, ref) => (
    <form ref={ref} className={cn("space-y-6", className)} {...props} />
  ),
);

Form.displayName = "Form";

export function FormField(props: FormFieldSharedProps) {
  return <FormFieldProvider {...props} />;
}

export const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & FormItemSharedProps
>(({ children, className, ...props }, ref) => {
  const id = React.useId();

  return (
    <FormItemProvider id={id}>
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        {children}
      </div>
    </FormItemProvider>
  );
});

FormItem.displayName = "FormItem";

export const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => {
  const meta = useFormFieldMeta();

  return (
    <Label
      ref={ref}
      htmlFor={meta.controlId}
      className={cn(meta.error && "text-[color:var(--sx-color-destructive)]", className)}
      {...props}
    />
  );
});

FormLabel.displayName = "FormLabel";

export const FormControl = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { readonly children: React.ReactElement<any> }
>(({ children, ...props }, ref) => {
  const meta = useFormFieldMeta();
  const control = children as React.ReactElement<Record<string, unknown>>;

  return (
    <div ref={ref} {...props}>
      {React.cloneElement(control, {
        "aria-describedby": meta.describedBy,
        "aria-invalid": Boolean(meta.error) || undefined,
        id: meta.controlId,
        required: meta.required || undefined,
      })}
    </div>
  );
});

FormControl.displayName = "FormControl";

export const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const meta = useFormFieldMeta();
  const content = children ?? meta.description;

  if (!content) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={meta.descriptionId}
      className={cn("text-sm text-[color:var(--sx-color-foreground-muted)]", className)}
      {...props}
    >
      {content}
    </p>
  );
});

FormDescription.displayName = "FormDescription";

export const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const meta = useFormFieldMeta();
  const content = meta.error ?? children;

  if (!content) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={meta.messageId}
      className={cn("text-sm font-medium text-[color:var(--sx-color-destructive)]", className)}
      {...props}
    >
      {content}
    </p>
  );
});

FormMessage.displayName = "FormMessage";
