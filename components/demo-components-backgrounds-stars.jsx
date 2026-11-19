"use client";

import { useTheme } from "next-themes";
import { StarsBackground } from "./animate-ui/components/backgrounds/stars";
import { cn } from "cn";

export const StarsBackgroundDemo = () => {
    const { resolvedTheme } = useTheme();

    return (
        <StarsBackground
            starColor="#FFF"
            className={cn(
                "absolute inset-0 flex items-center justify-center rounded-xl",
                "bg-[radial-gradient(ellipse_at_bottom,#262626_0%,#000_100%)]",
            )}
        />
    );
};
