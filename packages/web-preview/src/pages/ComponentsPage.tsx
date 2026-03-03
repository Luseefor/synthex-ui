import { Badge, H2, Muted } from "synthex-ui/components";
import { DataShowcase } from "./components/DataShowcase";
import { FeedbackShowcase } from "./components/FeedbackShowcase";
import { FormShowcase } from "./components/FormShowcase";
import { LayoutShowcase } from "./components/LayoutShowcase";
import { NavigationShowcase } from "./components/NavigationShowcase";
import { OverlayShowcase } from "./components/OverlayShowcase";
import { UtilityShowcase } from "./components/UtilityShowcase";
import { WorkbenchShowcase } from "./components/WorkbenchShowcase";

export function ComponentsPage() {
  return (
    <section className="preview-page-stack">
      <div className="preview-page-heading">
        <Badge variant="outline">Components</Badge>
        <H2>Component gallery</H2>
        <Muted>This route exercises the exported components directly inside the same preview shell, so it reads like the rest of the product instead of a separate demo surface.</Muted>
      </div>
      <FormShowcase />
      <UtilityShowcase />
      <NavigationShowcase />
      <LayoutShowcase />
      <FeedbackShowcase />
      <DataShowcase />
      <OverlayShowcase />
      <WorkbenchShowcase />
    </section>
  );
}
