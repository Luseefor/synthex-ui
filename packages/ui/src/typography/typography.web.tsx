import * as React from "react";
import { cn } from "../_shared/variants";

function H1({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      data-slot="typography-h1"
      className={cn(
        "scroll-m-20 text-4xl font-extrabold tracking-tight text-balance",
        className,
      )}
      {...props}
    />
  );
}

function H2({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      data-slot="typography-h2"
      className={cn(
        "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
        className,
      )}
      {...props}
    />
  );
}

function H3({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      data-slot="typography-h3"
      className={cn("scroll-m-20 text-2xl font-semibold tracking-tight", className)}
      {...props}
    />
  );
}

function H4({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h4
      data-slot="typography-h4"
      className={cn("scroll-m-20 text-xl font-semibold tracking-tight", className)}
      {...props}
    />
  );
}

function P({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="typography-p"
      className={cn("leading-7 [&:not(:first-child)]:mt-6", className)}
      {...props}
    />
  );
}

function Blockquote({ className, ...props }: React.HTMLAttributes<HTMLQuoteElement>) {
  return (
    <blockquote
      data-slot="typography-blockquote"
      className={cn("mt-6 border-l-2 pl-6 italic", className)}
      {...props}
    />
  );
}

function Code({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <code
      data-slot="typography-code"
      className={cn(
        "bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
        className,
      )}
      {...props}
    />
  );
}

function Lead({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="typography-lead"
      className={cn("text-muted-foreground text-xl", className)}
      {...props}
    />
  );
}

function Large({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="typography-large"
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  );
}

function Small({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <small
      data-slot="typography-small"
      className={cn("text-sm leading-none font-medium", className)}
      {...props}
    />
  );
}

function Muted({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p data-slot="typography-muted" className={cn("text-muted-foreground text-sm", className)} {...props} />
  );
}

export { H1, H2, H3, H4, P, Blockquote, Code, Lead, Large, Small, Muted };
