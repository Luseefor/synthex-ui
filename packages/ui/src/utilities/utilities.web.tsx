import * as React from "react";
import { getFieldControlClassName } from "../_shared/field-control.web";
import { cn } from "../_shared/variants";
import { Label } from "../label/label.web";

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  readonly size?: "sm" | "md" | "lg";
}

export function Spinner({ className, size = "md", ...props }: SpinnerProps) {
  const sizeClass = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-7 w-7" : "h-5 w-5";

  return (
    <span
      data-slot="spinner"
      aria-label="Loading"
      role="status"
      className={cn(
        "inline-flex animate-spin rounded-full border-2 border-border border-t-primary",
        sizeClass,
        className,
      )}
      {...props}
    />
  );
}

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {}

export function Kbd({ className, ...props }: KbdProps) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "bg-muted text-muted-foreground inline-flex min-h-6 items-center justify-center whitespace-nowrap rounded-md border px-2 font-mono text-[0.75rem] font-semibold leading-none shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
        className,
      )}
      {...props}
    />
  );
}

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ButtonGroup({ className, ...props }: ButtonGroupProps) {
  return (
    <div
      data-slot="button-group"
      className={cn(
        "bg-card inline-flex items-center gap-2 rounded-lg border p-1",
        className,
      )}
      {...props}
    />
  );
}

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Field({ className, ...props }: FieldProps) {
  return <div data-slot="field" className={cn("grid gap-2.5", className)} {...props} />;
}

export interface FieldSetProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {}
export function FieldSet({ className, ...props }: FieldSetProps) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn(
        "grid gap-3 rounded-[var(--sx-radius-lg)] border border-[color:var(--sx-color-border)] p-4",
        className,
      )}
      {...props}
    />
  );
}

export interface FieldLegendProps extends React.HTMLAttributes<HTMLLegendElement> {}
export function FieldLegend({ className, ...props }: FieldLegendProps) {
  return (
    <legend
      data-slot="field-legend"
      className={cn("px-1 text-sm font-semibold text-[color:var(--sx-color-foreground)]", className)}
      {...props}
    />
  );
}

export interface FieldContentProps extends React.HTMLAttributes<HTMLDivElement> {}
export function FieldContent({ className, ...props }: FieldContentProps) {
  return <div data-slot="field-content" className={cn("grid gap-1.5", className)} {...props} />;
}

export interface FieldLabelProps extends React.ComponentPropsWithoutRef<typeof Label> {}
export function FieldLabel({ className, ...props }: FieldLabelProps) {
  return <Label data-slot="field-label" className={cn("text-[13px] font-semibold", className)} {...props} />;
}

export interface FieldDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}
export function FieldDescription({ className, ...props }: FieldDescriptionProps) {
  return (
    <p
      data-slot="field-description"
      className={cn("text-[13px] leading-5 text-[color:var(--sx-color-foreground-muted)]", className)}
      {...props}
    />
  );
}

export interface FieldErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {}
export function FieldError({ className, ...props }: FieldErrorProps) {
  return (
    <p
      data-slot="field-error"
      className={cn("text-[13px] font-medium leading-5 text-[color:var(--sx-color-destructive)]", className)}
      {...props}
    />
  );
}

export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

export function InputGroup({ className, ...props }: InputGroupProps) {
  return (
    <div
      data-slot="input-group"
      className={cn(
        "flex items-stretch overflow-hidden rounded-[var(--sx-radius-md)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface-raised)] shadow-[inset_0_1px_1px_rgba(15,23,42,0.03)]",
        className,
      )}
      {...props}
    />
  );
}

export interface InputGroupAddonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function InputGroupAddon({ className, ...props }: InputGroupAddonProps) {
  return (
    <div
      data-slot="input-group-addon"
      className={cn(
        "inline-flex items-center border-r border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface-muted)] px-3 text-sm text-[color:var(--sx-color-foreground-muted)]",
        className,
      )}
      {...props}
    />
  );
}

export interface EmptyProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Empty({ className, ...props }: EmptyProps) {
  return (
    <div
      data-slot="empty"
      className={cn(
        "grid min-h-40 place-items-center rounded-[var(--sx-radius-lg)] border border-dashed border-[color:var(--sx-color-border-strong)] bg-[color:var(--sx-color-surface-muted)] px-6 py-8 text-center",
        className,
      )}
      {...props}
    />
  );
}

export interface EmptyHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export function EmptyHeader({ className, ...props }: EmptyHeaderProps) {
  return <div data-slot="empty-header" className={cn("grid gap-2", className)} {...props} />;
}

export interface EmptyTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
export function EmptyTitle({ className, ...props }: EmptyTitleProps) {
  return <h4 data-slot="empty-title" className={cn("text-lg font-semibold text-[color:var(--sx-color-foreground)]", className)} {...props} />;
}

export interface EmptyDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}
export function EmptyDescription({ className, ...props }: EmptyDescriptionProps) {
  return <p data-slot="empty-description" className={cn("text-sm text-[color:var(--sx-color-foreground-muted)]", className)} {...props} />;
}

export interface ItemProps extends React.HTMLAttributes<HTMLDivElement> {}
export function Item({ className, ...props }: ItemProps) {
  return (
    <div
      data-slot="item"
      className={cn(
        "grid gap-1 rounded-[var(--sx-radius-md)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] px-4 py-3",
        className,
      )}
      {...props}
    />
  );
}

export interface ItemTitleProps extends React.HTMLAttributes<HTMLDivElement> {}
export function ItemTitle({ className, ...props }: ItemTitleProps) {
  return <div data-slot="item-title" className={cn("text-sm font-medium text-[color:var(--sx-color-foreground)]", className)} {...props} />;
}

export interface ItemDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}
export function ItemDescription({ className, ...props }: ItemDescriptionProps) {
  return <p data-slot="item-description" className={cn("text-sm text-[color:var(--sx-color-foreground-muted)]", className)} {...props} />;
}

export interface NativeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  readonly label?: string;
}

export function NativeSelect({ children, className, label, ...props }: NativeSelectProps) {
  return (
    <div data-slot="native-select" className="grid gap-2.5">
      {label ? <Label>{label}</Label> : null}
      <select className={getFieldControlClassName({ className })} {...props}>
        {children}
      </select>
    </div>
  );
}
