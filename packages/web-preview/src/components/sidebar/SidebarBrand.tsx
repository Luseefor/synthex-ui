import { SidebarTrigger, useSidebar } from "synthex-ui/components";

export function SidebarBrand() {
  const { open, setOpen } = useSidebar();

  if (!open) {
    return (
      <div className="flex justify-center p-2.5">
        <button
          aria-label="Expand Sidebar"
          onClick={() => setOpen(true)}
          className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-[18px] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] shadow-sm"
        >
          <img src="/logo.png" alt="Synthex UI" className="h-full w-full object-cover" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[18px] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)]">
        <img src="/logo.png" alt="Synthex UI" className="h-full w-full object-cover" />
      </div>
      <div className="min-w-0 flex-1 truncate text-lg font-semibold text-[color:var(--sx-color-foreground)]">Synthex UI</div>
      <SidebarTrigger className="rounded-xl border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)]/70 hover:bg-[color:var(--sx-color-accent)]" />
    </div>
  );
}
