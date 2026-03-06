import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "../_shared/variants";
import { Button } from "../button/button.web";
import { Card, CardContent, CardHeader, CardTitle } from "../card/card.web";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../form/form.web";
import { useControllableState } from "../hooks/useControllableState";
import { Input } from "../input/input.web";
import { Textarea } from "../textarea/textarea.web";
import { defaultThemeAccent, getCadenceMax, themeAccentPresets } from "./synthex.shared";
function getStaggerStyle(index, baseDelay = 0) {
    return {
        animationDelay: `${baseDelay + index * 70}ms`,
    };
}
function clampToViewport(value, min, max) {
    if (max <= min) {
        return min;
    }
    return Math.min(Math.max(value, min), max);
}
const THEME_ACCENT_ORDER = ["steel", "stone", "bronze", "mulberry"];
export const ThemeAccentSwitcher = React.forwardRef(({ accent, className, compact = false, defaultAccent = defaultThemeAccent, defaultMode = "dark", defaultOpen = false, mode, onAccentChange, onModeChange, onOpenChange, open, title = "Theme", ...props }, ref) => {
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
    const triggerRef = React.useRef(null);
    const panelRef = React.useRef(null);
    const [position, setPosition] = React.useState({
        left: 0,
        maxHeight: 360,
        top: 0,
    });
    const selected = themeAccentPresets[currentAccent] ?? themeAccentPresets[defaultThemeAccent];
    const updatePosition = React.useCallback(() => {
        const trigger = triggerRef.current;
        const panel = panelRef.current;
        if (!trigger || !panel || typeof window === "undefined") {
            return;
        }
        const spacing = 10;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const triggerRect = trigger.getBoundingClientRect();
        const panelRect = panel.getBoundingClientRect();
        const panelWidth = Math.min(panelRect.width || 320, viewportWidth - spacing * 2);
        const panelHeight = Math.min(panelRect.height || 240, viewportHeight - spacing * 2);
        const spaceBelow = viewportHeight - triggerRect.bottom - spacing;
        const spaceAbove = triggerRect.top - spacing;
        const triggerCenterX = triggerRect.left + triggerRect.width / 2;
        const shouldOpenCenteredVertically = spaceAbove < 180 && spaceBelow < 180;
        const shouldOpenAbove = !shouldOpenCenteredVertically && (spaceBelow < panelHeight || spaceAbove > spaceBelow);
        const topCandidate = shouldOpenCenteredVertically
            ? triggerRect.top + triggerRect.height / 2 - panelHeight / 2
            : shouldOpenAbove
                ? triggerRect.top - panelHeight - spacing
                : triggerRect.bottom + spacing;
        const top = clampToViewport(topCandidate, spacing, viewportHeight - panelHeight - spacing);
        const shouldOpenTowardCenter = triggerRect.left < spacing || triggerRect.right > viewportWidth - spacing;
        const shouldAnchorLeft = triggerCenterX < viewportWidth / 2;
        const leftCandidate = shouldOpenTowardCenter
            ? triggerCenterX - panelWidth / 2
            : shouldAnchorLeft
                ? triggerRect.left
                : triggerRect.right - panelWidth;
        const left = clampToViewport(leftCandidate, spacing, viewportWidth - panelWidth - spacing);
        const maxHeight = shouldOpenCenteredVertically
            ? Math.max(180, viewportHeight - spacing * 2)
            : Math.max(180, shouldOpenAbove ? spaceAbove : spaceBelow);
        setPosition({ left, maxHeight, top });
    }, []);
    React.useEffect(() => {
        if (!isOpen || typeof window === "undefined") {
            return;
        }
        updatePosition();
        const raf = window.requestAnimationFrame(updatePosition);
        const handleResizeOrScroll = () => {
            updatePosition();
        };
        const handlePointerDown = (event) => {
            const target = event.target;
            if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) {
                return;
            }
            setIsOpen(false);
        };
        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };
        window.addEventListener("resize", handleResizeOrScroll);
        window.addEventListener("scroll", handleResizeOrScroll, true);
        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleEscape);
        return () => {
            window.cancelAnimationFrame(raf);
            window.removeEventListener("resize", handleResizeOrScroll);
            window.removeEventListener("scroll", handleResizeOrScroll, true);
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, setIsOpen, updatePosition]);
    return (_jsxs("div", { ref: ref, className: cn("inline-flex", className), ...props, children: [_jsxs("button", { ref: triggerRef, type: "button", "aria-expanded": isOpen, "aria-label": "Theme switcher", className: cn("inline-flex items-center gap-2 rounded-full border border-[color:color-mix(in_srgb,var(--sx-color-border)_88%,transparent)] bg-[color:color-mix(in_srgb,var(--sx-color-surface)_92%,transparent)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--sx-color-foreground-muted)] shadow-[var(--sx-shadow-xs)] transition-[transform,border-color,color,background-color] duration-[var(--sx-motion-fast)] hover:-translate-y-px hover:border-[color:var(--sx-color-border-strong)] hover:text-[color:var(--sx-color-foreground)]", compact && "px-2.5 py-1.5"), onClick: () => {
                    setIsOpen(!isOpen);
                }, children: [_jsx("span", { className: "h-2.5 w-2.5 rounded-full border border-white/30", style: { backgroundColor: selected.swatch } }), !compact ? _jsx("span", { className: "whitespace-nowrap", children: selected.label }) : null, _jsx("span", { className: "inline-flex h-5 w-5 items-center justify-center rounded-full border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] text-[10px]", children: "FX" })] }), isOpen && typeof document !== "undefined"
                ? createPortal(_jsx("div", { ref: panelRef, className: "fixed z-[140] w-[min(20rem,calc(100vw-1.5rem))] overflow-auto rounded-[calc(var(--sx-radius-xl)+4px)] border border-[color:color-mix(in_srgb,var(--sx-color-border-strong)_82%,transparent)] bg-[color:color-mix(in_srgb,var(--sx-color-background-subtle)_94%,transparent)] p-4 shadow-[0_20px_44px_rgba(3,7,18,0.42)] [animation:synthex-pop-in_280ms_var(--sx-easing-emphasized)_both] motion-reduce:animate-none", style: {
                        left: position.left,
                        maxHeight: position.maxHeight,
                        top: position.top,
                    }, children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsx("span", { className: "text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--sx-color-foreground-muted)]", children: title }), _jsx("span", { className: "text-[10px] uppercase tracking-[0.14em] text-[color:var(--sx-color-foreground-muted)]", children: selected.label })] }), _jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsx("span", { className: "text-xs uppercase tracking-[0.14em] text-[color:var(--sx-color-foreground-muted)]", children: "Appearance" }), _jsxs("div", { className: "inline-flex items-center gap-1 rounded-full border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-1", children: [_jsx("button", { type: "button", className: cn("inline-flex h-7 min-w-14 items-center justify-center rounded-full px-2 text-xs font-medium transition-[transform,background-color,color] duration-[var(--sx-motion-fast)] hover:-translate-y-px", currentMode === "light"
                                                    ? "bg-[color:var(--sx-color-primary-muted)] text-[color:var(--sx-color-foreground)]"
                                                    : "text-[color:var(--sx-color-foreground-muted)]"), onClick: () => setCurrentMode("light"), children: "Light" }), _jsx("button", { type: "button", className: cn("inline-flex h-7 min-w-14 items-center justify-center rounded-full px-2 text-xs font-medium transition-[transform,background-color,color] duration-[var(--sx-motion-fast)] hover:-translate-y-px", currentMode === "dark"
                                                    ? "bg-[color:var(--sx-color-primary-muted)] text-[color:var(--sx-color-foreground)]"
                                                    : "text-[color:var(--sx-color-foreground-muted)]"), onClick: () => setCurrentMode("dark"), children: "Dark" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("span", { className: "text-xs uppercase tracking-[0.14em] text-[color:var(--sx-color-foreground-muted)]", children: "Accent" }), _jsx("div", { className: "flex items-center gap-2", children: THEME_ACCENT_ORDER.map((accentId, index) => {
                                            const preset = themeAccentPresets[accentId];
                                            const isActive = currentAccent === accentId;
                                            return (_jsx("button", { type: "button", className: cn("inline-flex h-9 w-9 items-center justify-center rounded-[calc(var(--sx-radius-md)+2px)] border transition-[transform,border-color,box-shadow] duration-[var(--sx-motion-fast)] hover:-translate-y-px", isActive
                                                    ? "border-[color:color-mix(in_srgb,var(--sx-color-primary)_84%,transparent)] shadow-[0_0_0_1px_color-mix(in_srgb,var(--sx-color-primary)_54%,transparent)]"
                                                    : "border-[color:color-mix(in_srgb,var(--sx-color-border)_84%,transparent)]"), style: getStaggerStyle(index, 20), onClick: () => setCurrentAccent(accentId), children: _jsx("span", { className: cn("h-4 w-4 rounded-full border border-white/30", isActive &&
                                                        "[animation:synthex-pulse-ring_2.4s_ease-in-out_infinite] motion-reduce:animate-none"), style: { backgroundColor: preset.swatch } }) }, accentId));
                                        }) })] })] }) }), document.body)
                : null] }));
});
ThemeAccentSwitcher.displayName = "ThemeAccentSwitcher";
export const AssistantChatPanel = React.forwardRef(({ actions, className, composerLabel = "Prompt", defaultValue = "", description = "Keep the conversation moving with a ready-made assistant shell.", emptyState = "No messages yet. Start with a prompt.", messages, onSubmit, onValueChange, placeholder = "Ask the assistant to draft, analyze, or plan...", submitLabel = "Send", title = "Assistant", value, ...props }, ref) => {
    const [composerValue, setComposerValue] = useControllableState({
        defaultValue,
        onChange: onValueChange,
        value,
    });
    const handleSubmit = React.useCallback((event) => {
        event.preventDefault();
        const nextValue = composerValue.trim();
        if (!nextValue) {
            return;
        }
        onSubmit?.(nextValue);
        setComposerValue("");
    }, [composerValue, onSubmit, setComposerValue]);
    return (_jsxs(Card, { ref: ref, variant: "elevated", className: cn("relative flex h-full min-h-[34rem] flex-col overflow-hidden border-[color:color-mix(in_srgb,var(--sx-color-border)_86%,transparent)] bg-[radial-gradient(circle_at_top_right,color-mix(in_srgb,var(--sx-color-primary-muted)_62%,transparent),var(--sx-color-surface)_48%)] shadow-[var(--sx-shadow-lg)]", className), ...props, children: [_jsx("div", { className: "pointer-events-none absolute inset-0 opacity-40 [background:linear-gradient(165deg,transparent_12%,color-mix(in_srgb,var(--sx-color-primary-muted)_28%,transparent)_48%,transparent_82%)]" }), _jsx(CardHeader, { className: "relative border-b border-[color:var(--sx-color-border)] bg-[color:color-mix(in_srgb,var(--sx-color-surface-raised)_70%,transparent)] pb-4 backdrop-blur-sm", children: _jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { className: "space-y-1", children: [_jsx(CardTitle, { className: "tracking-[-0.03em]", children: title }), description ? (_jsx("p", { className: "text-sm leading-6 text-[color:var(--sx-color-foreground-muted)]", children: description })) : null] }), actions] }) }), _jsxs(CardContent, { className: "relative flex min-h-0 flex-1 flex-col gap-4 pt-6", children: [_jsx("div", { className: "flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto rounded-[calc(var(--sx-radius-xl)+2px)] border border-[color:color-mix(in_srgb,var(--sx-color-border)_80%,transparent)] bg-[color:color-mix(in_srgb,var(--sx-color-surface-muted)_74%,transparent)] p-3 pr-2", children: messages.length === 0 ? (_jsx("div", { className: "flex min-h-40 items-center justify-center rounded-[calc(var(--sx-radius-lg)+4px)] border border-dashed border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] px-6 text-center text-sm text-[color:var(--sx-color-foreground-muted)] [animation:synthex-fade-up_420ms_var(--sx-easing-emphasized)_both] motion-reduce:animate-none", children: emptyState })) : (messages.map((message, index) => {
                            const isUser = message.role === "user";
                            const isSystem = message.role === "system";
                            return (_jsx("div", { className: cn("flex [animation:synthex-fade-up_420ms_var(--sx-easing-emphasized)_both] motion-reduce:animate-none", isUser ? "justify-end" : "justify-start"), style: getStaggerStyle(index), children: _jsxs("div", { className: cn("max-w-[88%] rounded-[calc(var(--sx-radius-lg)+6px)] border px-4 py-3 shadow-[var(--sx-shadow-sm)] transition-[transform,box-shadow,border-color] duration-[var(--sx-motion-normal)] hover:-translate-y-px hover:shadow-[var(--sx-shadow-md)]", isUser &&
                                        "border-transparent bg-[linear-gradient(145deg,var(--sx-color-primary),color-mix(in_srgb,var(--sx-color-primary)_72%,#ffffff_28%))] text-[color:var(--sx-color-foreground-on-brand)]", !isUser &&
                                        !isSystem &&
                                        "border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)]", isSystem &&
                                        "border-[color:color-mix(in_srgb,var(--sx-color-accent)_80%,var(--sx-color-border))] bg-[color:color-mix(in_srgb,var(--sx-color-accent-muted)_84%,var(--sx-color-surface))]"), children: [(message.author || message.meta) ? (_jsxs("div", { className: cn("mb-2 flex items-center justify-between gap-3 text-xs font-medium uppercase tracking-[0.1em]", isUser
                                                ? "text-[color:var(--sx-color-foreground-on-brand)]/80"
                                                : "text-[color:var(--sx-color-foreground-muted)]"), children: [_jsx("span", { children: message.author ?? message.role }), message.meta ? _jsx("span", { children: message.meta }) : null] })) : null, _jsx("div", { className: "text-sm leading-6", children: message.content })] }) }, message.id));
                        })) }), _jsxs(Form, { className: "space-y-4 rounded-[calc(var(--sx-radius-xl)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-4 shadow-[var(--sx-shadow-sm)]", onSubmit: handleSubmit, children: [_jsx(FormField, { name: "assistantPrompt", children: _jsxs(FormItem, { className: "gap-3", children: [_jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsx(FormLabel, { children: composerLabel }), _jsx("span", { className: "text-xs uppercase tracking-[0.11em] text-[color:var(--sx-color-foreground-muted)]", children: "Shift+Enter for a line break" })] }), _jsx(FormControl, { children: _jsx(Textarea, { rows: 4, value: composerValue, placeholder: placeholder, className: "transition-shadow duration-[var(--sx-motion-fast)] focus-visible:shadow-[0_0_0_2px_color-mix(in_srgb,var(--sx-color-ring)_26%,transparent)]", onChange: (event) => {
                                                    setComposerValue(event.target.value);
                                                } }) }), _jsx(FormMessage, {})] }) }), _jsx("div", { className: "flex justify-end", children: _jsx(Button, { className: "transition-transform hover:-translate-y-px", type: "submit", children: submitLabel }) })] })] })] }));
});
AssistantChatPanel.displayName = "AssistantChatPanel";
export const FloatingAssistantLauncher = React.forwardRef(({ badge, children, className, defaultOpen = false, description = "Launch your assistant workspace.", label = "AI", onOpenChange, open, title = "Assistant dock", ...props }, ref) => {
    const [isOpen, setIsOpen] = useControllableState({
        defaultValue: defaultOpen,
        onChange: onOpenChange,
        value: open,
    });
    return (_jsxs("div", { ref: ref, className: cn("fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3", className), ...props, children: [isOpen && children ? (_jsxs(Card, { className: "relative w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden border-[color:var(--sx-color-border-strong)] bg-[color:color-mix(in_srgb,var(--sx-color-surface-raised)_88%,transparent)] shadow-[var(--sx-shadow-lg)] [animation:synthex-pop-in_320ms_var(--sx-easing-emphasized)_both] motion-reduce:animate-none", children: [_jsx("div", { className: "pointer-events-none absolute inset-0 opacity-45 [background:radial-gradient(circle_at_top_right,color-mix(in_srgb,var(--sx-color-primary-muted)_38%,transparent),transparent_55%)]" }), _jsxs(CardHeader, { className: "pb-4", children: [_jsx(CardTitle, { className: "text-base", children: title }), _jsx("p", { className: "text-sm leading-6 text-[color:var(--sx-color-foreground-muted)]", children: description })] }), _jsx(CardContent, { className: "relative", children: children })] })) : null, _jsxs("button", { type: "button", "aria-expanded": isOpen, "aria-label": typeof label === "string" ? label : "Open assistant", className: "group relative inline-flex h-14 min-w-14 items-center justify-center gap-2 overflow-hidden rounded-full border border-[color:color-mix(in_srgb,var(--sx-color-primary)_55%,var(--sx-color-border-strong))] bg-[linear-gradient(140deg,var(--sx-color-primary),color-mix(in_srgb,var(--sx-color-primary)_72%,#ffffff_28%))] px-5 text-sm font-semibold text-[color:var(--sx-color-foreground-on-brand)] shadow-[var(--sx-shadow-lg)] transition-[transform,box-shadow,filter] duration-[var(--sx-motion-normal)] hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_16px_34px_-14px_color-mix(in_srgb,var(--sx-color-primary)_72%,black)]", onClick: () => {
                    setIsOpen(!isOpen);
                }, children: [_jsx("span", { className: "pointer-events-none absolute -inset-5 -z-10 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.44),transparent_68%)] [animation:synthex-launcher-glow_3.4s_ease-in-out_infinite] motion-reduce:animate-none" }), _jsx("span", { className: cn("pointer-events-none absolute -inset-3 rounded-full border border-white/25 opacity-65 [animation:synthex-launcher-orbit_5s_linear_infinite] motion-reduce:animate-none", isOpen && "opacity-85") }), _jsx("span", { className: "pointer-events-none absolute inset-0 [animation:synthex-sheen_3.4s_linear_infinite] opacity-80 mix-blend-screen motion-reduce:animate-none [background:linear-gradient(110deg,transparent_28%,rgba(255,255,255,0.36)_47%,transparent_66%)]" }), _jsx("span", { className: "pointer-events-none absolute -inset-1 rounded-full border border-white/40 opacity-55 [animation:synthex-pulse-ring_2.8s_ease-in-out_infinite] motion-reduce:animate-none" }), _jsx("span", { className: "relative", children: label }), badge ? (_jsx("span", { className: "relative rounded-full bg-white/18 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] [animation:synthex-badge-bob_2.4s_ease-in-out_infinite] motion-reduce:animate-none", children: badge })) : null] })] }));
});
FloatingAssistantLauncher.displayName = "FloatingAssistantLauncher";
export const CadenceBarChart = React.forwardRef(({ className, data, description = "Past 14 days", title = "Cadence", valueFormatter = (value) => `${value}`, ...props }, ref) => {
    const maxValue = getCadenceMax(data);
    return (_jsxs(Card, { ref: ref, className: cn("overflow-hidden border-[color:color-mix(in_srgb,var(--sx-color-border)_82%,transparent)]", className), ...props, children: [_jsxs(CardHeader, { className: "pb-3", children: [_jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsx(CardTitle, { className: "text-base", children: title }), _jsx("span", { className: "rounded-full border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface-muted)] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-[color:var(--sx-color-foreground-muted)]", children: "14D" })] }), _jsx("p", { className: "text-sm text-[color:var(--sx-color-foreground-muted)]", children: description })] }), _jsx(CardContent, { className: "space-y-4", children: _jsxs("div", { className: "relative", children: [_jsx("div", { className: "pointer-events-none absolute inset-0 [background:linear-gradient(180deg,color-mix(in_srgb,var(--sx-color-border)_38%,transparent)_1px,transparent_1px)] [background-size:100%_25%]" }), _jsx("div", { className: "relative grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] items-end gap-2", children: data.map((entry, index) => (_jsxs("div", { className: "group flex flex-col items-center gap-2 rounded-[var(--sx-radius-lg)] px-1.5 py-1 transition-colors hover:bg-[color:color-mix(in_srgb,var(--sx-color-accent-muted)_72%,transparent)]", children: [_jsx("div", { className: "flex h-28 w-full items-end", children: _jsx("div", { className: "w-full origin-bottom rounded-[var(--sx-radius-pill)] border border-[color:color-mix(in_srgb,var(--sx-color-primary)_35%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--sx-color-primary)_96%,white_4%)_0%,color-mix(in_srgb,var(--sx-color-primary)_52%,var(--sx-color-surface))_100%)] shadow-[0_8px_18px_-12px_color-mix(in_srgb,var(--sx-color-primary)_75%,black)] [animation:synthex-bar-rise_520ms_var(--sx-easing-emphasized)_both] motion-reduce:animate-none group-hover:brightness-110", style: {
                                                ...getStaggerStyle(index, 120),
                                                minHeight: "12%",
                                                height: `${Math.max(12, (entry.value / maxValue) * 100)}%`,
                                            }, title: `${entry.label}: ${String(valueFormatter(entry.value))}` }) }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-xs font-semibold text-[color:var(--sx-color-foreground)]", children: valueFormatter(entry.value) }), _jsx("div", { className: "text-[11px] uppercase tracking-[0.14em] text-[color:var(--sx-color-foreground-muted)]", children: entry.label })] })] }, entry.id ?? entry.label))) })] }) })] }));
});
CadenceBarChart.displayName = "CadenceBarChart";
export const Marquee = React.forwardRef(({ className, items, speed = "normal", ...props }, ref) => {
    const duration = speed === "slow" ? "28s" : speed === "fast" ? "14s" : "20s";
    const secondaryDuration = speed === "slow" ? "34s" : speed === "fast" ? "18s" : "24s";
    const topTrackItems = [...items, ...items];
    const bottomTrackItems = [...items.slice().reverse(), ...items.slice().reverse()];
    return (_jsxs("div", { ref: ref, className: cn("relative overflow-hidden rounded-[calc(var(--sx-radius-xl)+2px)] border border-[color:var(--sx-color-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--sx-color-surface-muted)_95%,transparent),color-mix(in_srgb,var(--sx-color-surface)_92%,transparent))] py-3", className), style: {
            WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)",
            maskImage: "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)",
        }, ...props, children: [_jsx("div", { className: "pointer-events-none absolute inset-y-0 left-0 z-10 w-16 [background:linear-gradient(90deg,var(--sx-color-surface)_8%,transparent)]" }), _jsx("div", { className: "pointer-events-none absolute inset-y-0 right-0 z-10 w-16 [background:linear-gradient(270deg,var(--sx-color-surface)_8%,transparent)]" }), _jsx("div", { className: "flex w-max min-w-full items-center gap-3 px-3 [animation:synthex-marquee_var(--sx-marquee-duration)_linear_infinite] hover:[animation-play-state:paused] motion-reduce:animate-none", style: { ["--sx-marquee-duration"]: duration }, children: topTrackItems.map((item, index) => (_jsxs("div", { className: "flex min-w-max items-center gap-2 rounded-full border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] px-4 py-2 shadow-[var(--sx-shadow-xs)] transition-[transform,box-shadow,border-color] duration-[var(--sx-motion-normal)] hover:-translate-y-0.5 hover:border-[color:var(--sx-color-border-strong)] hover:shadow-[var(--sx-shadow-md)] [animation:synthex-marquee-float_3.2s_ease-in-out_infinite] motion-reduce:animate-none", style: { animationDelay: `${index * 120}ms` }, children: [_jsx("span", { className: "text-sm font-medium text-[color:var(--sx-color-foreground)]", children: item.label }), item.meta ? (_jsx("span", { className: "text-xs uppercase tracking-[0.14em] text-[color:var(--sx-color-foreground-muted)]", children: item.meta })) : null] }, `${item.id}-${index}`))) }), _jsx("div", { className: "mt-3 flex w-max min-w-full items-center gap-3 px-3 opacity-80 [animation:synthex-marquee-reverse_var(--sx-marquee-secondary-duration)_linear_infinite] hover:[animation-play-state:paused] motion-reduce:animate-none", style: {
                    ["--sx-marquee-secondary-duration"]: secondaryDuration,
                }, children: bottomTrackItems.map((item, index) => (_jsxs("div", { className: "flex min-w-max items-center gap-2 rounded-full border border-[color:color-mix(in_srgb,var(--sx-color-border)_86%,transparent)] bg-[color:color-mix(in_srgb,var(--sx-color-surface)_85%,transparent)] px-4 py-1.5 shadow-[var(--sx-shadow-xs)] transition-[transform,box-shadow,border-color] duration-[var(--sx-motion-normal)] hover:-translate-y-0.5 hover:border-[color:var(--sx-color-border-strong)] hover:shadow-[var(--sx-shadow-md)] [animation:synthex-marquee-float_3.6s_ease-in-out_infinite] motion-reduce:animate-none", style: { animationDelay: `${index * 110}ms` }, children: [_jsx("span", { className: "text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--sx-color-foreground)]", children: item.label }), item.meta ? (_jsx("span", { className: "text-[10px] uppercase tracking-[0.14em] text-[color:var(--sx-color-foreground-muted)]", children: item.meta })) : null] }, `rev-${item.id}-${index}`))) })] }));
});
Marquee.displayName = "Marquee";
export const KPIStatGrid = React.forwardRef(({ className, columns = 4, stats, ...props }, ref) => (_jsx("div", { ref: ref, className: cn("grid gap-4", columns === 2 && "md:grid-cols-2", columns === 3 && "md:grid-cols-3", columns === 4 && "md:grid-cols-2 xl:grid-cols-4", className), ...props, children: stats.map((stat, index) => (_jsxs(Card, { className: cn("group relative overflow-hidden border-[color:color-mix(in_srgb,var(--sx-color-border)_86%,transparent)] transition-[transform,box-shadow,border-color] duration-[var(--sx-motion-normal)] hover:-translate-y-1 hover:border-[color:var(--sx-color-border-strong)] hover:shadow-[var(--sx-shadow-lg)] [animation:synthex-fade-up_420ms_var(--sx-easing-emphasized)_both] motion-reduce:animate-none", stat.tone === "accent" &&
            "bg-[linear-gradient(160deg,color-mix(in_srgb,var(--sx-color-accent-muted)_92%,transparent),var(--sx-color-surface))]", stat.tone === "positive" &&
            "border-emerald-200 bg-[linear-gradient(160deg,#ecfdf5,var(--sx-color-surface)) dark:border-emerald-900 dark:bg-emerald-950/30", stat.tone === "warning" &&
            "border-amber-200 bg-[linear-gradient(160deg,#fffbeb,var(--sx-color-surface)) dark:border-amber-900 dark:bg-amber-950/30"), style: getStaggerStyle(index), children: [_jsx("div", { className: "pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--sx-color-primary)_55%,transparent),transparent)]" }), _jsxs(CardContent, { className: "space-y-3 pt-6", children: [_jsx("div", { className: "text-xs uppercase tracking-[0.18em] text-[color:var(--sx-color-foreground-muted)]", children: stat.label }), _jsx("div", { className: "text-3xl font-semibold tracking-[-0.04em] text-[color:var(--sx-color-foreground)]", children: stat.value }), (stat.change || stat.detail) ? (_jsxs("div", { className: "flex items-center justify-between gap-3", children: [stat.change ? (_jsx("span", { className: "text-sm font-semibold text-[color:var(--sx-color-foreground)]", children: stat.change })) : null, stat.detail ? (_jsx("span", { className: "text-sm text-[color:var(--sx-color-foreground-muted)]", children: stat.detail })) : null] })) : null] })] }, stat.id))) })));
KPIStatGrid.displayName = "KPIStatGrid";
export const TimelineRow = React.forwardRef(({ className, date, organization, summary, tags, title, ...props }, ref) => (_jsxs("div", { ref: ref, className: cn("group relative grid gap-4 border-l border-[color:var(--sx-color-border)] pl-6 transition-[border-color] duration-[var(--sx-motion-fast)] hover:border-[color:var(--sx-color-border-strong)] md:grid-cols-[10rem_minmax(0,1fr)] md:pl-0 [animation:synthex-fade-up_380ms_var(--sx-easing-emphasized)_both] motion-reduce:animate-none", className), ...props, children: [_jsx("span", { className: "pointer-events-none absolute -left-px top-0 h-full w-px bg-[linear-gradient(180deg,color-mix(in_srgb,var(--sx-color-primary)_68%,transparent),color-mix(in_srgb,var(--sx-color-border)_70%,transparent)_32%,transparent_100%)] opacity-70" }), _jsxs("div", { className: "relative pl-4 md:pl-0", children: [_jsx("span", { className: "absolute -left-[1.78rem] top-1.5 h-3 w-3 rounded-full border-2 border-[color:var(--sx-color-surface)] bg-[color:var(--sx-color-primary)] shadow-[0_0_0_6px_color-mix(in_srgb,var(--sx-color-primary-muted)_38%,transparent)] transition-transform duration-[var(--sx-motion-fast)] group-hover:scale-110 md:-left-[0.4rem]" }), _jsx("span", { className: "pointer-events-none absolute -left-[1.98rem] top-1.25 h-3.5 w-3.5 rounded-full border border-[color:color-mix(in_srgb,var(--sx-color-primary)_45%,transparent)] opacity-75 [animation:synthex-timeline-ping_2.6s_ease-out_infinite] motion-reduce:animate-none md:-left-[0.58rem]" }), _jsx("div", { className: "text-xs uppercase tracking-[0.18em] text-[color:var(--sx-color-foreground-muted)]", children: date })] }), _jsxs("div", { className: "space-y-3 rounded-[var(--sx-radius-lg)] border border-transparent p-3 transition-[background-color,border-color,transform] duration-[var(--sx-motion-fast)] group-hover:-translate-y-0.5 group-hover:border-[color:color-mix(in_srgb,var(--sx-color-border)_84%,transparent)] group-hover:bg-[color:color-mix(in_srgb,var(--sx-color-surface-muted)_78%,transparent)]", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("div", { className: "text-lg font-semibold tracking-[-0.03em] text-[color:var(--sx-color-foreground)]", children: title }), organization ? (_jsx("div", { className: "text-sm text-[color:var(--sx-color-foreground-muted)]", children: organization })) : null] }), summary ? (_jsx("div", { className: "text-sm leading-6 text-[color:var(--sx-color-foreground-muted)]", children: summary })) : null, tags?.length ? (_jsx("div", { className: "flex flex-wrap gap-2", children: tags.map((tag, index) => (_jsx("span", { className: "rounded-full border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] px-3 py-1 text-xs font-medium text-[color:var(--sx-color-foreground-muted)] transition-colors duration-[var(--sx-motion-fast)] hover:border-[color:var(--sx-color-border-strong)] hover:text-[color:var(--sx-color-foreground)]", children: tag }, `${String(tag)}-${index}`))) })) : null] })] })));
TimelineRow.displayName = "TimelineRow";
export const ExperienceTimeline = React.forwardRef(({ className, description, entries, title = "Experience", ...props }, ref) => (_jsxs(Card, { ref: ref, className: cn("overflow-hidden border-[color:color-mix(in_srgb,var(--sx-color-border)_86%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--sx-color-surface-raised)_84%,transparent),var(--sx-color-surface)_28%)]", className), ...props, children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: title }), description ? (_jsx("p", { className: "text-sm leading-6 text-[color:var(--sx-color-foreground-muted)]", children: description })) : null] }), _jsx(CardContent, { className: "space-y-6", children: entries.map((entry, index) => (_jsx(TimelineRow, { ...entry, className: "[animation:synthex-fade-up_420ms_var(--sx-easing-emphasized)_both] motion-reduce:animate-none", style: getStaggerStyle(index, 110) }, entry.id))) })] })));
ExperienceTimeline.displayName = "ExperienceTimeline";
export const ProjectCaseRow = React.forwardRef(({ category, className, ctaLabel = "Read case", href, index, metrics, summary, title, ...props }, ref) => (_jsxs("div", { ref: ref, className: cn("group grid gap-6 border-t border-[color:var(--sx-color-border)] py-8 transition-colors duration-[var(--sx-motion-fast)] hover:border-[color:var(--sx-color-border-strong)] md:grid-cols-[7rem_minmax(0,1fr)_16rem] [animation:synthex-fade-up_420ms_var(--sx-easing-emphasized)_both] motion-reduce:animate-none", className), ...props, children: [_jsx("div", { className: "flex h-14 w-14 items-center justify-center rounded-full border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface-muted)] text-2xl font-semibold tracking-[-0.04em] text-[color:var(--sx-color-foreground-muted)] transition-[transform,border-color,color] duration-[var(--sx-motion-normal)] group-hover:-translate-y-0.5 group-hover:border-[color:var(--sx-color-border-strong)] group-hover:text-[color:var(--sx-color-foreground)]", children: String(index).padStart(2, "0") }), _jsxs("div", { className: "space-y-3", children: [category ? (_jsx("div", { className: "text-xs uppercase tracking-[0.18em] text-[color:var(--sx-color-foreground-muted)]", children: category })) : null, _jsx("div", { className: "text-2xl font-semibold tracking-[-0.03em] text-[color:var(--sx-color-foreground)]", children: title }), summary ? (_jsx("div", { className: "max-w-2xl text-sm leading-6 text-[color:var(--sx-color-foreground-muted)]", children: summary })) : null] }), _jsxs("div", { className: "flex flex-col items-start gap-4 md:items-end", children: [metrics?.length ? (_jsx("div", { className: "grid w-full gap-2", children: metrics.map((metric, metricIndex) => (_jsxs("div", { className: "flex items-center justify-between gap-4 rounded-[var(--sx-radius-lg)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface-muted)] px-4 py-3 transition-[transform,border-color] duration-[var(--sx-motion-fast)] hover:-translate-y-px hover:border-[color:var(--sx-color-border-strong)]", children: [_jsx("span", { className: "text-xs uppercase tracking-[0.14em] text-[color:var(--sx-color-foreground-muted)]", children: metric.label }), _jsx("span", { className: "text-sm font-semibold text-[color:var(--sx-color-foreground)]", children: metric.value })] }, `${String(metric.label)}-${metricIndex}`))) })) : null, href ? (_jsx("a", { href: href, className: "inline-flex h-10 items-center justify-center rounded-[var(--sx-radius-md)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] px-4 text-sm font-medium text-[color:var(--sx-color-foreground)] shadow-[var(--sx-shadow-sm)] transition-[transform,background-color,border-color] duration-[var(--sx-motion-fast)] hover:-translate-y-px hover:border-[color:var(--sx-color-border-strong)] hover:bg-[color:var(--sx-color-accent)]", children: ctaLabel })) : null] })] })));
ProjectCaseRow.displayName = "ProjectCaseRow";
export const ContactSplitForm = React.forwardRef(({ channels, className, defaultEmail = "", defaultMessage = "", defaultName = "", description = "Put channel context on the left and a contact form on the right.", onSubmit, submitLabel = "Send inquiry", title = "Contact", ...props }, ref) => {
    const [name, setName] = React.useState(defaultName);
    const [email, setEmail] = React.useState(defaultEmail);
    const [message, setMessage] = React.useState(defaultMessage);
    return (_jsx(Card, { ref: ref, className: cn("overflow-hidden [animation:synthex-fade-up_420ms_var(--sx-easing-emphasized)_both] motion-reduce:animate-none", className), ...props, children: _jsxs("div", { className: "grid md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]", children: [_jsxs("div", { className: "border-b border-[color:var(--sx-color-border)] bg-[linear-gradient(170deg,color-mix(in_srgb,var(--sx-color-accent-muted)_85%,transparent),var(--sx-color-surface-muted))] p-6 md:border-b-0 md:border-r", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(CardTitle, { children: title }), _jsx("p", { className: "text-sm leading-6 text-[color:var(--sx-color-foreground-muted)]", children: description })] }), _jsx("div", { className: "mt-6 space-y-3", children: channels.map((channel, index) => {
                                const body = (_jsxs("div", { className: "rounded-[var(--sx-radius-lg)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] px-4 py-3 shadow-[var(--sx-shadow-xs)] transition-[transform,border-color,box-shadow] duration-[var(--sx-motion-fast)] hover:-translate-y-px hover:border-[color:var(--sx-color-border-strong)] hover:shadow-[var(--sx-shadow-sm)] [animation:synthex-fade-up_360ms_var(--sx-easing-emphasized)_both] motion-reduce:animate-none", style: getStaggerStyle(index, 60), children: [_jsx("div", { className: "text-xs uppercase tracking-[0.14em] text-[color:var(--sx-color-foreground-muted)]", children: channel.label }), _jsx("div", { className: "mt-1 text-sm font-semibold text-[color:var(--sx-color-foreground)]", children: channel.value }), channel.meta ? (_jsx("div", { className: "mt-1 text-sm text-[color:var(--sx-color-foreground-muted)]", children: channel.meta })) : null] }));
                                return channel.href ? (_jsx("a", { href: channel.href, className: "block", children: body }, channel.id)) : (_jsx("div", { children: body }, channel.id));
                            }) })] }), _jsx("div", { className: "p-6", children: _jsxs(Form, { className: "rounded-[var(--sx-radius-xl)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-4 shadow-[var(--sx-shadow-xs)]", onSubmit: (event) => {
                            event.preventDefault();
                            onSubmit?.({ email, message, name });
                        }, children: [_jsx(FormField, { name: "contact-name", children: _jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Name" }), _jsx(FormControl, { children: _jsx(Input, { className: "transition-shadow duration-[var(--sx-motion-fast)] focus-visible:shadow-[0_0_0_2px_color-mix(in_srgb,var(--sx-color-ring)_24%,transparent)]", value: name, onChange: (event) => setName(event.target.value) }) }), _jsx(FormMessage, {})] }) }), _jsx(FormField, { name: "contact-email", children: _jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Email" }), _jsx(FormControl, { children: _jsx(Input, { type: "email", className: "transition-shadow duration-[var(--sx-motion-fast)] focus-visible:shadow-[0_0_0_2px_color-mix(in_srgb,var(--sx-color-ring)_24%,transparent)]", value: email, onChange: (event) => setEmail(event.target.value) }) }), _jsx(FormMessage, {})] }) }), _jsx(FormField, { name: "contact-message", children: _jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Message" }), _jsx(FormControl, { children: _jsx(Textarea, { rows: 6, className: "transition-shadow duration-[var(--sx-motion-fast)] focus-visible:shadow-[0_0_0_2px_color-mix(in_srgb,var(--sx-color-ring)_24%,transparent)]", value: message, onChange: (event) => setMessage(event.target.value) }) }), _jsx(FormMessage, {})] }) }), _jsx("div", { className: "flex justify-end", children: _jsx(Button, { className: "transition-transform hover:-translate-y-px", type: "submit", children: submitLabel }) })] }) })] }) }));
});
ContactSplitForm.displayName = "ContactSplitForm";
export const DungeonHUDShell = React.forwardRef(({ actions, children, className, footer, metrics, mission, sidebar, title, ...props }, ref) => (_jsxs("div", { ref: ref, className: cn("relative overflow-hidden rounded-[calc(var(--sx-radius-xl)+8px)] border border-[color:var(--sx-color-border-strong)] bg-[radial-gradient(circle_at_top,var(--sx-color-surface-raised),var(--sx-color-background))] p-4 shadow-[var(--sx-shadow-lg)] [animation:synthex-fade-up_440ms_var(--sx-easing-emphasized)_both] motion-reduce:animate-none", className), ...props, children: [_jsx("div", { className: "pointer-events-none absolute inset-0 opacity-20 [background:repeating-linear-gradient(0deg,transparent,transparent_8px,rgba(255,255,255,0.03)_9px,transparent_10px)]" }), _jsx("div", { className: "pointer-events-none absolute -left-1/3 top-0 h-px w-1/2 bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--sx-color-primary)_72%,white),transparent)] [animation:synthex-scan-sweep_4.2s_linear_infinite] motion-reduce:animate-none" }), _jsxs("div", { className: "relative grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "rounded-[var(--sx-radius-lg)] border border-[color:var(--sx-color-border)] bg-[color:color-mix(in_srgb,var(--sx-color-background)_62%,black_38%)] p-4 backdrop-blur-sm", children: _jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("div", { className: "text-xs uppercase tracking-[0.18em] text-[color:var(--sx-color-foreground-muted)]", children: "Mission HUD" }), _jsx("div", { className: "text-2xl font-semibold tracking-[-0.04em] text-[color:var(--sx-color-foreground)]", children: title }), mission ? (_jsx("div", { className: "text-sm leading-6 text-[color:var(--sx-color-foreground-muted)]", children: mission })) : null] }), actions] }) }), _jsx("div", { className: "grid gap-3 sm:grid-cols-3", children: metrics.map((metric, index) => (_jsxs("div", { className: "rounded-[var(--sx-radius-lg)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] px-4 py-3 transition-[transform,border-color,background-color] duration-[var(--sx-motion-fast)] hover:-translate-y-px hover:border-[color:var(--sx-color-border-strong)] hover:bg-[color:color-mix(in_srgb,var(--sx-color-surface)_86%,var(--sx-color-accent-muted))] [animation:synthex-fade-up_360ms_var(--sx-easing-emphasized)_both] motion-reduce:animate-none", style: getStaggerStyle(index, 90), children: [_jsx("div", { className: "text-[11px] uppercase tracking-[0.18em] text-[color:var(--sx-color-foreground-muted)]", children: metric.label }), _jsx("div", { className: "mt-2 text-xl font-semibold text-[color:var(--sx-color-foreground)]", children: metric.value })] }, metric.id))) }), _jsxs("div", { className: "relative min-h-[16rem] overflow-hidden rounded-[var(--sx-radius-lg)] border border-[color:var(--sx-color-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--sx-color-primary-muted)_18%,transparent),transparent_42%),var(--sx-color-surface)] p-4", children: [_jsx("div", { className: "pointer-events-none absolute inset-0 opacity-35 [background:radial-gradient(circle_at_20%_0%,color-mix(in_srgb,var(--sx-color-primary)_18%,transparent),transparent_48%)]" }), _jsx("div", { className: "relative", children: children })] }), footer ? (_jsx("div", { className: "rounded-[var(--sx-radius-lg)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface-muted)] px-4 py-3 text-sm text-[color:var(--sx-color-foreground-muted)]", children: footer })) : null] }), _jsx("div", { className: "rounded-[var(--sx-radius-lg)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface-muted)] p-4", children: sidebar })] })] })));
DungeonHUDShell.displayName = "DungeonHUDShell";
