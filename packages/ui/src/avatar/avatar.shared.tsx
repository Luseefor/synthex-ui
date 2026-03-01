import * as React from "react";
import { defineVariants, resolveVariants, type VariantProps } from "../_shared/variants";

type ImageLoadingStatus = "idle" | "loading" | "loaded" | "error";

interface AvatarContextValue {
  readonly imageStatus: ImageLoadingStatus;
  readonly setImageStatus: (status: ImageLoadingStatus) => void;
}

const AvatarContext = React.createContext<AvatarContextValue | null>(null);

export const avatarVariants = defineVariants({
  variants: {
    size: ["sm", "md", "lg", "xl"] as const,
  },
  defaultVariants: {
    size: "md",
  },
});

export type AvatarVariantProps = VariantProps<typeof avatarVariants>;

export interface AvatarSharedProps extends AvatarVariantProps {}

export function resolveAvatarVariants(props?: AvatarSharedProps) {
  return resolveVariants(avatarVariants, props);
}

export function AvatarProvider({
  children,
  value,
}: React.PropsWithChildren<{ readonly value: AvatarContextValue }>) {
  return React.createElement(AvatarContext.Provider, { value }, children);
}

export function useAvatarContext() {
  const context = React.useContext(AvatarContext);

  if (!context) {
    throw new Error("Avatar components must be used within <Avatar>.");
  }

  return context;
}
