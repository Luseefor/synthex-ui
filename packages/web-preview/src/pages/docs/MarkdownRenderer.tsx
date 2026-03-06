import type { ReactNode } from "react";
import { H1, H2, H3 } from "synthex-ui/components";
import { MermaidBlock } from "./MermaidBlock";

function Inline({ text }: { readonly text: string }) {
  return text.split("`").map((part, index) => index % 2 ? <code key={index} className="preview-inline-code">{part}</code> : part);
}

function parseTableRow(line: string) {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed
    .split("|")
    .map((cell) => cell.trim())
    .filter((cell, index, arr) => !(arr.length === 1 && index === 0 && cell.length === 0));
}

function isTableDivider(line: string) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
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

  let index = 0;
  while (index < lines.length) {
    const line = lines[index] ?? "";

    if (line.startsWith("```")) {
      if (codeLang) {
        flushCode(`code-${index}`);
      } else {
        codeLang = line.slice(3).trim() || "txt";
      }
      index += 1;
      continue;
    }

    if (codeLang) {
      code.push(line);
      index += 1;
      continue;
    }

    const nextLine = lines[index + 1] ?? "";
    if (line.trim().startsWith("|") && isTableDivider(nextLine)) {
      const headers = parseTableRow(line);
      const rows: string[][] = [];
      index += 2;

      while (index < lines.length && (lines[index] ?? "").trim().startsWith("|")) {
        rows.push(parseTableRow(lines[index] ?? ""));
        index += 1;
      }

      output.push(
        <div key={`table-${index}`} className="preview-doc-table-wrap">
          <table className="preview-doc-table">
            <thead>
              <tr>
                {headers.map((header, headerIndex) => (
                  <th key={`h-${headerIndex}`}>
                    <Inline text={header} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={`r-${rowIndex}`}>
                  {headers.map((_, cellIndex) => (
                    <td key={`c-${rowIndex}-${cellIndex}`}>
                      <Inline text={row[cellIndex] ?? ""} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    if (line.startsWith("# ")) {
      output.push(<H1 key={index}>{line.slice(2)}</H1>);
      index += 1;
      continue;
    }
    if (line.startsWith("## ")) {
      output.push(<H2 key={index}>{line.slice(3)}</H2>);
      index += 1;
      continue;
    }
    if (line.startsWith("### ")) {
      output.push(<H3 key={index}>{line.slice(4)}</H3>);
      index += 1;
      continue;
    }
    if (line.trim().startsWith("- ")) {
      output.push(<div key={index} className="preview-doc-bullet"><span>•</span><span><Inline text={line.trim().slice(2)} /></span></div>);
      index += 1;
      continue;
    }
    if (line.trim()) {
      output.push(<p key={index} className="preview-doc-copy"><Inline text={line} /></p>);
    }
    index += 1;
  }

  if (codeLang) flushCode("code-final");
  return <div className="preview-doc-stack">{output}</div>;
}
