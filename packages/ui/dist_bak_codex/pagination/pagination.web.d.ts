import * as React from "react";
import type { PaginationLinkSharedProps } from "./pagination.shared";
export declare const Pagination: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLElement> & React.RefAttributes<HTMLElement>>;
export declare const PaginationContent: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLUListElement> & React.RefAttributes<HTMLUListElement>>;
export declare const PaginationItem: React.ForwardRefExoticComponent<React.LiHTMLAttributes<HTMLLIElement> & React.RefAttributes<HTMLLIElement>>;
export interface PaginationLinkProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, PaginationLinkSharedProps {
}
export declare const PaginationLink: React.ForwardRefExoticComponent<PaginationLinkProps & React.RefAttributes<HTMLButtonElement>>;
export declare const PaginationPrevious: React.ForwardRefExoticComponent<React.ButtonHTMLAttributes<HTMLButtonElement> & React.RefAttributes<HTMLButtonElement>>;
export declare const PaginationNext: React.ForwardRefExoticComponent<React.ButtonHTMLAttributes<HTMLButtonElement> & React.RefAttributes<HTMLButtonElement>>;
export declare function PaginationEllipsis({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=pagination.web.d.ts.map