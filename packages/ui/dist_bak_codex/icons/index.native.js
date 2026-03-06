import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, LayoutGrid, PanelBottom, PanelLeft, PanelRight, PanelTop, Plus, Redo2, Search, Settings, Undo2, LayoutTemplate, Moon, Package, Palette, Sun, Terminal, Columns2, Rows2, Activity, BookOpen, Folder, File, X, } from "lucide-react-native";
import { useTheme } from "../_shared/theme/context";
export const iconMap = {
    add: Plus,
    calendar: CalendarDays,
    check: Check,
    close: X,
    search: Search,
    settings: Settings,
    undo: Undo2,
    redo: Redo2,
    chevronLeft: ChevronLeft,
    chevronRight: ChevronRight,
    chevronDown: ChevronDown,
    chevronUp: ChevronUp,
    panelLeft: PanelLeft,
    panelRight: PanelRight,
    panelTop: PanelTop,
    panelBottom: PanelBottom,
    grid: LayoutGrid,
    layoutTemplate: LayoutTemplate,
    package: Package,
    palette: Palette,
    terminal: Terminal,
    moon: Moon,
    sun: Sun,
    columns: Columns2,
    rows: Rows2,
    layout: LayoutTemplate,
    activity: Activity,
    bookOpen: BookOpen,
    folder: Folder,
    file: File,
};
export function Icon({ color, name, size = 18, strokeWidth = 1.8 }) {
    const theme = useTheme();
    const Component = iconMap[name];
    return (_jsx(Component, { color: color ?? theme.colors.foreground, size: size, strokeWidth: strokeWidth }));
}
export function AddIcon(props) {
    return _jsx(Icon, { name: "add", ...props });
}
export function CloseIcon(props) {
    return _jsx(Icon, { name: "close", ...props });
}
export function CheckIcon(props) {
    return _jsx(Icon, { name: "check", ...props });
}
export function CalendarIcon(props) {
    return _jsx(Icon, { name: "calendar", ...props });
}
export function SearchIcon(props) {
    return _jsx(Icon, { name: "search", ...props });
}
export function GridIcon(props) {
    return _jsx(Icon, { name: "grid", ...props });
}
export function SettingsIcon(props) {
    return _jsx(Icon, { name: "settings", ...props });
}
export function UndoIcon(props) {
    return _jsx(Icon, { name: "undo", ...props });
}
export function RedoIcon(props) {
    return _jsx(Icon, { name: "redo", ...props });
}
export function PanelLeftIcon(props) {
    return _jsx(Icon, { name: "panelLeft", ...props });
}
export function PanelRightIcon(props) {
    return _jsx(Icon, { name: "panelRight", ...props });
}
export function PanelTopIcon(props) {
    return _jsx(Icon, { name: "panelTop", ...props });
}
export function PanelBottomIcon(props) {
    return _jsx(Icon, { name: "panelBottom", ...props });
}
export function ChevronLeftIcon(props) {
    return _jsx(Icon, { name: "chevronLeft", ...props });
}
export function ChevronRightIcon(props) {
    return _jsx(Icon, { name: "chevronRight", ...props });
}
export function ChevronDownIcon(props) {
    return _jsx(Icon, { name: "chevronDown", ...props });
}
export function LayoutTemplateIcon(props) {
    return _jsx(Icon, { name: "layoutTemplate", ...props });
}
export function PackageIcon(props) {
    return _jsx(Icon, { name: "package", ...props });
}
export function PaletteIcon(props) {
    return _jsx(Icon, { name: "palette", ...props });
}
export function TerminalIcon(props) {
    return _jsx(Icon, { name: "terminal", ...props });
}
export function MoonIcon(props) {
    return _jsx(Icon, { name: "moon", ...props });
}
export function SunIcon(props) {
    return _jsx(Icon, { name: "sun", ...props });
}
export function ColumnsIcon(props) {
    return _jsx(Icon, { name: "columns", ...props });
}
export function RowsIcon(props) {
    return _jsx(Icon, { name: "rows", ...props });
}
export function LayoutIcon(props) {
    return _jsx(Icon, { name: "layout", ...props });
}
export function ActivityIcon(props) {
    return _jsx(Icon, { name: "activity", ...props });
}
export function BookOpenIcon(props) {
    return _jsx(Icon, { name: "bookOpen", ...props });
}
export function FolderIcon(props) {
    return _jsx(Icon, { name: "folder", ...props });
}
export function FileIcon(props) {
    return _jsx(Icon, { name: "file", ...props });
}
