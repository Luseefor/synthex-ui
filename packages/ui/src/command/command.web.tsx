import * as React from "react";
import { cn } from "../_shared/variants";
import { SearchIcon } from "../icons/index.web";
import {
  CommandProvider,
  matchesCommandQuery,
  useCommandContext,
  useCommandController,
  type CommandItemSharedProps,
  type CommandSharedProps,
} from "./command.shared";

export interface CommandProps extends React.HTMLAttributes<HTMLDivElement>, CommandSharedProps {}

export function Command({
  children,
  className,
  defaultQuery,
  onQueryChange,
  query,
  shouldFilter,
  ...props
}: CommandProps) {
  const controller = useCommandController({
    defaultQuery,
    onQueryChange,
    query,
    shouldFilter,
  });

  return (
    <CommandProvider value={controller}>
      <div
        className={cn(
          "rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] shadow-[0_12px_28px_rgba(15,23,42,0.06)]",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </CommandProvider>
  );
}

export interface CommandInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "defaultValue" | "value"> {}

export const CommandInput = React.forwardRef<HTMLInputElement, CommandInputProps>(
  ({ className, onChange, placeholder = "Search commands", type = "text", ...props }, ref) => {
    const context = useCommandContext();

    return (
      <div className="flex items-center gap-3 border-b border-[color:var(--sx-color-border)] px-3.5 py-3">
        <SearchIcon size={15} color="var(--sx-color-foreground-muted)" />
        <input
          ref={ref}
          type={type}
          value={context.query}
          className={cn(
            "w-full bg-transparent text-sm text-[color:var(--sx-color-foreground)] placeholder:text-[color:var(--sx-color-foreground-muted)] focus:outline-none",
            className,
          )}
          onChange={(event) => {
            context.setQuery(event.target.value);
            onChange?.(event);
          }}
          placeholder={placeholder}
          {...props}
        />
      </div>
    );
  },
);

CommandInput.displayName = "CommandInput";

export interface CommandListProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CommandList = React.forwardRef<HTMLDivElement, CommandListProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="listbox"
      className={cn("max-h-72 overflow-y-auto p-2", className)}
      {...props}
    />
  ),
);

CommandList.displayName = "CommandList";

export interface CommandEmptyProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CommandEmpty = React.forwardRef<HTMLDivElement, CommandEmptyProps>(
  ({ children = "No results found.", className, ...props }, ref) => {
    const context = useCommandContext();

    if (context.visibleItemCount > 0) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          "px-3 py-8 text-center text-sm text-[color:var(--sx-color-foreground-muted)]",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

CommandEmpty.displayName = "CommandEmpty";

export interface CommandGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly heading?: React.ReactNode;
}

export const CommandGroup = React.forwardRef<HTMLDivElement, CommandGroupProps>(
  ({ children, className, heading, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-1 py-1", className)} {...props}>
      {heading ? (
        <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--sx-color-foreground-muted)]">
          {heading}
        </div>
      ) : null}
      <div className="space-y-1">{children}</div>
    </div>
  ),
);

CommandGroup.displayName = "CommandGroup";

export interface CommandItemProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value">,
    CommandItemSharedProps {
  readonly onCommandSelect?: (value: string) => void;
}

export const CommandItem = React.forwardRef<HTMLButtonElement, CommandItemProps>(
  ({ children, className, keywords, onClick, onCommandSelect, textValue, value, ...props }, ref) => {
    const context = useCommandContext();
    const itemId = React.useId();
    const searchValue =
      textValue ??
      (typeof children === "string" || typeof children === "number" ? String(children) : value) ??
      "";
    const itemValue = value ?? searchValue;
    const visible = matchesCommandQuery(context.query, searchValue, keywords);

    React.useEffect(() => {
      context.setItemVisibility(itemId, visible);
      return () => context.unregisterItem(itemId);
    }, [context, itemId, visible]);

    if (!visible) {
      return null;
    }

    return (
      <button
        ref={ref}
        type="button"
        role="option"
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-[var(--sx-radius-md)] px-3 py-2.5 text-left text-sm text-[color:var(--sx-color-foreground)] transition-[background-color,color] duration-150 hover:bg-[color:var(--sx-color-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sx-color-surface)] disabled:pointer-events-none disabled:opacity-45",
          className,
        )}
        onClick={(event) => {
          onCommandSelect?.(itemValue);
          onClick?.(event);
        }}
        {...props}
      >
        {children}
      </button>
    );
  },
);

CommandItem.displayName = "CommandItem";
