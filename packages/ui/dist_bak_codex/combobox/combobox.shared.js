import * as React from "react";
import { matchesCommandQuery } from "../command/command.shared";
const ComboboxContext = React.createContext(null);
export function matchesComboboxQuery(query, value, keywords = []) {
    return matchesCommandQuery(query, value, keywords);
}
export function useComboboxController({ defaultOpen = false, defaultQuery = "", defaultValue = "", onOpenChange, onQueryChange, onValueChange, open, placeholder, query, value, }) {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
    const [internalQuery, setInternalQuery] = React.useState(defaultQuery);
    const [labelVersion, setLabelVersion] = React.useState(0);
    const [visibleItemCount, setVisibleItemCount] = React.useState(0);
    const labelsRef = React.useRef(new Map());
    const itemVisibilityRef = React.useRef(new Map());
    const currentValue = value ?? internalValue;
    const currentOpen = open ?? internalOpen;
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
        labelVersion,
        open: currentOpen,
        placeholder,
        query: currentQuery,
        registerItem: (itemValue, label) => {
            const previousLabel = labelsRef.current.get(itemValue);
            if (previousLabel === label) {
                return;
            }
            labelsRef.current.set(itemValue, label);
            setLabelVersion((version) => version + 1);
        },
        setItemVisibility: (id, visible) => {
            const previousVisibility = itemVisibilityRef.current.get(id);
            if (previousVisibility === visible) {
                return;
            }
            itemVisibilityRef.current.set(id, visible);
            syncVisibleItemCount();
        },
        setOpen: (nextOpen) => {
            if (open === undefined) {
                setInternalOpen(nextOpen);
            }
            onOpenChange?.(nextOpen);
        },
        setQuery: (nextQuery) => {
            if (query === undefined) {
                setInternalQuery(nextQuery);
            }
            onQueryChange?.(nextQuery);
        },
        setValue: (nextValue) => {
            if (value === undefined) {
                setInternalValue(nextValue);
            }
            onValueChange?.(nextValue);
        },
        unregisterItem: (id) => {
            if (itemVisibilityRef.current.delete(id)) {
                syncVisibleItemCount();
            }
        },
        value: currentValue,
        visibleItemCount,
        getLabel: (itemValue) => labelsRef.current.get(itemValue),
    }), [
        currentOpen,
        currentQuery,
        currentValue,
        labelVersion,
        onOpenChange,
        onQueryChange,
        onValueChange,
        open,
        placeholder,
        query,
        syncVisibleItemCount,
        value,
        visibleItemCount,
    ]);
}
export function ComboboxProvider({ children, value, }) {
    return React.createElement(ComboboxContext.Provider, { value }, children);
}
export function useComboboxContext() {
    const context = React.useContext(ComboboxContext);
    if (!context) {
        throw new Error("Combobox components must be used within <Combobox>.");
    }
    return context;
}
