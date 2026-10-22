import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
  Progress,
  Skeleton,
  Spinner,
  ToastProvider,
  ToastViewport,
  useToast,
} from "synthex-ui/components";
import { ShowcaseSection } from "./ShowcaseSection";

function ToastExamples() {
  const { toast } = useToast();
  return <div className="preview-section-stack">
    <p>Open a toast to inspect its colors, actions, and dismissal.</p>
    <div className="preview-inline-row preview-wrap">
      <Button variant="outline" onClick={() => toast({ title: "Regular toast", description: "Your changes were saved.", actionLabel: "Undo", duration: 8000 })}>Show regular toast</Button>
      <Button variant="outline" onClick={() => toast({ title: "Alert toast", description: "This deployment needs attention.", variant: "warning", duration: 8000 })}>Show warning toast</Button>
      <Button variant="destructive" onClick={() => toast({ title: "Critical toast", description: "The deployment failed. Try again.", variant: "destructive", duration: 8000 })}>Show critical toast</Button>
    </div>
    <ToastViewport />
  </div>;
}

export function FeedbackShowcase() {
  return (
    <ShowcaseSection
      title="Feedback"
      description="Alerts, loading states, empty states, and interactive toast feedback."
      includes={["Alert", "Empty", "Progress", "Skeleton", "Spinner", "Toast"]}
    >
      <div className="preview-section-stack">
        <div className="preview-grid-2">
          <Alert>
            <AlertTitle>Build succeeded</AlertTitle>
            <AlertDescription>Feedback surfaces should stay legible and stable without page-specific styling hacks.</AlertDescription>
          </Alert>
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No deployments yet</EmptyTitle>
              <EmptyDescription>Create a preview deployment to populate release history here.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
        <div className="preview-grid-2">
          <div className="preview-section-stack">
            <Progress value={72} />
            <div className="preview-inline-row"><Spinner size="sm" /><span>Publishing package metadata…</span></div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[78%]" />
          </div>
          <ToastProvider>
            <ToastExamples />
          </ToastProvider>
        </div>
      </div>
    </ShowcaseSection>
  );
}
