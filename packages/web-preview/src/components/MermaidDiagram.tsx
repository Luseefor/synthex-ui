import { useEffect, useId, useRef, useState } from "react";
import mermaid from "mermaid";

let mermaidInitialized = false;

interface MermaidDiagramProps {
    readonly chart: string;
    readonly className?: string;
}

export function MermaidDiagram({ chart, className }: MermaidDiagramProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const uniqueId = useId().replace(/:/g, "_");
    const [svg, setSvg] = useState("");

    useEffect(() => {
        if (!mermaidInitialized) {
            mermaid.initialize({
                startOnLoad: false,
                theme: "base",
                themeVariables: {
                    background: "var(--sx-color-surface)",
                    primaryColor: "var(--sx-color-surface-raised)",
                    primaryTextColor: "var(--sx-color-foreground)",
                    primaryBorderColor: "var(--sx-color-border-strong)",
                    secondaryColor: "var(--sx-color-background-subtle)",
                    secondaryTextColor: "var(--sx-color-foreground)",
                    secondaryBorderColor: "var(--sx-color-border)",
                    tertiaryColor: "var(--sx-color-accent)",
                    lineColor: "var(--sx-color-border-strong)",
                    textColor: "var(--sx-color-foreground)",
                    fontSize: "14px",
                    fontFamily: "var(--sx-font-family-sans)",
                },
            });
            mermaidInitialized = true;
        }

        let cancelled = false;

        mermaid
            .render(`mermaid-${uniqueId}`, chart)
            .then(({ svg: renderedSvg }) => {
                if (!cancelled) {
                    setSvg(renderedSvg);
                }
            })
            .catch((error) => {
                console.error("Mermaid render error:", error);
            });

        return () => {
            cancelled = true;
        };
    }, [chart, uniqueId]);

    return (
        <div
            ref={containerRef}
            className={className}
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}
