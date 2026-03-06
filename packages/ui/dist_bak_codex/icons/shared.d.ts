export declare const iconNames: readonly ["add", "calendar", "check", "close", "search", "settings", "undo", "redo", "chevronLeft", "chevronRight", "chevronDown", "chevronUp", "panelLeft", "panelRight", "panelTop", "panelBottom", "grid", "layoutTemplate", "package", "palette", "terminal", "moon", "sun", "columns", "rows", "layout", "activity", "bookOpen", "folder", "file"];
export type IconName = (typeof iconNames)[number];
export interface IconProps {
    readonly className?: string;
    readonly color?: string;
    readonly name: IconName;
    readonly size?: number;
    readonly strokeWidth?: number;
}
//# sourceMappingURL=shared.d.ts.map