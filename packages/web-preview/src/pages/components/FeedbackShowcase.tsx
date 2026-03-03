import {
  Alert,
  AlertDescription,
  AlertTitle,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
  Progress,
  Skeleton,
  Spinner,
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
} from "synthex-ui/components";
import { ShowcaseSection } from "./ShowcaseSection";

export function FeedbackShowcase() {
  return (
    <ShowcaseSection
      title="Feedback"
      description="Alerts, loading states, empty states, and toast variants presented as direct static examples instead of ad hoc triggers."
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
            <div className="preview-section-stack">
              <Toast open duration={0}>
                <div className="flex flex-1 flex-col gap-1">
                  <ToastTitle>Regular toast</ToastTitle>
                  <ToastDescription>Default neutral feedback for a normal completion state.</ToastDescription>
                </div>
                <ToastAction>Undo</ToastAction>
                <ToastClose />
              </Toast>
              <Toast open duration={0} variant="warning">
                <div className="flex flex-1 flex-col gap-1">
                  <ToastTitle>Alert toast</ToastTitle>
                  <ToastDescription>A warning surface for something that needs attention but is not destructive.</ToastDescription>
                </div>
                <ToastClose />
              </Toast>
              <Toast open duration={0} variant="destructive">
                <div className="flex flex-1 flex-col gap-1">
                  <ToastTitle>Critical toast</ToastTitle>
                  <ToastDescription>Destructive feedback for failed or irreversible actions.</ToastDescription>
                </div>
                <ToastClose />
              </Toast>
            </div>
          </ToastProvider>
        </div>
      </div>
    </ShowcaseSection>
  );
}
