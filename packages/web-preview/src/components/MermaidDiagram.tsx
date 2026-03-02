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
        let cancelled = false;

        const renderDiagram = async () => {
            try {
                if (!mermaidInitialized) {
                    mermaid.initialize({
                        startOnLoad: false,
                        theme: "base",
                        themeVariables: {
                            background: "transparent",
                            fontSize: "14px",
                            fontFamily: "Inter, sans-serif",
                        },
                    });
                    mermaidInitialized = true;
                }

                const { svg: renderedSvg } = await mermaid.render(`mermaid-${uniqueId}`, chart);
                if (!cancelled) {
                    setSvg(renderedSvg);
                }
            } catch (error) {
                console.error("Mermaid render error:", error);
                if (!cancelled) {
                    setSvg(`<div class="p-4 text-sm text-[color:var(--sx-color-destructive)]">Failed to render diagram</div>`);
                }
            }
        };

        renderDiagram();

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
