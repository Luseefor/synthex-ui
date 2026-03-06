import { cn } from "./variants";
const singleLineSizeClassMap = {
    sm: "h-8 px-3 text-xs",
    md: "h-9 px-3 py-1 text-sm",
    lg: "h-10 px-4 text-sm",
};
const multilineSizeClassMap = {
    sm: "min-h-[108px] px-3 py-2.5 text-[13px]",
    md: "min-h-[132px] px-3.5 py-3 text-sm",
    lg: "min-h-[164px] px-4 py-3.5 text-[15px]",
};
const toneClassMap = {
    default: "border-[color:var(--sx-color-border)] hover:border-[color:var(--sx-color-border-strong)] focus-visible:border-[color:var(--sx-color-primary)]",
    invalid: "border-[color:var(--sx-color-destructive)] focus-visible:ring-[color:color-mix(in_srgb,var(--sx-color-destructive)_28%,transparent)]",
};
const fieldControlBaseClass = "w-full rounded-[var(--sx-radius-md)] border bg-transparent text-[color:var(--sx-color-foreground)] shadow-[var(--sx-shadow-sm)] transition-[border-color,box-shadow,color] duration-[var(--sx-motion-fast)] ease-[var(--sx-easing-standard)] placeholder:text-[color:var(--sx-color-foreground-muted)] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--sx-color-ring)]";
export function getFieldControlClassName({ className, multiline = false, size = "md", tone = "default", }) {
    return cn(fieldControlBaseClass, "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[color:var(--sx-color-foreground)]", multiline ? "leading-6 resize-none" : "leading-none", multiline ? multilineSizeClassMap[size] : singleLineSizeClassMap[size], toneClassMap[tone], className);
}
