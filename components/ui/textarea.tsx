import * as React from "react";
import { cn } from "@/lib/cn";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, invalid, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[120px] w-full rounded-xl border bg-neutral-50 px-4 py-3 text-sm leading-relaxed text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-thl-orange focus:ring-2 focus:ring-thl-orange/30 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-600",
          invalid
            ? "border-rose-400 dark:border-rose-700"
            : "border-neutral-300 dark:border-neutral-700",
          className,
        )}
        {...props}
      />
    );
  },
);
