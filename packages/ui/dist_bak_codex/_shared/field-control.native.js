export function createFieldControlStyle(theme, { multiline = false, size = "md", tone = "default", }) {
    const singleLineSizeMap = {
        sm: {
            minHeight: 36,
            paddingHorizontal: 12,
            fontSize: 13,
        },
        md: {
            minHeight: 40,
            paddingHorizontal: 14,
            fontSize: theme.typography.size.sm,
        },
        lg: {
            minHeight: 44,
            paddingHorizontal: 16,
            fontSize: 15,
        },
    };
    const multilineSizeMap = {
        sm: {
            minHeight: 108,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 13,
        },
        md: {
            minHeight: 132,
            paddingHorizontal: 14,
            paddingVertical: 12,
            fontSize: theme.typography.size.sm,
        },
        lg: {
            minHeight: 164,
            paddingHorizontal: 16,
            paddingVertical: 14,
            fontSize: 15,
        },
    };
    return {
        borderWidth: 1,
        borderRadius: theme.radius.md,
        borderColor: tone === "invalid" ? theme.colors.destructive : theme.colors.border,
        backgroundColor: theme.colors.surfaceRaised,
        color: theme.colors.foreground,
        fontFamily: theme.typography.family.sans,
        ...(multiline ? multilineSizeMap[size] : singleLineSizeMap[size]),
    };
}
