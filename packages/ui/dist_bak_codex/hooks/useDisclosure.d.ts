export interface UseDisclosureOptions {
    readonly defaultOpen?: boolean;
    readonly onOpenChange?: (isOpen: boolean) => void;
}
export declare function useDisclosure(options?: UseDisclosureOptions): {
    isOpen: boolean;
    onClose: () => void;
    onOpen: () => void;
    onToggle: () => void;
    setIsOpen: (nextValue: boolean) => void;
};
//# sourceMappingURL=useDisclosure.d.ts.map