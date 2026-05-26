import * as React from "react";
import { cn } from "@/lib/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** When true, paints the rose error border. */
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, invalid, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-xl border bg-neutral-50 px-4 text-sm font-semibold text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-thl-orange focus:ring-2 focus:ring-thl-orange/30 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-600",
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
