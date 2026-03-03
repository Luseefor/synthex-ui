import * as React from "react";
import { CheckIcon, MoonIcon, SunIcon, PaletteIcon } from "synthex-ui/icons";
import {
    Button,
    Label,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Separator,
    useSidebar,
} from "synthex-ui/components";
import { cn } from "synthex-ui";
import { accentPresets, type AccentPresetName } from "synthex-ui/theme";

interface ThemeCustomizerProps {
    readonly mode: "light" | "dark";
    readonly setMode: (mode: "light" | "dark") => void;
    readonly accentPreset: AccentPresetName;
    readonly setAccentPreset: (preset: AccentPresetName) => void;
    readonly radius: number;
    readonly setRadius: (radius: number) => void;
}

export function ThemeCustomizer({
    mode,
    setMode,
    accentPreset,
    setAccentPreset,
    radius,
    setRadius,
}: ThemeCustomizerProps) {
    const { open } = useSidebar();
    const activeOptionClass = "border-2 border-[color:var(--sx-color-primary)] bg-[color:var(--sx-color-primary)]/10 !text-[color:var(--sx-color-primary)] [&_svg]:!text-[color:var(--sx-color-primary)]";

    return (
        <div className="flex items-center gap-2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className={cn("h-8 gap-2", !open && "w-8 p-0 justify-center")}>
                        <PaletteIcon size={14} />
                        {open && <span className="text-[12px]">Customize</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className={cn(
                    "w-[min(340px,calc(100vw-1.5rem))] max-h-[min(80dvh,42rem)] overflow-auto p-0 mb-2 shadow-2xl border-[color:var(--sx-color-border-strong)] bottom-[calc(100%+0.5rem)] top-auto",
                    open ? "ml-2" : "ml-0 left-[-4px]"
                )}>
                    <div className="p-4 pt-6">
                        <div className="space-y-1.5">
                            <h2 className="text-sm font-semibold leading-none tracking-tight">
                                Customize Theme
                            </h2>
                            <p className="text-[12px] text-[color:var(--sx-color-foreground-muted)]">
                                Pick a style and color for your components.
                            </p>
                        </div>
                    </div>
                    <Separator />
                    <div className="p-4 space-y-6">
                        <div className="space-y-3">
                            <Label className="text-[11px] uppercase tracking-wider font-bold text-[color:var(--sx-color-foreground-muted)]">Color</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {Object.entries(accentPresets).map(([id, preset]) => {
                                    const isActive = accentPreset === id;

                                    return (
                                        <Button
                                            key={id}
                                            variant="outline"
                                            size="sm"
                                            className={cn(
                                                "justify-start gap-2 px-2 h-8 text-[12px]",
                                                isActive && activeOptionClass
                                            )}
                                            onClick={() => setAccentPreset(id as AccentPresetName)}
                                        >
                                            <span
                                                className="h-4 w-4 rounded-full"
                                                style={{ backgroundColor: preset.swatch }}
                                            />
                                            <span className="capitalize">{id}</span>
                                            {isActive && <CheckIcon size={12} className="ml-auto" />}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[11px] uppercase tracking-wider font-bold text-[color:var(--sx-color-foreground-muted)]">Radius</Label>
                            <div className="grid grid-cols-5 gap-2">
                                {[0, 0.3, 0.5, 0.75, 1.0].map((value) => {
                                    const isActive = radius === value;
                                    return (
                                        <Button
                                            key={value}
                                            variant="outline"
                                            size="sm"
                                            className={cn(
                                                "h-8 px-0 text-[12px]",
                                                isActive && activeOptionClass
                                            )}
                                            onClick={() => setRadius(value)}
                                        >
                                            {value}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[11px] uppercase tracking-wider font-bold text-[color:var(--sx-color-foreground-muted)]">Mode</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                        "justify-start gap-2 h-8 text-[12px]",
                                        mode === "light" && activeOptionClass
                                    )}
                                    onClick={() => setMode("light")}
                                >
                                    <SunIcon size={14} />
                                    <span>Light</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                        "justify-start gap-2 h-8 text-[12px]",
                                        mode === "dark" && activeOptionClass
                                    )}
                                    onClick={() => setMode("dark")}
                                >
                                    <MoonIcon size={14} />
                                    <span>Dark</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
