export function normalizePanelSizes(panels) {
    if (panels.length === 0) {
        return [];
    }
    const explicitTotal = panels.reduce((total, panel) => total + (panel.defaultSize ?? 0), 0);
    const unspecifiedCount = panels.filter((panel) => panel.defaultSize == null).length;
    if (explicitTotal <= 0) {
        return panels.map(() => 100 / panels.length);
    }
    const remaining = Math.max(0, 100 - explicitTotal);
    const fallbackSize = unspecifiedCount > 0 ? remaining / unspecifiedCount : 0;
    return panels.map((panel) => panel.defaultSize ?? fallbackSize);
}
export function clampPanelSizes(sizes, index, delta, panels) {
    const currentPanel = panels[index];
    const nextPanel = panels[index + 1];
    if (!currentPanel || !nextPanel) {
        return [...sizes];
    }
    const current = [...sizes];
    const currentSize = current[index] ?? 0;
    const nextSize = current[index + 1] ?? 0;
    const currentTotal = currentSize + nextSize;
    const minCurrent = currentPanel.minSize;
    const minNext = nextPanel.minSize;
    const nextCurrent = Math.min(currentTotal - minNext, Math.max(minCurrent, currentSize + delta));
    current[index] = nextCurrent;
    current[index + 1] = currentTotal - nextCurrent;
    return current;
}
