import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        real: "rounded-full border-verdict-real/60 bg-verdict-real/10 text-verdict-real font-type tracking-wide",
        fake: "rounded-full border-verdict-fake/60 bg-verdict-fake/10 text-verdict-fake font-type tracking-wide",
        neutral: "rounded-full border-ink/30 bg-paper/60 text-ink-soft font-type tracking-wide",
        clipping:
          "cursor-pointer rounded-sm border-ink/40 bg-paper px-3 py-1 font-body text-ink shadow-paper hover:-translate-y-0.5 hover:border-ink transition-transform",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
