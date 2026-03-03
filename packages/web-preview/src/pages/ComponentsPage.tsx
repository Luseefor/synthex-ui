import { Badge, H2, Muted } from "synthex-ui/components";
import { DataShowcase } from "./components/DataShowcase";
import { FormShowcase } from "./components/FormShowcase";
import { LayoutShowcase } from "./components/LayoutShowcase";
import { NavigationShowcase } from "./components/NavigationShowcase";
import { OverlayShowcase } from "./components/OverlayShowcase";

export function ComponentsPage() {
  return (
    <section className="preview-page-stack">
      <div className="preview-page-heading">
        <Badge variant="outline">Library Surface</Badge>
        <H2>Component gallery</H2>
        <Muted>This route exercises the exported components directly so the preview stays grounded in the actual public package.</Muted>
      </div>
      <FormShowcase />
      <NavigationShowcase />
      <LayoutShowcase />
      <DataShowcase />
      <OverlayShowcase />
    </section>
  );
}
