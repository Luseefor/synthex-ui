import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { Animated, Easing, Linking, Pressable, ScrollView, Text, View, } from "react-native";
import { useTheme } from "../_shared/theme/context";
import { Button } from "../button/button.native";
import { Card, CardContent, CardHeader, CardTitle } from "../card/card.native";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../form/form.native";
import { useControllableState } from "../hooks/useControllableState";
import { useReducedMotion } from "../hooks/useReducedMotion.native";
import { Input } from "../input/input.native";
import { Textarea } from "../textarea/textarea.native";
import { defaultThemeAccent, getCadenceMax, themeAccentPresets } from "./synthex.shared";
function Reveal({ children, delay = 0, duration = 240, reducedMotion, style, }) {
    const opacity = React.useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;
    const translateY = React.useRef(new Animated.Value(reducedMotion ? 0 : 12)).current;
    React.useEffect(() => {
        if (reducedMotion) {
            opacity.setValue(1);
            translateY.setValue(0);
            return;
        }
        const animation = Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration,
                delay,
                easing: Easing.bezier(0.16, 1, 0.3, 1),
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration,
                delay,
                easing: Easing.bezier(0.16, 1, 0.3, 1),
                useNativeDriver: true,
            }),
        ]);
        animation.start();
        return () => {
            animation.stop();
        };
    }, [delay, duration, opacity, reducedMotion, translateY]);
    return (_jsx(Animated.View, { style: [
            {
                opacity,
                transform: [{ translateY }],
            },
            style,
        ], children: children }));
}
function toDelay(index, baseDelay = 0) {
    return baseDelay + index * 70;
}
const THEME_ACCENT_ORDER = ["steel", "stone", "bronze", "mulberry"];
export const ThemeAccentSwitcher = React.forwardRef(({ accent, compact = false, defaultAccent = defaultThemeAccent, defaultMode = "dark", defaultOpen = false, mode, onAccentChange, onModeChange, onOpenChange, open, style, title = "Theme", ...props }, ref) => {
    const theme = useTheme();
    const reducedMotion = useReducedMotion();
    const [currentAccent, setCurrentAccent] = useControllableState({
        defaultValue: defaultAccent,
        onChange: onAccentChange,
        value: accent,
    });
    const [currentMode, setCurrentMode] = useControllableState({
        defaultValue: defaultMode,
        onChange: onModeChange,
        value: mode,
    });
    const [isOpen, setIsOpen] = useControllableState({
        defaultValue: defaultOpen,
        onChange: onOpenChange,
        value: open,
    });
    const selected = themeAccentPresets[currentAccent] ?? themeAccentPresets[defaultThemeAccent];
    const triggerHeight = compact ? 36 : 38;
    return (_jsxs(View, { ref: ref, style: [{ position: "relative", alignItems: "flex-end" }, style], ...props, children: [_jsxs(Pressable, { accessibilityRole: "button", accessibilityLabel: "Theme switcher", accessibilityState: { expanded: isOpen }, onPress: () => setIsOpen(!isOpen), style: ({ pressed }) => ({
                    minHeight: compact ? 36 : 38,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.surface,
                    paddingHorizontal: compact ? 10 : 12,
                    paddingVertical: 6,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                }), children: [_jsx(View, { style: {
                            width: 10,
                            height: 10,
                            borderRadius: 999,
                            backgroundColor: selected.swatch,
                        } }), !compact ? (_jsx(Text, { style: {
                            color: theme.colors.foregroundMuted,
                            fontSize: theme.typography.size.xs,
                            fontWeight: theme.typography.weight.semibold,
                            textTransform: "uppercase",
                            letterSpacing: 0.8,
                        }, children: selected.label })) : null, _jsx(View, { style: {
                            height: 18,
                            minWidth: 18,
                            borderRadius: 999,
                            borderWidth: 1,
                            borderColor: theme.colors.border,
                            backgroundColor: theme.colors.surfaceMuted,
                            alignItems: "center",
                            justifyContent: "center",
                            paddingHorizontal: 4,
                        }, children: _jsx(Text, { style: {
                                color: theme.colors.foregroundMuted,
                                fontSize: 9,
                                fontWeight: theme.typography.weight.semibold,
                            }, children: "FX" }) })] }), isOpen ? (_jsx(View, { pointerEvents: "box-none", style: {
                    position: "absolute",
                    right: 0,
                    bottom: triggerHeight + 10,
                    zIndex: 30,
                }, children: _jsx(Reveal, { reducedMotion: reducedMotion, duration: 260, children: _jsxs(View, { style: {
                            width: 312,
                            maxWidth: 312,
                            maxHeight: 360,
                            borderRadius: theme.radius.xl + 4,
                            borderWidth: 1,
                            borderColor: theme.colors.borderStrong,
                            backgroundColor: theme.colors.backgroundSubtle,
                            padding: 14,
                            gap: 14,
                            shadowColor: "#020617",
                            shadowOpacity: 0.3,
                            shadowRadius: 18,
                            shadowOffset: { width: 0, height: 8 },
                            elevation: 7,
                        }, children: [_jsxs(View, { style: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 }, children: [_jsx(Text, { style: {
                                            color: theme.colors.foregroundMuted,
                                            fontSize: theme.typography.size.xs,
                                            fontWeight: theme.typography.weight.semibold,
                                            textTransform: "uppercase",
                                            letterSpacing: 0.8,
                                        }, children: title }), _jsx(Text, { style: {
                                            color: theme.colors.foregroundMuted,
                                            fontSize: theme.typography.size.xs,
                                            textTransform: "uppercase",
                                            letterSpacing: 0.6,
                                        }, children: selected.label })] }), _jsxs(View, { style: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 }, children: [_jsx(Text, { style: {
                                            color: theme.colors.foregroundMuted,
                                            fontSize: theme.typography.size.xs,
                                            textTransform: "uppercase",
                                            letterSpacing: 0.7,
                                        }, children: "Appearance" }), _jsxs(View, { style: {
                                            flexDirection: "row",
                                            alignItems: "center",
                                            gap: 4,
                                            borderRadius: 999,
                                            borderWidth: 1,
                                            borderColor: theme.colors.border,
                                            backgroundColor: theme.colors.surface,
                                            padding: 4,
                                        }, children: [_jsx(Pressable, { onPress: () => setCurrentMode("light"), style: ({ pressed }) => ({
                                                    minHeight: 28,
                                                    minWidth: 56,
                                                    borderRadius: 999,
                                                    paddingHorizontal: 8,
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    backgroundColor: currentMode === "light" ? theme.colors.primaryMuted : "transparent",
                                                    opacity: pressed ? 0.9 : 1,
                                                }), children: _jsx(Text, { style: {
                                                        color: currentMode === "light" ? theme.colors.foreground : theme.colors.foregroundMuted,
                                                        fontSize: theme.typography.size.xs,
                                                        fontWeight: theme.typography.weight.medium,
                                                    }, children: "Light" }) }), _jsx(Pressable, { onPress: () => setCurrentMode("dark"), style: ({ pressed }) => ({
                                                    minHeight: 28,
                                                    minWidth: 56,
                                                    borderRadius: 999,
                                                    paddingHorizontal: 8,
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    backgroundColor: currentMode === "dark" ? theme.colors.primaryMuted : "transparent",
                                                    opacity: pressed ? 0.9 : 1,
                                                }), children: _jsx(Text, { style: {
                                                        color: currentMode === "dark" ? theme.colors.foreground : theme.colors.foregroundMuted,
                                                        fontSize: theme.typography.size.xs,
                                                        fontWeight: theme.typography.weight.medium,
                                                    }, children: "Dark" }) })] })] }), _jsxs(View, { style: { gap: 8 }, children: [_jsx(Text, { style: {
                                            color: theme.colors.foregroundMuted,
                                            fontSize: theme.typography.size.xs,
                                            textTransform: "uppercase",
                                            letterSpacing: 0.7,
                                        }, children: "Accent" }), _jsx(View, { style: { flexDirection: "row", alignItems: "center", gap: 8 }, children: THEME_ACCENT_ORDER.map((accentId, index) => {
                                            const preset = themeAccentPresets[accentId];
                                            const isActive = currentAccent === accentId;
                                            return (_jsx(Reveal, { reducedMotion: reducedMotion, delay: toDelay(index, 30), duration: 220, children: _jsx(Pressable, { accessibilityRole: "button", accessibilityLabel: preset.label, onPress: () => setCurrentAccent(accentId), style: ({ pressed }) => ({
                                                        width: 36,
                                                        height: 36,
                                                        borderRadius: theme.radius.md + 2,
                                                        borderWidth: 1,
                                                        borderColor: isActive ? theme.colors.primary : theme.colors.border,
                                                        backgroundColor: theme.colors.surface,
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        opacity: pressed ? 0.88 : 1,
                                                        transform: [{ scale: pressed ? 0.96 : 1 }],
                                                    }), children: _jsx(View, { style: {
                                                            width: 16,
                                                            height: 16,
                                                            borderRadius: 999,
                                                            backgroundColor: preset.swatch,
                                                        } }) }) }, accentId));
                                        }) })] })] }) }) })) : null] }));
});
ThemeAccentSwitcher.displayName = "ThemeAccentSwitcher";
export const AssistantChatPanel = React.forwardRef(({ actions, composerLabel = "Prompt", defaultValue = "", description = "Keep the conversation moving with a ready-made assistant shell.", emptyState = "No messages yet. Start with a prompt.", messages, onSubmit, onValueChange, placeholder = "Ask the assistant to draft, analyze, or plan...", submitLabel = "Send", style, title = "Assistant", value, ...props }, ref) => {
    const theme = useTheme();
    const reducedMotion = useReducedMotion();
    const [composerValue, setComposerValue] = useControllableState({
        defaultValue,
        onChange: onValueChange,
        value,
    });
    return (_jsxs(Card, { ref: ref, variant: "elevated", style: [
            {
                minHeight: 540,
                borderColor: theme.colors.borderStrong,
                backgroundColor: theme.colors.surfaceRaised,
            },
            style,
        ], ...props, children: [_jsx(CardHeader, { style: {
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.border,
                    backgroundColor: theme.colors.surface,
                }, children: _jsxs(View, { style: { flexDirection: "row", justifyContent: "space-between", gap: 16 }, children: [_jsxs(View, { style: { flex: 1, gap: 4 }, children: [_jsx(CardTitle, { children: title }), description ? (_jsx(Text, { style: { color: theme.colors.foregroundMuted, lineHeight: 22 }, children: description })) : null] }), actions] }) }), _jsxs(CardContent, { style: { flex: 1, gap: 16, paddingTop: 20 }, children: [_jsx(View, { style: {
                            flex: 1,
                            borderRadius: theme.radius.xl,
                            borderWidth: 1,
                            borderColor: theme.colors.border,
                            backgroundColor: theme.colors.surfaceMuted,
                            padding: 10,
                        }, children: messages.length === 0 ? (_jsx(Reveal, { reducedMotion: reducedMotion, children: _jsx(View, { style: {
                                    minHeight: 180,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderWidth: 1,
                                    borderStyle: "dashed",
                                    borderColor: theme.colors.border,
                                    borderRadius: theme.radius.xl,
                                    backgroundColor: theme.colors.surface,
                                    paddingHorizontal: 24,
                                }, children: _jsx(Text, { style: { color: theme.colors.foregroundMuted, textAlign: "center" }, children: emptyState }) }) })) : (_jsx(ScrollView, { contentContainerStyle: { gap: 12, paddingRight: 4 }, showsVerticalScrollIndicator: false, children: messages.map((message, index) => {
                                const isUser = message.role === "user";
                                const isSystem = message.role === "system";
                                return (_jsx(Reveal, { reducedMotion: reducedMotion, delay: toDelay(index), children: _jsx(View, { style: { alignItems: isUser ? "flex-end" : "flex-start" }, children: _jsxs(View, { style: {
                                                maxWidth: "90%",
                                                borderRadius: theme.radius.xl + 6,
                                                borderWidth: isUser ? 0 : 1,
                                                borderColor: isSystem ? theme.colors.accent : theme.colors.border,
                                                backgroundColor: isUser
                                                    ? theme.colors.primary
                                                    : isSystem
                                                        ? theme.colors.accentMuted
                                                        : theme.colors.surface,
                                                paddingHorizontal: 16,
                                                paddingVertical: 12,
                                                shadowColor: "#0f172a",
                                                shadowOpacity: isUser ? 0.22 : 0.1,
                                                shadowRadius: 12,
                                                shadowOffset: { width: 0, height: 4 },
                                                elevation: isUser ? 4 : 2,
                                            }, children: [(message.author || message.meta) ? (_jsxs(View, { style: {
                                                        marginBottom: 8,
                                                        flexDirection: "row",
                                                        justifyContent: "space-between",
                                                        gap: 12,
                                                    }, children: [_jsx(Text, { style: {
                                                                color: isUser
                                                                    ? theme.colors.foregroundOnBrand
                                                                    : theme.colors.foregroundMuted,
                                                                fontSize: theme.typography.size.xs,
                                                                fontWeight: theme.typography.weight.medium,
                                                                textTransform: "uppercase",
                                                                letterSpacing: 0.6,
                                                            }, children: message.author ?? message.role }), message.meta ? (_jsx(Text, { style: {
                                                                color: isUser
                                                                    ? theme.colors.foregroundOnBrand
                                                                    : theme.colors.foregroundMuted,
                                                                fontSize: theme.typography.size.xs,
                                                            }, children: message.meta })) : null] })) : null, _jsx(Text, { style: {
                                                        color: isUser
                                                            ? theme.colors.foregroundOnBrand
                                                            : theme.colors.foreground,
                                                        lineHeight: 22,
                                                    }, children: message.content })] }) }) }, message.id));
                            }) })) }), _jsx(Reveal, { reducedMotion: reducedMotion, delay: 90, children: _jsx(View, { style: {
                                borderRadius: theme.radius.xl,
                                borderWidth: 1,
                                borderColor: theme.colors.border,
                                backgroundColor: theme.colors.surface,
                                padding: 12,
                            }, children: _jsxs(Form, { children: [_jsx(FormField, { name: "assistantPrompt", children: _jsxs(FormItem, { children: [_jsxs(View, { style: { flexDirection: "row", justifyContent: "space-between", gap: 12 }, children: [_jsx(FormLabel, { children: composerLabel }), _jsx(Text, { style: {
                                                                color: theme.colors.foregroundMuted,
                                                                fontSize: theme.typography.size.xs,
                                                                textTransform: "uppercase",
                                                                letterSpacing: 0.7,
                                                            }, children: "Composer" })] }), _jsx(FormControl, { children: _jsx(Textarea, { value: composerValue, placeholder: placeholder, onChangeText: setComposerValue }) }), _jsx(FormMessage, {})] }) }), _jsx(View, { style: { alignItems: "flex-end" }, children: _jsx(Button, { onPress: () => {
                                                const nextValue = composerValue.trim();
                                                if (!nextValue) {
                                                    return;
                                                }
                                                onSubmit?.(nextValue);
                                                setComposerValue("");
                                            }, children: submitLabel }) })] }) }) })] })] }));
});
AssistantChatPanel.displayName = "AssistantChatPanel";
export const FloatingAssistantLauncher = React.forwardRef(({ badge, children, defaultOpen = false, description = "Launch your assistant workspace.", label = "AI", onOpenChange, open, style, title = "Assistant dock", ...props }, ref) => {
    const theme = useTheme();
    const reducedMotion = useReducedMotion();
    const [isOpen, setIsOpen] = useControllableState({
        defaultValue: defaultOpen,
        onChange: onOpenChange,
        value: open,
    });
    const pulse = React.useRef(new Animated.Value(0)).current;
    const badgeBob = React.useRef(new Animated.Value(0)).current;
    React.useEffect(() => {
        if (reducedMotion) {
            pulse.setValue(0);
            return;
        }
        const loop = Animated.loop(Animated.sequence([
            Animated.timing(pulse, {
                toValue: 1,
                duration: 1200,
                easing: Easing.inOut(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(pulse, {
                toValue: 0,
                duration: 1200,
                easing: Easing.inOut(Easing.cubic),
                useNativeDriver: true,
            }),
        ]));
        loop.start();
        return () => {
            loop.stop();
        };
    }, [pulse, reducedMotion]);
    React.useEffect(() => {
        if (reducedMotion) {
            badgeBob.setValue(0);
            return;
        }
        const loop = Animated.loop(Animated.sequence([
            Animated.timing(badgeBob, {
                toValue: 1,
                duration: 900,
                easing: Easing.inOut(Easing.quad),
                useNativeDriver: true,
            }),
            Animated.timing(badgeBob, {
                toValue: 0,
                duration: 900,
                easing: Easing.inOut(Easing.quad),
                useNativeDriver: true,
            }),
        ]));
        loop.start();
        return () => {
            loop.stop();
        };
    }, [badgeBob, reducedMotion]);
    return (_jsxs(View, { ref: ref, style: [{ alignItems: "flex-end", gap: 12 }, style], ...props, children: [isOpen && children ? (_jsx(Reveal, { reducedMotion: reducedMotion, duration: 280, children: _jsxs(Card, { style: {
                        width: 320,
                        maxWidth: "100%",
                        borderColor: theme.colors.borderStrong,
                        backgroundColor: theme.colors.surfaceRaised,
                        shadowColor: "#0f172a",
                        shadowOpacity: 0.14,
                        shadowRadius: 20,
                        shadowOffset: { width: 0, height: 8 },
                        elevation: 6,
                    }, children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { style: { fontSize: theme.typography.size.md }, children: title }), _jsx(Text, { style: { color: theme.colors.foregroundMuted, lineHeight: 22 }, children: description })] }), _jsx(CardContent, { children: children })] }) })) : null, _jsxs(View, { style: { position: "relative" }, children: [_jsx(Animated.View, { pointerEvents: "none", style: {
                            position: "absolute",
                            top: -2,
                            right: -2,
                            bottom: -2,
                            left: -2,
                            borderRadius: 999,
                            borderWidth: 1,
                            borderColor: theme.colors.primary,
                            opacity: reducedMotion
                                ? 0
                                : pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0.08] }),
                            transform: [
                                {
                                    scale: reducedMotion
                                        ? 1
                                        : pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }),
                                },
                            ],
                        } }), _jsxs(Pressable, { accessibilityRole: "button", accessibilityState: { expanded: isOpen }, onPress: () => {
                            setIsOpen(!isOpen);
                        }, style: ({ pressed }) => ({
                            minHeight: 56,
                            minWidth: 56,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            borderRadius: 999,
                            borderWidth: 1,
                            borderColor: theme.colors.borderStrong,
                            backgroundColor: theme.colors.primary,
                            paddingHorizontal: 20,
                            opacity: pressed ? 0.9 : 1,
                            transform: [{ scale: pressed ? 0.98 : 1 }],
                        }), children: [_jsx(Text, { style: {
                                    color: theme.colors.foregroundOnBrand,
                                    fontWeight: theme.typography.weight.semibold,
                                }, children: label }), badge ? (_jsx(Animated.View, { style: {
                                    borderRadius: 999,
                                    backgroundColor: "rgba(255,255,255,0.2)",
                                    paddingHorizontal: 8,
                                    paddingVertical: 2,
                                    transform: [
                                        {
                                            translateY: reducedMotion
                                                ? 0
                                                : badgeBob.interpolate({ inputRange: [0, 1], outputRange: [0, -2] }),
                                        },
                                    ],
                                }, children: _jsx(Text, { style: {
                                        color: theme.colors.foregroundOnBrand,
                                        fontSize: theme.typography.size.xs,
                                    }, children: badge }) })) : null] })] })] }));
});
FloatingAssistantLauncher.displayName = "FloatingAssistantLauncher";
function CadenceBar({ delay, heightPercent, reducedMotion, themePrimary, }) {
    const scaleY = React.useRef(new Animated.Value(reducedMotion ? 1 : 0.16)).current;
    React.useEffect(() => {
        if (reducedMotion) {
            scaleY.setValue(1);
            return;
        }
        const animation = Animated.timing(scaleY, {
            toValue: 1,
            duration: 360,
            delay,
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            useNativeDriver: true,
        });
        animation.start();
        return () => {
            animation.stop();
        };
    }, [delay, reducedMotion, scaleY]);
    return (_jsx(Animated.View, { style: {
            width: "100%",
            minHeight: 14,
            height: heightPercent,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: themePrimary,
            backgroundColor: themePrimary,
            transform: [{ scaleY }],
        } }));
}
export const CadenceBarChart = React.forwardRef(({ data, description = "Past 14 days", style, title = "Cadence", valueFormatter = (value) => `${value}`, ...props }, ref) => {
    const theme = useTheme();
    const reducedMotion = useReducedMotion();
    const maxValue = getCadenceMax(data);
    return (_jsxs(Card, { ref: ref, style: [
            {
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
            },
            style,
        ], ...props, children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { style: { fontSize: theme.typography.size.md }, children: title }), _jsx(Text, { style: { color: theme.colors.foregroundMuted }, children: description })] }), _jsx(CardContent, { children: _jsx(View, { style: { flexDirection: "row", alignItems: "flex-end", gap: 8 }, children: data.map((entry, index) => (_jsxs(Reveal, { reducedMotion: reducedMotion, delay: toDelay(index, 90), style: { flex: 1, alignItems: "center", gap: 8 }, children: [_jsx(View, { style: { height: 112, width: "100%", justifyContent: "flex-end" }, children: _jsx(CadenceBar, { delay: toDelay(index, 120), reducedMotion: reducedMotion, heightPercent: `${Math.max(12, (entry.value / maxValue) * 100)}%`, themePrimary: theme.colors.primary }) }), _jsx(Text, { style: { fontSize: theme.typography.size.xs, color: theme.colors.foreground }, children: valueFormatter(entry.value) }), _jsx(Text, { style: {
                                    fontSize: theme.typography.size.xs,
                                    color: theme.colors.foregroundMuted,
                                    textTransform: "uppercase",
                                    letterSpacing: 0.5,
                                }, children: entry.label })] }, entry.id ?? entry.label))) }) })] }));
});
CadenceBarChart.displayName = "CadenceBarChart";
export const Marquee = React.forwardRef(({ items, speed = "normal", style, ...props }, ref) => {
    const theme = useTheme();
    const reducedMotion = useReducedMotion();
    const drift = React.useRef(new Animated.Value(0)).current;
    const loopItems = [...items, ...items];
    const duration = speed === "slow" ? 2400 : speed === "fast" ? 1200 : 1800;
    React.useEffect(() => {
        if (reducedMotion) {
            drift.setValue(0);
            return;
        }
        const loop = Animated.loop(Animated.sequence([
            Animated.timing(drift, {
                toValue: -24,
                duration,
                easing: Easing.inOut(Easing.quad),
                useNativeDriver: true,
            }),
            Animated.timing(drift, {
                toValue: 0,
                duration,
                easing: Easing.inOut(Easing.quad),
                useNativeDriver: true,
            }),
        ]));
        loop.start();
        return () => {
            loop.stop();
        };
    }, [drift, duration, reducedMotion]);
    return (_jsx(View, { ref: ref, style: [
            {
                borderRadius: theme.radius.xl + 2,
                borderWidth: 1,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surfaceMuted,
                overflow: "hidden",
                paddingVertical: 10,
            },
            style,
        ], ...props, children: _jsx(ScrollView, { horizontal: true, showsHorizontalScrollIndicator: false, children: _jsx(Animated.View, { style: {
                    flexDirection: "row",
                    gap: 10,
                    paddingHorizontal: 10,
                    transform: [{ translateX: drift }],
                }, children: loopItems.map((item, index) => (_jsx(Reveal, { reducedMotion: reducedMotion, delay: toDelay(index, 40), children: _jsxs(View, { style: {
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                            borderRadius: 999,
                            borderWidth: 1,
                            borderColor: theme.colors.border,
                            backgroundColor: theme.colors.surface,
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            shadowColor: "#0f172a",
                            shadowOpacity: 0.06,
                            shadowRadius: 8,
                            shadowOffset: { width: 0, height: 3 },
                            elevation: 2,
                        }, children: [_jsx(Text, { style: {
                                    color: theme.colors.foreground,
                                    fontWeight: theme.typography.weight.medium,
                                }, children: item.label }), item.meta ? (_jsx(Text, { style: {
                                    color: theme.colors.foregroundMuted,
                                    fontSize: theme.typography.size.xs,
                                    textTransform: "uppercase",
                                    letterSpacing: 0.5,
                                }, children: item.meta })) : null] }) }, `${item.id}-${index}`))) }) }) }));
});
Marquee.displayName = "Marquee";
export const KPIStatGrid = React.forwardRef(({ columns = 2, stats, style, ...props }, ref) => {
    const theme = useTheme();
    const reducedMotion = useReducedMotion();
    const width = `${100 / columns}%`;
    return (_jsx(View, { ref: ref, style: [{ flexDirection: "row", flexWrap: "wrap", gap: 12 }, style], ...props, children: stats.map((stat, index) => (_jsx(Reveal, { reducedMotion: reducedMotion, delay: toDelay(index, 70), style: { width, paddingRight: 12 }, children: _jsx(Card, { style: {
                    backgroundColor: stat.tone === "accent"
                        ? theme.colors.accentMuted
                        : stat.tone === "positive"
                            ? theme.colors.primaryMuted
                            : stat.tone === "warning"
                                ? theme.colors.secondaryMuted
                                : theme.colors.surface,
                    borderColor: theme.colors.border,
                    shadowColor: "#0f172a",
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: 5 },
                    elevation: 3,
                }, children: _jsxs(CardContent, { style: { gap: 10, paddingTop: 24 }, children: [_jsx(Text, { style: {
                                color: theme.colors.foregroundMuted,
                                fontSize: theme.typography.size.xs,
                                textTransform: "uppercase",
                                letterSpacing: 0.6,
                            }, children: stat.label }), _jsx(Text, { style: {
                                color: theme.colors.foreground,
                                fontSize: theme.typography.size["2xl"],
                                fontWeight: theme.typography.weight.semibold,
                            }, children: stat.value }), (stat.change || stat.detail) ? (_jsxs(View, { style: { flexDirection: "row", justifyContent: "space-between", gap: 12 }, children: [stat.change ? (_jsx(Text, { style: { color: theme.colors.foreground, fontWeight: theme.typography.weight.medium }, children: stat.change })) : null, stat.detail ? _jsx(Text, { style: { color: theme.colors.foregroundMuted }, children: stat.detail }) : null] })) : null] }) }) }, stat.id))) }));
});
KPIStatGrid.displayName = "KPIStatGrid";
export const TimelineRow = React.forwardRef(({ date, organization, style, summary, tags, title, ...props }, ref) => {
    const theme = useTheme();
    const reducedMotion = useReducedMotion();
    const markerPulse = React.useRef(new Animated.Value(0)).current;
    React.useEffect(() => {
        if (reducedMotion) {
            markerPulse.setValue(0);
            return;
        }
        const loop = Animated.loop(Animated.sequence([
            Animated.timing(markerPulse, {
                toValue: 1,
                duration: 1400,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
            Animated.timing(markerPulse, {
                toValue: 0,
                duration: 800,
                easing: Easing.in(Easing.quad),
                useNativeDriver: true,
            }),
        ]));
        loop.start();
        return () => {
            loop.stop();
        };
    }, [markerPulse, reducedMotion]);
    return (_jsxs(View, { ref: ref, style: [{ flexDirection: "row", gap: 16 }, style], ...props, children: [_jsxs(View, { style: { width: 100, gap: 8 }, children: [_jsx(Text, { style: {
                            color: theme.colors.foregroundMuted,
                            fontSize: theme.typography.size.xs,
                            textTransform: "uppercase",
                            letterSpacing: 0.6,
                        }, children: date }), _jsxs(View, { style: { alignItems: "center", justifyContent: "center" }, children: [_jsx(Animated.View, { pointerEvents: "none", style: {
                                    position: "absolute",
                                    height: 18,
                                    width: 18,
                                    borderRadius: 999,
                                    borderWidth: 1,
                                    borderColor: theme.colors.primary,
                                    opacity: reducedMotion
                                        ? 0
                                        : markerPulse.interpolate({ inputRange: [0, 1], outputRange: [0.36, 0.06] }),
                                    transform: [
                                        {
                                            scale: reducedMotion
                                                ? 1
                                                : markerPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] }),
                                        },
                                    ],
                                } }), _jsx(Animated.View, { style: {
                                    height: 10,
                                    width: 10,
                                    borderRadius: 999,
                                    backgroundColor: theme.colors.primary,
                                    shadowColor: theme.colors.primary,
                                    shadowOpacity: 0.35,
                                    shadowRadius: 10,
                                    shadowOffset: { width: 0, height: 0 },
                                    transform: [
                                        {
                                            scale: reducedMotion
                                                ? 1
                                                : markerPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }),
                                        },
                                    ],
                                } })] })] }), _jsxs(View, { style: {
                    flex: 1,
                    gap: 10,
                    borderLeftWidth: 1,
                    borderLeftColor: theme.colors.border,
                    paddingLeft: 16,
                }, children: [_jsx(Text, { style: {
                            color: theme.colors.foreground,
                            fontSize: theme.typography.size.lg,
                            fontWeight: theme.typography.weight.semibold,
                        }, children: title }), organization ? _jsx(Text, { style: { color: theme.colors.foregroundMuted }, children: organization }) : null, summary ? _jsx(Text, { style: { color: theme.colors.foregroundMuted, lineHeight: 22 }, children: summary }) : null, tags?.length ? (_jsx(View, { style: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, children: tags.map((tag, index) => (_jsx(View, { style: {
                                borderRadius: 999,
                                borderWidth: 1,
                                borderColor: theme.colors.border,
                                backgroundColor: theme.colors.surface,
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                            }, children: _jsx(Text, { style: { color: theme.colors.foregroundMuted, fontSize: theme.typography.size.xs }, children: tag }) }, `${String(tag)}-${index}`))) })) : null] })] }));
});
TimelineRow.displayName = "TimelineRow";
export const ExperienceTimeline = React.forwardRef(({ description, entries, style, title = "Experience", ...props }, ref) => {
    const theme = useTheme();
    const reducedMotion = useReducedMotion();
    return (_jsxs(Card, { ref: ref, style: [
            {
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
            },
            style,
        ], ...props, children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: title }), description ? _jsx(Text, { style: { color: theme.colors.foregroundMuted }, children: description }) : null] }), _jsx(CardContent, { style: { gap: 24 }, children: entries.map((entry, index) => (_jsx(Reveal, { reducedMotion: reducedMotion, delay: toDelay(index, 80), children: _jsx(TimelineRow, { ...entry }) }, entry.id))) })] }));
});
ExperienceTimeline.displayName = "ExperienceTimeline";
export const ProjectCaseRow = React.forwardRef(({ category, ctaLabel = "Read case", href, index, metrics, style, summary, title, ...props }, ref) => {
    const theme = useTheme();
    const reducedMotion = useReducedMotion();
    return (_jsxs(View, { ref: ref, style: [
            {
                gap: 16,
                borderTopWidth: 1,
                borderTopColor: theme.colors.border,
                paddingVertical: 24,
            },
            style,
        ], ...props, children: [_jsx(Reveal, { reducedMotion: reducedMotion, delay: 40, children: _jsx(View, { style: {
                        height: 56,
                        width: 56,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 999,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                        backgroundColor: theme.colors.surfaceMuted,
                    }, children: _jsx(Text, { style: {
                            color: theme.colors.foregroundMuted,
                            fontSize: theme.typography.size["2xl"],
                            fontWeight: theme.typography.weight.semibold,
                        }, children: String(index).padStart(2, "0") }) }) }), category ? (_jsx(Reveal, { reducedMotion: reducedMotion, delay: 80, children: _jsx(Text, { style: {
                        color: theme.colors.foregroundMuted,
                        fontSize: theme.typography.size.xs,
                        textTransform: "uppercase",
                        letterSpacing: 0.7,
                    }, children: category }) })) : null, _jsx(Reveal, { reducedMotion: reducedMotion, delay: 100, children: _jsx(Text, { style: {
                        color: theme.colors.foreground,
                        fontSize: theme.typography.size.xl,
                        fontWeight: theme.typography.weight.semibold,
                    }, children: title }) }), summary ? (_jsx(Reveal, { reducedMotion: reducedMotion, delay: 120, children: _jsx(Text, { style: { color: theme.colors.foregroundMuted, lineHeight: 22 }, children: summary }) })) : null, metrics?.length ? (_jsx(View, { style: { gap: 8 }, children: metrics.map((metric, metricIndex) => (_jsx(Reveal, { reducedMotion: reducedMotion, delay: toDelay(metricIndex, 140), children: _jsxs(View, { style: {
                            flexDirection: "row",
                            justifyContent: "space-between",
                            gap: 12,
                            borderRadius: theme.radius.lg,
                            borderWidth: 1,
                            borderColor: theme.colors.border,
                            backgroundColor: theme.colors.surfaceMuted,
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                        }, children: [_jsx(Text, { style: { color: theme.colors.foregroundMuted, fontSize: theme.typography.size.xs }, children: metric.label }), _jsx(Text, { style: { color: theme.colors.foreground, fontWeight: theme.typography.weight.semibold }, children: metric.value })] }) }, `${String(metric.label)}-${metricIndex}`))) })) : null, href ? (_jsx(Reveal, { reducedMotion: reducedMotion, delay: 180, children: _jsx(Button, { variant: "outline", onPress: () => {
                        void Linking.openURL(href);
                    }, children: ctaLabel }) })) : null] }));
});
ProjectCaseRow.displayName = "ProjectCaseRow";
export const ContactSplitForm = React.forwardRef(({ channels, defaultEmail = "", defaultMessage = "", defaultName = "", description = "Put channel context on the left and a contact form on the right.", onSubmit, style, submitLabel = "Send inquiry", title = "Contact", ...props }, ref) => {
    const theme = useTheme();
    const reducedMotion = useReducedMotion();
    const [name, setName] = React.useState(defaultName);
    const [email, setEmail] = React.useState(defaultEmail);
    const [message, setMessage] = React.useState(defaultMessage);
    return (_jsx(Card, { ref: ref, style: style, ...props, children: _jsxs(View, { style: { gap: 0 }, children: [_jsxs(View, { style: {
                        borderBottomWidth: 1,
                        borderBottomColor: theme.colors.border,
                        backgroundColor: theme.colors.surfaceMuted,
                        padding: 24,
                        gap: 8,
                    }, children: [_jsx(CardTitle, { children: title }), _jsx(Text, { style: { color: theme.colors.foregroundMuted, lineHeight: 22 }, children: description }), _jsx(View, { style: { marginTop: 12, gap: 12 }, children: channels.map((channel, index) => {
                                const content = (_jsxs(View, { style: {
                                        borderRadius: theme.radius.lg,
                                        borderWidth: 1,
                                        borderColor: theme.colors.border,
                                        backgroundColor: theme.colors.surface,
                                        paddingHorizontal: 16,
                                        paddingVertical: 12,
                                        shadowColor: "#0f172a",
                                        shadowOpacity: 0.06,
                                        shadowRadius: 8,
                                        shadowOffset: { width: 0, height: 3 },
                                        elevation: 2,
                                    }, children: [_jsx(Text, { style: {
                                                color: theme.colors.foregroundMuted,
                                                fontSize: theme.typography.size.xs,
                                                textTransform: "uppercase",
                                                letterSpacing: 0.5,
                                            }, children: channel.label }), _jsx(Text, { style: {
                                                marginTop: 4,
                                                color: theme.colors.foreground,
                                                fontWeight: theme.typography.weight.medium,
                                            }, children: channel.value }), channel.meta ? (_jsx(Text, { style: { marginTop: 4, color: theme.colors.foregroundMuted }, children: channel.meta })) : null] }));
                                const wrapped = (_jsx(Reveal, { reducedMotion: reducedMotion, delay: toDelay(index, 60), children: content }));
                                if (!channel.href) {
                                    return _jsx(View, { children: wrapped }, channel.id);
                                }
                                return (_jsx(Pressable, { onPress: () => {
                                        void Linking.openURL(channel.href);
                                    }, children: wrapped }, channel.id));
                            }) })] }), _jsx(Reveal, { reducedMotion: reducedMotion, delay: 120, children: _jsx(View, { style: { padding: 24 }, children: _jsxs(Form, { children: [_jsx(FormField, { name: "contact-name", children: _jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Name" }), _jsx(FormControl, { children: _jsx(Input, { value: name, onChangeText: setName }) }), _jsx(FormMessage, {})] }) }), _jsx(FormField, { name: "contact-email", children: _jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Email" }), _jsx(FormControl, { children: _jsx(Input, { value: email, onChangeText: setEmail, keyboardType: "email-address" }) }), _jsx(FormMessage, {})] }) }), _jsx(FormField, { name: "contact-message", children: _jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Message" }), _jsx(FormControl, { children: _jsx(Textarea, { value: message, onChangeText: setMessage }) }), _jsx(FormMessage, {})] }) }), _jsx(View, { style: { alignItems: "flex-end" }, children: _jsx(Button, { onPress: () => {
                                            onSubmit?.({ email, message, name });
                                        }, children: submitLabel }) })] }) }) })] }) }));
});
ContactSplitForm.displayName = "ContactSplitForm";
export const DungeonHUDShell = React.forwardRef(({ actions, children, footer, metrics, mission, sidebar, style, title, ...props }, ref) => {
    const theme = useTheme();
    const reducedMotion = useReducedMotion();
    return (_jsxs(View, { ref: ref, style: [
            {
                borderRadius: theme.radius.xl + 6,
                borderWidth: 1,
                borderColor: theme.colors.borderStrong,
                backgroundColor: theme.colors.backgroundSubtle,
                padding: 16,
                gap: 16,
            },
            style,
        ], ...props, children: [_jsx(Reveal, { reducedMotion: reducedMotion, delay: 40, children: _jsx(View, { style: {
                        borderRadius: theme.radius.lg,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                        backgroundColor: theme.colors.surfaceRaised,
                        padding: 16,
                        gap: 6,
                    }, children: _jsxs(View, { style: { flexDirection: "row", justifyContent: "space-between", gap: 16 }, children: [_jsxs(View, { style: { flex: 1, gap: 4 }, children: [_jsx(Text, { style: {
                                            color: theme.colors.foregroundMuted,
                                            fontSize: theme.typography.size.xs,
                                            textTransform: "uppercase",
                                            letterSpacing: 0.6,
                                        }, children: "Mission HUD" }), _jsx(Text, { style: {
                                            color: theme.colors.foreground,
                                            fontSize: theme.typography.size["2xl"],
                                            fontWeight: theme.typography.weight.semibold,
                                        }, children: title }), mission ? _jsx(Text, { style: { color: theme.colors.foregroundMuted, lineHeight: 22 }, children: mission }) : null] }), actions] }) }) }), _jsx(View, { style: { flexDirection: "row", flexWrap: "wrap", gap: 12 }, children: metrics.map((metric, index) => (_jsxs(Reveal, { reducedMotion: reducedMotion, delay: toDelay(index, 80), style: {
                        minWidth: 120,
                        flex: 1,
                        borderRadius: theme.radius.lg,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                        backgroundColor: theme.colors.surface,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                    }, children: [_jsx(Text, { style: {
                                color: theme.colors.foregroundMuted,
                                fontSize: theme.typography.size.xs,
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                            }, children: metric.label }), _jsx(Text, { style: {
                                marginTop: 6,
                                color: theme.colors.foreground,
                                fontSize: theme.typography.size.lg,
                                fontWeight: theme.typography.weight.semibold,
                            }, children: metric.value })] }, metric.id))) }), _jsx(Reveal, { reducedMotion: reducedMotion, delay: 110, children: _jsx(View, { style: {
                        minHeight: 240,
                        borderRadius: theme.radius.lg,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                        backgroundColor: theme.colors.surface,
                        padding: 16,
                    }, children: children }) }), _jsx(Reveal, { reducedMotion: reducedMotion, delay: 130, children: _jsx(View, { style: {
                        borderRadius: theme.radius.lg,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                        backgroundColor: theme.colors.surfaceMuted,
                        padding: 16,
                    }, children: sidebar }) }), footer ? (_jsx(Reveal, { reducedMotion: reducedMotion, delay: 150, children: _jsx(View, { style: {
                        borderRadius: theme.radius.lg,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                        backgroundColor: theme.colors.surfaceMuted,
                        padding: 16,
                    }, children: _jsx(Text, { style: { color: theme.colors.foregroundMuted }, children: footer }) }) })) : null] }));
});
DungeonHUDShell.displayName = "DungeonHUDShell";
