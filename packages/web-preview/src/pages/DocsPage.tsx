import { useMemo, useState } from "react";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, H2, Muted } from "synthex-ui/components";
import { ActivityIcon, BookOpenIcon, FileIcon, GridIcon, PaletteIcon, TerminalIcon } from "synthex-ui/icons";
import { DOCS_METADATA } from "../data";
import { MarkdownRenderer } from "./docs/MarkdownRenderer";

const ICONS = { activity: ActivityIcon, bookOpen: BookOpenIcon, file: FileIcon, layout: GridIcon, palette: PaletteIcon, terminal: TerminalIcon };

export function DocsPage() {
  const [selectedDocId, setSelectedDocId] = useState(DOCS_METADATA[0]?.id ?? "");
  const selectedDoc = useMemo(() => DOCS_METADATA.find((item) => item.id === selectedDocId) ?? DOCS_METADATA[0], [selectedDocId]);
  if (!selectedDoc) return null;

  return (
    <section className="preview-page-stack">
      <div className="preview-page-heading">
        <Badge variant="outline">Documentation</Badge>
        <H2>Documentation</H2>
        <Muted>Architecture, theming, and workbench notes from the repo docs directory, framed inside the same shell as the rest of the preview.</Muted>
      </div>
      <div className="preview-docs-grid">
        <aside className="preview-page-stack">
          <Card>
            <CardHeader>
              <CardTitle>Docs index</CardTitle>
              <CardDescription>Browse the markdown-backed reference pages bundled into the preview.</CardDescription>
            </CardHeader>
            <CardContent className="preview-page-stack">
              <nav className="preview-page-stack">{DOCS_METADATA.map((doc) => { const Icon = ICONS[doc.icon]; return <button key={doc.id} onClick={() => setSelectedDocId(doc.id)} className={`preview-doc-nav ${selectedDocId === doc.id ? "preview-doc-nav-active" : ""}`}><Icon size={16} /><span>{doc.title}</span></button>; })}</nav>
            </CardContent>
          </Card>
          <Card><CardContent className="preview-page-stack"><Muted>Open the repo docs if you want to edit the markdown sources directly.</Muted><Button variant="outline" onClick={() => window.open("https://github.com/Luseefor/synthex-ui", "_blank")}>View Repository</Button></CardContent></Card>
        </aside>
        <article className="preview-doc-article">
          <div className="preview-doc-breadcrumb">Synthex UI / Docs / {selectedDoc.id}.md</div>
          <MarkdownRenderer content={selectedDoc.content} />
        </article>
      </div>
    </section>
  );
}
