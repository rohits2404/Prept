import * as React from "react";
import { cva } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-[color,box-shadow] overflow-hidden",
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",

                secondary:
                    "bg-white/10 text-stone-200 border-white/10 [a&]:hover:bg-white/15",

                destructive:
                    "bg-destructive text-white [a&]:hover:bg-destructive/90",

                outline:
                    "border-white/20 bg-white/5 text-stone-300 [a&]:hover:bg-white/10 [a&]:hover:text-white",

                ghost: "text-stone-300 [a&]:hover:bg-white/10 [a&]:hover:text-white",

                link: "text-amber-400 underline-offset-4 [a&]:hover:underline",

                gold: "border-amber-400/30 bg-amber-400/10 text-amber-300 py-1 px-3",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    },
);

function Badge({ className, variant = "default", asChild = false, ...props }) {
    const Comp = asChild ? Slot.Root : "span";

    return (
        <Comp
            data-slot="badge"
            data-variant={variant}
            className={cn(badgeVariants({ variant }), className)}
            {...props}
        />
    );
}

export { Badge, badgeVariants };
