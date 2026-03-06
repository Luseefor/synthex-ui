import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { View } from "react-native";
export const AspectRatio = React.forwardRef(({ children, ratio = 16 / 9, style, ...props }, ref) => (_jsx(View, { ref: ref, style: [{ width: "100%", aspectRatio: ratio, overflow: "hidden" }, style], ...props, children: _jsx(View, { style: { flex: 1 }, children: children }) })));
AspectRatio.displayName = "AspectRatio";
