import * as React from "react";
const CommandContext = React.createContext(null);
export function normalizeSearchValue(value) {
    return value.trim().toLowerCase();
}
export function matchesCommandQuery(query, value, keywords = []) {
    const normalizedQuery = normalizeSearchValue(query);
    if (!normalizedQuery) {
        return true;
    }
    const searchableValue = normalizeSearchValue([value, ...keywords].join(" "));
    return searchableValue.includes(normalizedQuery);
}
export function useCommandController({ defaultQuery = "", onQueryChange, query, shouldFilter = true, }) {
    const [internalQuery, setInternalQuery] = React.useState(defaultQuery);
    const [visibleItemCount, setVisibleItemCount] = React.useState(0);
    const itemVisibilityRef = React.useRef(new Map());
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
    return React.useMemo(() => ({
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
    }), [currentQuery, onQueryChange, query, shouldFilter, syncVisibleItemCount, visibleItemCount]);
}
export function CommandProvider({ children, value, }) {
    return React.createElement(CommandContext.Provider, { value }, children);
}
export function useCommandContext() {
    const context = React.useContext(CommandContext);
    if (!context) {
        throw new Error("Command components must be used within <Command>.");
    }
    return context;
}
