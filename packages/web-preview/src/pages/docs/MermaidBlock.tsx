import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

export function MermaidBlock({ chart }: { readonly chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [id] = useState(() => `mermaid-${Math.random().toString(36).slice(2, 9)}`);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: "dark", securityLevel: "loose" });
    mermaid.render(id, chart.trim()).then(({ svg }) => {
      if (ref.current) ref.current.innerHTML = svg;
    }).catch(() => {
      if (ref.current) ref.current.textContent = "Mermaid syntax error";
    });
  }, [chart, id]);

  return <div className="preview-mermaid"><div ref={ref} /></div>;
}
