export interface GalleryComponent {
    readonly name: string;
    readonly description: string;
    readonly category: string;
}

export const GALLERY_COMPONENTS: readonly GalleryComponent[] = [
    { name: "Button", description: "Primary action trigger with multiple variants and sizes.", category: "Inputs" },
    { name: "Input", description: "Standard text input with support for icons and validation states.", category: "Inputs" },
    { name: "Select", description: "Searchable or standard dropdown list for selection.", category: "Inputs" },
    { name: "Checkbox", description: "Toggleable control for boolean state.", category: "Inputs" },
    { name: "Textarea", description: "Multiline text input for larger content.", category: "Inputs" },
    { name: "Card", description: "Container for grouping related content with headers and footers.", category: "Display" },
    { name: "Badge", description: "Small status indicator or label.", category: "Display" },
    { name: "Table", description: "Structured data display with headers and rows.", category: "Data" },
    { name: "Chart", description: "Visual data representation (Line, Bar, Area).", category: "Data" },
    { name: "Tabs", description: "Content navigation via tabs.", category: "Navigation" },
    { name: "Breadcrumb", description: "Hierarchical navigation trail.", category: "Navigation" },
    { name: "Sidebar", description: "Vertical navigation and application structure.", category: "Navigation" },
    { name: "Accordion", description: "Collapsible content sections.", category: "Utility" },
    { name: "Dialog", description: "Modal overlay for critical interactions.", category: "Overlay" },
    { name: "Drawer", description: "Slide-out panel from the edge of the screen.", category: "Overlay" },
    { name: "Tooltip", description: "Brief information popup on hover.", category: "Overlay" },
    { name: "Toast", description: "Ephemeral notification system.", category: "Overlay" },
];

export interface DocMetadata {
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly icon: "file" | "bookOpen" | "activity" | "layout" | "palette" | "terminal";
    readonly content: string;
}

// Import documentation content as raw strings
import gettingStartedContent from "../../../docs/getting-started.md?raw";
import mermaidArchitectureContent from "../../../docs/mermaid-architecture.md?raw";
import stylingContent from "../../../docs/styling.md?raw";
import themingContent from "../../../docs/theming.md?raw";
import workbenchContent from "../../../docs/workbench.md?raw";

export const DOCS_METADATA: readonly DocMetadata[] = [
    {
        id: "getting-started",
        title: "Getting Started",
        description: "Installation, build setup, and first steps.",
        icon: "bookOpen",
        content: gettingStartedContent,
    },
    {
        id: "mermaid-architecture",
        title: "Mermaid Architecture",
        description: "Visual package topology and system flows.",
        icon: "activity",
        content: mermaidArchitectureContent,
    },
    {
        id: "styling",
        title: "Styling Guide",
        description: "Tailwind integration and CSS primitives.",
        icon: "layout",
        content: stylingContent,
    },
    {
        id: "theming",
        title: "Theming System",
        description: "Semantic tokens and dark mode logic.",
        icon: "palette",
        content: themingContent,
    },
    {
        id: "workbench",
        title: "Workbench Internals",
        description: "Layout engine and docking behavior.",
        icon: "terminal",
        content: workbenchContent,
    },
];
