import type { ReactNode } from "react";
import { H1, H2, H3 } from "synthex-ui/components";
import { MermaidBlock } from "./MermaidBlock";

function Inline({ text }: { readonly text: string }) {
  return text.split("`").map((part, index) => index % 2 ? <code key={index} className="preview-inline-code">{part}</code> : part);
}

export function MarkdownRenderer({ content }: { readonly content: string }) {
  const lines = content.split("\n");
  const output: ReactNode[] = [];
  let codeLang = "";
  let code: string[] = [];

  const flushCode = (key: string) => {
    const value = code.join("\n").trim();
    output.push(codeLang === "mermaid" ? <MermaidBlock key={key} chart={value} /> : <pre key={key} className="preview-code-block"><code>{value}</code></pre>);
    code = [];
    codeLang = "";
  };

  lines.forEach((line, index) => {
    if (line.startsWith("```")) return codeLang ? flushCode(`code-${index}`) : void (codeLang = line.slice(3).trim() || "txt");
    if (codeLang) return void code.push(line);
    if (line.startsWith("# ")) return void output.push(<H1 key={index}>{line.slice(2)}</H1>);
    if (line.startsWith("## ")) return void output.push(<H2 key={index}>{line.slice(3)}</H2>);
    if (line.startsWith("### ")) return void output.push(<H3 key={index}>{line.slice(4)}</H3>);
    if (line.trim().startsWith("- ")) return void output.push(<div key={index} className="preview-doc-bullet"><span>•</span><span><Inline text={line.trim().slice(2)} /></span></div>);
    if (line.trim()) output.push(<p key={index} className="preview-doc-copy"><Inline text={line} /></p>);
  });

  if (codeLang) flushCode("code-final");
  return <div className="preview-doc-stack">{output}</div>;
}
