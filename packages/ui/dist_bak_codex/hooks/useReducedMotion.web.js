import { useEffect, useState } from "react";
export function useReducedMotion() {
    const [reducedMotion, setReducedMotion] = useState(false);
    useEffect(() => {
        if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
            return;
        }
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        const listener = () => {
            setReducedMotion(mediaQuery.matches);
        };
        listener();
        mediaQuery.addEventListener("change", listener);
        return () => {
            mediaQuery.removeEventListener("change", listener);
        };
    }, []);
    return reducedMotion;
}
