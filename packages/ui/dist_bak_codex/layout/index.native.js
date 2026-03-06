import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { H3, Muted } from "../typography/typography.native";
import { Inline, ScrollArea, Stack, Surface } from "../primitives/index.native";
export function AppShell({ children, header, sidebar }) {
    return (_jsxs(Stack, { grow: true, background: "background", foreground: "foreground", style: { flex: 1 }, children: [header ? _jsx(Surface, { tone: "raised", border: false, padding: "md", children: header }) : null, _jsxs(Inline, { grow: true, style: { flex: 1 }, children: [sidebar ? (_jsx(Surface, { tone: "muted", border: false, padding: "md", width: 248, style: { flexShrink: 0 }, children: sidebar })) : null, _jsx(ScrollArea, { grow: true, contentContainerStyle: { minHeight: "100%" }, style: { flex: 1 }, children: children })] })] }));
}
export function Pane(props) {
    return _jsx(Surface, { tone: "default", padding: "lg", ...props });
}
export function Section({ actions, children, description, title }) {
    return (_jsxs(Stack, { gap: "lg", children: [title || description || actions ? (_jsxs(Inline, { justify: "space-between", align: "center", gap: "md", wrap: true, children: [_jsxs(Stack, { gap: "xs", children: [title ? _jsx(H3, { children: title }) : null, description ? _jsx(Muted, { children: description }) : null] }), actions] })) : null, children] }));
}
export function PanelFrame({ actions, children, description, title }) {
    return (_jsx(Surface, { tone: "raised", padding: "lg", gap: "md", children: _jsx(Section, { title: title, description: description, actions: actions, children: children }) }));
}
export { ScrollArea } from "../primitives/index.native";
