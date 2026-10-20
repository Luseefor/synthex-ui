import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { cn } from "../_shared/variants";
import { useControllableState } from "../hooks/useControllableState";
import { SearchIcon } from "../icons/index.web";
import {
  resolveCommandSearch,
  type CommandItemSharedProps,
  type CommandSharedProps,
} from "./command.shared";

type CommandRootProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive>;

export interface CommandProps
  extends Omit<CommandRootProps, "value" | "defaultValue" | "onValueChange" | "filter" | "label" | "loop" | "shouldFilter">,
    CommandSharedProps {}

const CommandSearchContext = React.createContext<{
  readonly search: string;
  readonly setSearch: (search: string) => void;
} | null>(null);

function useCommandSearch() {
  return React.useContext(CommandSearchContext);
}

export function Command({
  children,
  className,
  defaultQuery,
  defaultValue,
  onQueryChange,
  onValueChange,
  query,
  value,
  shouldFilter = true,
  filter,
  label = "Command menu",
  loop,
  ...props
}: CommandProps) {
  const resolved = resolveCommandSearch({ defaultQuery, defaultValue, onQueryChange, onValueChange, query, value });
  const [search, setSearch] = useControllableState<string>({
    defaultValue: resolved.defaultQuery,
    onChange: resolved.onQueryChange,
    value: resolved.query,
  });

  const contextValue = React.useMemo(
    () => ({
      search,
      setSearch: (next: string) => setSearch(next),
    }),
    [search, setSearch],
  );

  return (
    <CommandSearchContext.Provider value={contextValue}>
      <CommandPrimitive
        data-slot="command"
        label={label}
        shouldFilter={shouldFilter}
        filter={filter as CommandRootProps["filter"]}
        loop={loop}
        className={cn(
          "rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] shadow-[0_12px_28px_rgba(15,23,42,0.06)] overflow-hidden",
          className,
        )}
        {...props}
      >
        {children}
      </CommandPrimitive>
    </CommandSearchContext.Provider>
  );
}

type CommandInputRootProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>;

export interface CommandInputProps extends Omit<CommandInputRootProps, "value" | "onValueChange"> {
  readonly value?: string;
  readonly defaultValue?: string;
  readonly onValueChange?: (search: string) => void;
}

export const CommandInput = React.forwardRef<HTMLInputElement, CommandInputProps>(
  ({ className, onValueChange, value, defaultValue, placeholder = "Search commands", ...props }, ref) => {
    const searchContext = useCommandSearch();
    const [internal, setInternal] = useControllableState<string>({
      defaultValue: defaultValue ?? searchContext?.search ?? "",
      onChange: (next) => {
        searchContext?.setSearch(next);
        onValueChange?.(next);
      },
      value: value ?? searchContext?.search,
    });

    return (
      <div
        data-slot="command-input-wrapper"
        className="flex items-center gap-3 border-b border-[color:var(--sx-color-border)] px-3.5 py-3"
      >
        <SearchIcon size={15} color="var(--sx-color-foreground-muted)" />
        <CommandPrimitive.Input
          ref={ref as React.Ref<HTMLInputElement>}
          data-slot="command-input"
          value={internal}
          onValueChange={(next: string) => {
            setInternal(next);
          }}
          placeholder={placeholder}
          className={cn(
            "w-full bg-transparent text-sm text-[color:var(--sx-color-foreground)] placeholder:text-[color:var(--sx-color-foreground-muted)] focus:outline-none",
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);

CommandInput.displayName = "CommandInput";

export interface CommandListProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.List> {}

export const CommandList = React.forwardRef<HTMLDivElement, CommandListProps>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive.List
      ref={ref as React.Ref<HTMLDivElement>}
      data-slot="command-list"
      className={cn("max-h-72 overflow-y-auto p-2", className)}
      {...props}
    />
  ),
);

CommandList.displayName = "CommandList";

export interface CommandEmptyProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty> {}

export const CommandEmpty = React.forwardRef<HTMLDivElement, CommandEmptyProps>(
  ({ children = "No results found.", className, ...props }, ref) => (
    <CommandPrimitive.Empty
      ref={ref as React.Ref<HTMLDivElement>}
      data-slot="command-empty"
      className={cn(
        "px-3 py-8 text-center text-sm text-[color:var(--sx-color-foreground-muted)]",
        className,
      )}
      {...props}
    >
      {children}
    </CommandPrimitive.Empty>
  ),
);

CommandEmpty.displayName = "CommandEmpty";

export interface CommandGroupProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group> {
  readonly heading?: React.ReactNode;
}

export const CommandGroup = React.forwardRef<HTMLDivElement, CommandGroupProps>(
  ({ children, className, heading, ...props }, ref) => (
    <CommandPrimitive.Group
      ref={ref as React.Ref<HTMLDivElement>}
      data-slot="command-group"
      heading={heading as string}
      className={cn(
        "space-y-1 py-1 overflow-hidden [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.12em] [&_[cmdk-group-heading]]:text-[color:var(--sx-color-foreground-muted)]",
        className,
      )}
      {...props}
    >
      {children}
    </CommandPrimitive.Group>
  ),
);

CommandGroup.displayName = "CommandGroup";

type CommandItemRootProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>;

export interface CommandItemProps
  extends Omit<CommandItemRootProps, "value" | "keywords">,
    CommandItemSharedProps {
  readonly onCommandSelect?: (value: string) => void;
  readonly onSelect?: (value: string) => void;
}

export const CommandItem = React.forwardRef<HTMLDivElement, CommandItemProps>(
  ({ children, className, keywords, onCommandSelect, onSelect, textValue, value, ...props }, ref) => {
    const searchValue =
      textValue ??
      (typeof children === "string" || typeof children === "number" ? String(children) : value) ??
      "";
    const itemValue = value ?? searchValue;

    return (
      <CommandPrimitive.Item
        ref={ref as React.Ref<HTMLDivElement>}
        data-slot="command-item"
        value={searchValue}
        keywords={keywords as string[] | undefined}
        onSelect={(selectedValue: string) => {
          onCommandSelect?.(itemValue);
          onSelect?.(selectedValue);
        }}
        className={cn(
          "flex w-full cursor-pointer items-center justify-between gap-3 rounded-[var(--sx-radius-md)] px-3 py-2.5 text-left text-sm text-[color:var(--sx-color-foreground)] transition-[background-color,color] duration-[var(--sx-motion-fast)] aria-selected:bg-[color:var(--sx-color-surface-muted)] data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-45",
          className,
        )}
        {...props}
      >
        {children}
      </CommandPrimitive.Item>
    );
  },
);

CommandItem.displayName = "CommandItem";

export const CommandSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref as React.Ref<HTMLDivElement>}
    data-slot="command-separator"
    className={cn("h-px bg-[color:var(--sx-color-border)] my-1", className)}
    {...props}
  />
));

CommandSeparator.displayName = "CommandSeparator";

export const CommandDialog = CommandPrimitive.Dialog;
