import * as React from "react";
import { View, type PressableProps, type StyleProp, type TextProps, type TextStyle, type ViewProps, type ViewStyle } from "react-native";
import type { PaginationLinkSharedProps } from "./pagination.shared";
export interface PaginationProps extends Omit<ViewProps, "style"> {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const Pagination: React.ForwardRefExoticComponent<PaginationProps & React.RefAttributes<View>>;
export declare const PaginationContent: React.ForwardRefExoticComponent<PaginationProps & React.RefAttributes<View>>;
export declare const PaginationItem: React.ForwardRefExoticComponent<PaginationProps & React.RefAttributes<View>>;
export interface PaginationLinkProps extends Omit<PressableProps, "style">, PaginationLinkSharedProps {
    readonly children?: React.ReactNode;
    readonly style?: StyleProp<ViewStyle>;
    readonly textStyle?: StyleProp<TextStyle>;
}
export declare const PaginationLink: React.ForwardRefExoticComponent<PaginationLinkProps & React.RefAttributes<View>>;
export declare const PaginationPrevious: React.ForwardRefExoticComponent<PaginationLinkProps & React.RefAttributes<View>>;
export declare const PaginationNext: React.ForwardRefExoticComponent<PaginationLinkProps & React.RefAttributes<View>>;
export declare function PaginationEllipsis({ style, ...props }: Omit<TextProps, "style"> & {
    readonly style?: StyleProp<TextStyle>;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=pagination.native.d.ts.map