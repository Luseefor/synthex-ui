import * as React from "react";
import { type CommandItemSharedProps, type CommandSharedProps } from "./command.shared";
export interface CommandProps extends React.HTMLAttributes<HTMLDivElement>, CommandSharedProps {
}
export declare function Command({ children, className, defaultQuery, onQueryChange, query, shouldFilter, ...props }: CommandProps): import("react/jsx-runtime").JSX.Element;
export interface CommandInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "defaultValue" | "value"> {
}
export declare const CommandInput: React.ForwardRefExoticComponent<CommandInputProps & React.RefAttributes<HTMLInputElement>>;
export interface CommandListProps extends React.HTMLAttributes<HTMLDivElement> {
}
export declare const CommandList: React.ForwardRefExoticComponent<CommandListProps & React.RefAttributes<HTMLDivElement>>;
export interface CommandEmptyProps extends React.HTMLAttributes<HTMLDivElement> {
}
export declare const CommandEmpty: React.ForwardRefExoticComponent<CommandEmptyProps & React.RefAttributes<HTMLDivElement>>;
export interface CommandGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    readonly heading?: React.ReactNode;
}
export declare const CommandGroup: React.ForwardRefExoticComponent<CommandGroupProps & React.RefAttributes<HTMLDivElement>>;
export interface CommandItemProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value">, CommandItemSharedProps {
    readonly onCommandSelect?: (value: string) => void;
}
export declare const CommandItem: React.ForwardRefExoticComponent<CommandItemProps & React.RefAttributes<HTMLButtonElement>>;
//# sourceMappingURL=command.web.d.ts.map