import path from "node:path";
import { CliError } from "./errors";
import { createInstalledFile } from "./componentState";
import type { ComponentPlan, ComponentState } from "./componentTypes";

function requestComponents(request: string, files: readonly { component: string; source: string }[]): string[] {
  if (request.startsWith("http://") || request.startsWith("https://") || request.startsWith("data:")) {
    return [...new Set(files.filter((file) => file.source.startsWith(`${request}#`)).map((file) => file.component))];
  }
  return [request.startsWith("@") ? request.slice(1).split("/").at(-1)! : request];
}

export function relativeComponentPath(cwd: string, target: string): string {
  return path.relative(cwd, target).split(path.sep).join("/");
}

export function assertCompatibleComponentState(state: ComponentState, plan: ComponentPlan): void {
  if (state.destinationRoot !== relativeComponentPath(plan.cwd, plan.destinationRoot) || state.platform !== plan.platform) {
    throw new CliError("The component directory or platform differs from the recorded installation. Restore the original synthex-ui.json before updating; moving an installation requires manual review.");
  }
}

export function stateForComponentInstall(plan: ComponentPlan, requests: readonly string[], previous: ComponentState | null): ComponentState {
  if (previous !== null) assertCompatibleComponentState(previous, plan);
  const files = { ...previous?.files };
  for (const file of plan.files) {
    const record = createInstalledFile(file, plan.cwd);
    files[record.path] = record;
  }
  const roots = new Set(requests.flatMap((request) => requestComponents(request, plan.files)));
  // A successful explicit re-install can change a component's registry origin.
  // Keep unrelated roots, but stop fetching superseded origins on update-all.
  const retained = (previous?.requests ?? []).filter((request) =>
    !requestComponents(request, Object.values(previous?.files ?? {})).some((component) => roots.has(component)),
  );
  return {
    version: 1,
    destinationRoot: relativeComponentPath(plan.cwd, plan.destinationRoot),
    platform: plan.platform,
    requests: [...new Set([...retained, ...requests])],
    files,
  };
}
