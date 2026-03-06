import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { Pressable, View, } from "react-native";
import { useTheme } from "../_shared/theme/context";
import { useControllableState } from "../hooks/useControllableState";
export const Slider = React.forwardRef(({ defaultValue = [50], max = 100, min = 0, onValueChange, step = 1, style, value, ...props }, ref) => {
    const theme = useTheme();
    const [currentValue, setCurrentValue] = useControllableState({
        defaultValue,
        onChange: onValueChange,
        value,
    });
    const [trackWidth, setTrackWidth] = React.useState(0);
    const numericValue = currentValue[0] ?? min;
    const percentage = ((numericValue - min) / (max - min || 1)) * 100;
    const updateFromOffset = (offsetX) => {
        if (trackWidth <= 0) {
            return;
        }
        const ratio = Math.min(1, Math.max(0, offsetX / trackWidth));
        const raw = min + ratio * (max - min);
        const snapped = Math.round(raw / step) * step;
        setCurrentValue([Math.min(max, Math.max(min, snapped))]);
    };
    return (_jsx(Pressable, { ref: ref, accessibilityRole: "adjustable", onPress: (event) => updateFromOffset(event.nativeEvent.locationX), style: [{ height: 40, justifyContent: "center" }, style], ...props, children: _jsxs(View, { onLayout: (event) => setTrackWidth(event.nativeEvent.layout.width), style: { height: 8, borderRadius: 999, backgroundColor: theme.colors.secondaryMuted }, children: [_jsx(View, { style: {
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: `${percentage}%`,
                        borderRadius: 999,
                        backgroundColor: theme.colors.primary,
                    } }), _jsx(View, { style: {
                        position: "absolute",
                        top: -6,
                        left: `${percentage}%`,
                        width: 20,
                        height: 20,
                        marginLeft: -10,
                        borderRadius: 999,
                        borderWidth: 1,
                        borderColor: theme.colors.borderStrong,
                        backgroundColor: theme.colors.surface,
                    } })] }) }));
});
Slider.displayName = "Slider";
