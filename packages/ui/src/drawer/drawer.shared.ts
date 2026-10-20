export type DrawerDirection = "top" | "bottom" | "left" | "right";

export interface DrawerSharedProps {
  readonly defaultOpen?: boolean;
  readonly direction?: DrawerDirection;
  readonly dismissible?: boolean;
  readonly modal?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly open?: boolean;
}
