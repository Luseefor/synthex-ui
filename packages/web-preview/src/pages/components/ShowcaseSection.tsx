import type { ReactNode } from "react";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, Small } from "synthex-ui/components";

interface ShowcaseSectionProps {
  readonly title: string;
  readonly description: string;
  readonly includes: readonly string[];
  readonly children: ReactNode;
  readonly frameClassName?: string;
}

export function ShowcaseSection({ children, description, frameClassName, includes, title }: ShowcaseSectionProps) {
  return (
    <Card>
      <CardHeader className="preview-section-stack gap-3">
        <div className="preview-section-heading">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="preview-section-meta">
          <Small>Includes</Small>
          <div className="preview-chip-row">
            {includes.map((item) => (
              <Badge key={item} variant="outline">{item}</Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`preview-demo-frame ${frameClassName ?? ""}`.trim()}>
          {children}
        </div>
      </CardContent>
    </Card>
  );
}
