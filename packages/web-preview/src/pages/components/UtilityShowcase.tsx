import {
  Alert,
  AlertDescription,
  AlertTitle,
  AspectRatio,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  H1,
  H3,
  Input,
  InputGroup,
  InputGroupAddon,
  Item,
  ItemDescription,
  ItemTitle,
  Kbd,
  Lead,
  Small,
  Spinner,
} from "synthex-ui/components";
import { ShowcaseSection } from "./ShowcaseSection";

export function UtilityShowcase() {
  return (
    <ShowcaseSection
      title="Utilities and typography"
      description="Shared reading rhythm, inline utility primitives, avatar surfaces, and supporting doc elements with minimal wrapper code."
      includes={["Badge", "Kbd", "Avatar", "AspectRatio", "Typography", "InputGroup", "Alert"]}
    >
      <div className="preview-section-stack">
        <div className="preview-grid-2">
          <div className="preview-section-stack">
            <div className="preview-inline-row preview-wrap">
              <Badge>Stable</Badge>
              <Badge variant="outline">Token aware</Badge>
              <div className="preview-inline-row">
                <Kbd className="min-w-[2.25rem] font-sans text-sm">⌘</Kbd>
                <span className="text-sm text-[color:var(--sx-color-foreground-muted)]">+</span>
                <Kbd className="min-w-[2.25rem] font-sans text-sm">K</Kbd>
              </div>
            </div>
            <div className="preview-section-stack">
              <H1>Component docs</H1>
              <H3>Readable defaults</H3>
              <Lead>Typography, spacing, and utility rows should work together without custom wrappers on every screen.</Lead>
              <Small>Use the same exported primitives in docs, dashboards, and builders.</Small>
            </div>
            <InputGroup>
              <InputGroupAddon>https://</InputGroupAddon>
              <Input defaultValue="synthex-ui.rijan.sh" />
            </InputGroup>
          </div>
          <AspectRatio ratio={16 / 9}>
            <div className="preview-pane flex h-full items-center justify-center gap-3">
              <img src="/logo.png" alt="Synthex UI" className="h-10 w-10 rounded-xl object-cover" />
              <div className="preview-section-stack gap-1">
                <span className="text-sm font-semibold">Preview brand tile</span>
                <Small>Locked to a predictable ratio for cards and media surfaces.</Small>
              </div>
            </div>
          </AspectRatio>
        </div>
        <Item>
          <Avatar>
            <AvatarImage src="/logo.png" alt="Synthex UI" />
            <AvatarFallback>SU</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <ItemTitle>Shared identity row</ItemTitle>
            <ItemDescription>Avatar, title, description, and status utilities compose into compact product list items.</ItemDescription>
          </div>
          <Spinner size="sm" />
        </Item>
        <Alert>
          <AlertTitle>Heads up</AlertTitle>
          <AlertDescription>Utility components should remain legible and polished without page-specific styling overrides.</AlertDescription>
        </Alert>
        <Card>
          <CardHeader><CardTitle>Card footer</CardTitle><CardDescription>Cards expose a footer slot for compact actions or metadata.</CardDescription></CardHeader>
          <CardFooter className="preview-inline-row"><Badge variant="outline">Footer</Badge><Small>Shared footer content</Small></CardFooter>
        </Card>
      </div>
    </ShowcaseSection>
  );
}
