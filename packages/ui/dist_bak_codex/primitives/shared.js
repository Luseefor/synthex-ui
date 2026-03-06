export function resolveSpace(theme, value) {
    if (value === undefined) {
        return undefined;
    }
    return typeof value === "number" ? value : theme.space[value];
}
export function resolveRadius(theme, value) {
    if (value === undefined) {
        return undefined;
    }
    return typeof value === "number" ? value : theme.radius[value];
}
export function resolveColor(theme, value) {
    if (!value) {
        return undefined;
    }
    if (value in theme.colors) {
        return theme.colors[value];
    }
    return value;
}
export function resolveShadow(theme, value) {
    if (!value) {
        return undefined;
    }
    if (value in theme.shadows) {
        return theme.shadows[value];
    }
    return value;
}
export function createBoxStyle(theme, props) {
    const padding = resolveSpace(theme, props.padding);
    const paddingX = resolveSpace(theme, props.paddingX);
    const paddingY = resolveSpace(theme, props.paddingY);
    const margin = resolveSpace(theme, props.margin);
    const gap = resolveSpace(theme, props.gap);
    const radius = resolveRadius(theme, props.radius);
    const backgroundColor = resolveColor(theme, props.background);
    const color = resolveColor(theme, props.foreground);
    const shadow = resolveShadow(theme, props.shadow);
    return {
        backgroundColor,
        borderColor: props.border ? theme.colors.border : undefined,
        borderRadius: radius,
        borderStyle: props.border ? "solid" : undefined,
        borderWidth: props.border ? 1 : undefined,
        boxShadow: shadow,
        color,
        display: props.direction || props.gap !== undefined || props.align || props.justify || props.wrap
            ? "flex"
            : undefined,
        flexBasis: props.basis,
        flexDirection: props.direction,
        flexGrow: props.grow === true ? 1 : typeof props.grow === "number" ? props.grow : undefined,
        flexShrink: props.shrink === true ? 1 : typeof props.shrink === "number" ? props.shrink : undefined,
        flexWrap: props.wrap ? "wrap" : undefined,
        gap,
        height: props.height,
        justifyContent: props.justify,
        margin,
        maxHeight: props.maxHeight,
        maxWidth: props.maxWidth,
        minHeight: props.minHeight,
        minWidth: props.minWidth,
        padding,
        paddingBottom: paddingY,
        paddingLeft: paddingX,
        paddingRight: paddingX,
        paddingTop: paddingY,
        width: props.width,
        alignItems: props.align,
    };
}
export function createSurfaceStyle(theme, props) {
    const tone = props.tone ?? "default";
    return {
        ...createBoxStyle(theme, {
            border: tone !== "transparent" ? props.border ?? true : false,
            shadow: props.shadow ?? (tone === "raised" ? "md" : tone === "transparent" ? undefined : "xs"),
            background: props.background ??
                {
                    default: "surface",
                    muted: "surfaceMuted",
                    raised: "surfaceRaised",
                    accent: "accentMuted",
                    transparent: "transparent",
                }[tone],
            radius: props.radius ?? "lg",
            padding: props.padding,
            paddingX: props.paddingX,
            paddingY: props.paddingY,
            gap: props.gap,
            direction: props.direction,
            justify: props.justify,
            align: props.align,
            wrap: props.wrap,
            grow: props.grow,
            shrink: props.shrink,
            width: props.width,
            height: props.height,
            minWidth: props.minWidth,
            minHeight: props.minHeight,
            maxWidth: props.maxWidth,
            maxHeight: props.maxHeight,
            margin: props.margin,
            basis: props.basis,
            foreground: props.foreground,
        }),
        borderColor: tone === "accent" ? theme.colors.accent : tone === "transparent" ? "transparent" : theme.colors.border,
    };
}
export function createTextStyle(theme, props) {
    const size = props.size ?? "md";
    const weight = props.weight ?? "medium";
    const tone = props.tone ?? "default";
    return {
        color: {
            default: theme.colors.foreground,
            muted: theme.colors.foregroundMuted,
            accent: theme.colors.accent,
            brand: theme.colors.primary,
            inverse: theme.colors.foregroundOnBrand,
        }[tone],
        fontFamily: props.mono ? theme.typography.family.mono : theme.typography.family.sans,
        fontSize: theme.typography.size[size],
        fontWeight: theme.typography.weight[weight],
        lineHeight: theme.typography.size[size] * theme.typography.lineHeight.normal,
        textAlign: props.align,
    };
}
