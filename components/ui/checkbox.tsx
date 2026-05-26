"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(function Checkbox({ className, ...props }, ref) {
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border border-neutral-300 bg-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-thl-orange/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white data-[state=checked]:border-thl-orange data-[state=checked]:bg-thl-orange dark:border-neutral-700 dark:bg-neutral-900 dark:focus-visible:ring-offset-black",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-black">
        <Check className="h-3.5 w-3.5 stroke-[3]" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});
