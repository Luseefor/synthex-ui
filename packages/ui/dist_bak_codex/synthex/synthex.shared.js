export const defaultThemeAccent = "steel";
export const themeAccentPresets = {
    steel: {
        label: "Steel",
        swatch: "#93a8bf",
        light: {
            colors: {
                primary: "#93a8bf",
                primaryHover: "#7f96af",
                primaryMuted: "#eaf0f6",
                ring: "#93a8bf",
            },
        },
        dark: {
            colors: {
                primary: "#9db1c6",
                primaryHover: "#b3c3d5",
                primaryMuted: "rgba(157, 177, 198, 0.22)",
                ring: "#9db1c6",
            },
        },
    },
    stone: {
        label: "Stone",
        swatch: "#adb9a3",
        light: {
            colors: {
                primary: "#adb9a3",
                primaryHover: "#97a38e",
                primaryMuted: "#edf2e9",
                ring: "#adb9a3",
            },
        },
        dark: {
            colors: {
                primary: "#b7c1ae",
                primaryHover: "#cad2c4",
                primaryMuted: "rgba(183, 193, 174, 0.22)",
                ring: "#b7c1ae",
            },
        },
    },
    bronze: {
        label: "Bronze",
        swatch: "#bc9972",
        light: {
            colors: {
                primary: "#bc9972",
                primaryHover: "#a8855f",
                primaryMuted: "#f6ede4",
                ring: "#bc9972",
            },
        },
        dark: {
            colors: {
                primary: "#caa27a",
                primaryHover: "#dfb891",
                primaryMuted: "rgba(202, 162, 122, 0.23)",
                ring: "#caa27a",
            },
        },
    },
    mulberry: {
        label: "Mulberry",
        swatch: "#ab91b4",
        light: {
            colors: {
                primary: "#ab91b4",
                primaryHover: "#967aa0",
                primaryMuted: "#f2edf3",
                ring: "#ab91b4",
            },
        },
        dark: {
            colors: {
                primary: "#b79bc0",
                primaryHover: "#ccafd4",
                primaryMuted: "rgba(183, 155, 192, 0.23)",
                ring: "#b79bc0",
            },
        },
    },
};
export function resolveThemeAccentTheme(accent, mode) {
    const preset = themeAccentPresets[accent] ?? themeAccentPresets[defaultThemeAccent];
    return mode === "dark" ? preset.dark : preset.light;
}
export function getCadenceMax(data) {
    return Math.max(1, ...data.map((entry) => entry.value));
}
export function getChangeToneClass(tone) {
    switch (tone) {
        case "accent":
            return "accent";
        case "positive":
            return "positive";
        case "warning":
            return "warning";
        default:
            return "default";
    }
}
