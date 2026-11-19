"use client";

import * as React from "react";
import { CodeBlock as CodeBlockPrimitive } from "@/components/animate-ui/primitives/animate/code-block";
import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/animate-ui/components/buttons/copy";
import { getStrictContext } from "@/lib/get-strict-context";

const [CodeProvider, useCode] = getStrictContext("CodeContext");

function Code({ className, code, ...props }) {
    return (
        <CodeProvider value={{ code }}>
            <div
                className={cn(
                    "relative flex flex-col overflow-hidden",
                    "bg-[#0f0f11] border border-white/10 rounded-2xl",
                    className,
                )}
                {...props}
            />
        </CodeProvider>
    );
}

function CodeHeader({
    className,
    children,
    icon: Icon,
    copyButton = false,
    ...props
}) {
    const { code } = useCode();

    return (
        <div
            className={cn(
                "bg-[#18181b] shrink-0 gap-x-2",
                "border-b border-white/10",
                "text-sm flex text-zinc-400 items-center",
                "px-4 w-full h-11",
                className,
            )}
            {...props}
        >
            {Icon && <Icon className="size-4 text-zinc-400" />}
            {children}

            {copyButton && (
                <CopyButton
                    content={code}
                    size="xs"
                    variant="ghost"
                    className="ml-auto w-auto h-auto p-2 -mr-2 text-zinc-400 hover:text-white"
                />
            )}
        </div>
    );
}

function CodeBlock({ cursor, className, ...props }) {
    const { code } = useCode();
    const scrollRef = React.useRef(null);

    return (
        <CodeBlockPrimitive
            ref={scrollRef}
            theme="dark"
            scrollContainerRef={scrollRef}
            className={cn(
                "relative text-sm p-4 overflow-auto",
                "bg-[#0f0f11] text-zinc-200",
                "[&>pre,&_code]:bg-transparent! [&>pre,&_code]:[background:transparent_!important]",
                "[&>pre,&_code]:border-none",
                "[&_code]:text-[13px]!",
                "[&_code_.line]:px-0!",
                "[&::-webkit-scrollbar]:w-2",
                "[&::-webkit-scrollbar]:h-2",
                "[&::-webkit-scrollbar-thumb]:bg-zinc-700",
                "[&::-webkit-scrollbar-thumb]:rounded-full",
                cursor &&
                    "data-[done=false]:[&_.line:last-of-type::after]:content-['|'] data-[done=false]:[&_.line:last-of-type::after]:inline-block data-[done=false]:[&_.line:last-of-type::after]:w-[1ch] data-[done=false]:[&_.line:last-of-type::after]:-translate-px",
                className,
            )}
            code={code}
            {...props}
        />
    );
}

export { Code, CodeHeader, CodeBlock };
