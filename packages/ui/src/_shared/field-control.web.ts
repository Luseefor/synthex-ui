import { cn } from "./variants";

export type FieldControlSize = "sm" | "md" | "lg";
export type FieldControlTone = "default" | "invalid";

const singleLineSizeClassMap: Record<FieldControlSize, string> = {
  sm: "h-9 px-3 text-[13px]",
  md: "h-10 px-3.5 text-sm",
  lg: "h-11 px-4 text-[15px]",
};

const multilineSizeClassMap: Record<FieldControlSize, string> = {
  sm: "min-h-[108px] px-3 py-2.5 text-[13px]",
  md: "min-h-[132px] px-3.5 py-3 text-sm",
  lg: "min-h-[164px] px-4 py-3.5 text-[15px]",
};

const toneClassMap: Record<FieldControlTone, string> = {
  default:
    "border-[color:var(--sx-color-border)] hover:border-[color:var(--sx-color-border-strong)] focus-visible:border-[color:var(--sx-color-primary)]",
  invalid:
    "border-[color:var(--sx-color-destructive)] focus-visible:ring-[color:color-mix(in_srgb,var(--sx-color-destructive)_28%,transparent)]",
};

const fieldControlBaseClass =
  "w-full rounded-[var(--sx-radius-md)] border bg-[color:var(--sx-color-surface-raised)] text-[color:var(--sx-color-foreground)] shadow-[inset_0_1px_1px_rgba(15,23,42,0.03)] transition-[border-color,box-shadow,background-color,color] duration-[var(--sx-motion-fast)] ease-[var(--sx-easing-standard)] placeholder:text-[color:var(--sx-color-foreground-muted)] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sx-color-background)]";

export function getFieldControlClassName({
  className,
  multiline = false,
  size = "md",
  tone = "default",
}: {
  readonly className?: string;
  readonly multiline?: boolean;
  readonly size?: FieldControlSize;
  readonly tone?: FieldControlTone;
}) {
  return cn(
    fieldControlBaseClass,
    "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[color:var(--sx-color-foreground)]",
    multiline ? "leading-6 resize-none" : "leading-none",
    multiline ? multilineSizeClassMap[size] : singleLineSizeClassMap[size],
    toneClassMap[tone],
    className,
  );
}
