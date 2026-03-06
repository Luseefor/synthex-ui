import * as React from "react";
import { type VariantProps } from "../_shared/variants";
type ImageLoadingStatus = "idle" | "loading" | "loaded" | "error";
interface AvatarContextValue {
    readonly imageStatus: ImageLoadingStatus;
    readonly setImageStatus: (status: ImageLoadingStatus) => void;
}
export declare const avatarVariants: import("..").VariantDefinition<{
    readonly size: readonly ["sm", "md", "lg", "xl"];
}>;
export type AvatarVariantProps = VariantProps<typeof avatarVariants>;
export interface AvatarSharedProps extends AvatarVariantProps {
}
export declare function resolveAvatarVariants(props?: AvatarSharedProps): import("..").ResolvedVariants<import("..").VariantDefinition<{
    readonly size: readonly ["sm", "md", "lg", "xl"];
}>>;
export declare function AvatarProvider({ children, value, }: React.PropsWithChildren<{
    readonly value: AvatarContextValue;
}>): React.FunctionComponentElement<React.ProviderProps<AvatarContextValue | null>>;
export declare function useAvatarContext(): AvatarContextValue;
export {};
//# sourceMappingURL=avatar.shared.d.ts.map