import { MermaidDiagram } from "./MermaidDiagram";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "synthex-ui";

const architectureDiagram = `
graph TD
    %% Core Engine
    subclass[Synthex Engine]
    core[("@synthex/core")]
    core --> |"Generates"| css("Tailwind v4 CSS")
    core --> |"Exports"| tokens("Design Tokens")

    %% React Implementation
    react[("@synthex/react-web")]
    core --> |"Powers"| react
    react --> |"Provides"| components("Primitive Components")
    react --> |"Provides"| hooks("Layout Hooks")

    %% Target Apps
    app1("Client Application A")
    app2("Client Application B")

    react --> |"Imports"| app1
    react --> |"Imports"| app2
    css --> |"Imports"| app1
    css --> |"Imports"| app2

    class core engine;
    class react engine;
    class css,tokens,components,hooks output;
    class app1,app2 app;
`;

export function ArchitectureSection() {
    return (
        <section className="preview-section" id="architecture">
            <div className="preview-section-header">
                <h2 className="preview-section-title">Architecture Walkthrough</h2>
                <p className="preview-section-description">
                    Synthex UI separates the core engine (tokens, schemas, configurations) from the
                    runtime implementation (React components).
                </p>
            </div>

            <Card variant="default" className="mt-6 border-[color:var(--sx-color-border)] shadow-sm">
                <CardHeader>
                    <CardTitle>Package Topology</CardTitle>
                    <CardDescription>
                        How the mono-repo distributes the design system across applications.
                    </CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto pb-8 pt-4">
                    <div className="min-w-[600px]">
                        <MermaidDiagram chart={architectureDiagram} />
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}
