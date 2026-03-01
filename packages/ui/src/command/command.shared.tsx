import * as React from "react";

interface CommandContextValue {
  readonly query: string;
  readonly setQuery: (query: string) => void;
  readonly setItemVisibility: (id: string, visible: boolean) => void;
  readonly unregisterItem: (id: string) => void;
  readonly visibleItemCount: number;
}

const CommandContext = React.createContext<CommandContextValue | null>(null);

export interface CommandSharedProps {
  readonly defaultQuery?: string;
  readonly onQueryChange?: (query: string) => void;
  readonly query?: string;
  readonly shouldFilter?: boolean;
}

export interface CommandItemSharedProps {
  readonly keywords?: readonly string[];
  readonly textValue?: string;
  readonly value?: string;
}

export function normalizeSearchValue(value: string): string {
  return value.trim().toLowerCase();
}

export function matchesCommandQuery(
  query: string,
  value: string,
  keywords: readonly string[] = [],
): boolean {
  const normalizedQuery = normalizeSearchValue(query);

  if (!normalizedQuery) {
    return true;
  }

  const searchableValue = normalizeSearchValue([value, ...keywords].join(" "));
  return searchableValue.includes(normalizedQuery);
}

export function useCommandController({
  defaultQuery = "",
  onQueryChange,
  query,
  shouldFilter = true,
}: CommandSharedProps) {
  const [internalQuery, setInternalQuery] = React.useState(defaultQuery);
  const [visibleItemCount, setVisibleItemCount] = React.useState(0);
  const itemVisibilityRef = React.useRef<Map<string, boolean>>(new Map());
  const currentQuery = query ?? internalQuery;

  const syncVisibleItemCount = React.useCallback(() => {
    let nextCount = 0;

    itemVisibilityRef.current.forEach((visible) => {
      if (visible) {
        nextCount += 1;
      }
    });

    setVisibleItemCount(nextCount);
  }, []);

  return React.useMemo<CommandContextValue>(
    () => ({
      query: currentQuery,
      setQuery: (nextQuery) => {
        if (query === undefined) {
          setInternalQuery(nextQuery);
        }

        onQueryChange?.(nextQuery);
      },
      setItemVisibility: (id, visible) => {
        const previousVisibility = itemVisibilityRef.current.get(id);

        if (previousVisibility === visible) {
          return;
        }

        itemVisibilityRef.current.set(id, shouldFilter ? visible : true);
        syncVisibleItemCount();
      },
      unregisterItem: (id) => {
        if (itemVisibilityRef.current.delete(id)) {
          syncVisibleItemCount();
        }
      },
      visibleItemCount,
    }),
    [currentQuery, onQueryChange, query, shouldFilter, syncVisibleItemCount, visibleItemCount],
  );
}

export function CommandProvider({
  children,
  value,
}: React.PropsWithChildren<{ readonly value: CommandContextValue }>) {
  return React.createElement(CommandContext.Provider, { value }, children);
}

export function useCommandContext() {
  const context = React.useContext(CommandContext);

  if (!context) {
    throw new Error("Command components must be used within <Command>.");
  }

  return context;
}
