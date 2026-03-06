import * as React from "react";
import { type AvatarSharedProps } from "./avatar.shared";
export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement>, AvatarSharedProps {
}
export declare const Avatar: React.ForwardRefExoticComponent<AvatarProps & React.RefAttributes<HTMLDivElement>>;
export interface AvatarImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "size"> {
}
export declare const AvatarImage: React.ForwardRefExoticComponent<AvatarImageProps & React.RefAttributes<HTMLImageElement>>;
export interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement>, AvatarSharedProps {
}
export declare const AvatarFallback: React.ForwardRefExoticComponent<AvatarFallbackProps & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=avatar.web.d.ts.map