import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold whitespace-nowrap transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-thl-orange/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-black [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-thl-orange text-black hover:bg-thl-orange-deep active:scale-[0.98] shadow-[0_8px_24px_-12px_rgba(247,97,3,0.6)]",
        secondary:
          "border border-neutral-300 text-neutral-700 hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-thl-orange dark:hover:text-thl-orange",
        ghost:
          "text-neutral-600 hover:text-thl-orange dark:text-neutral-300",
        destructive:
          "border border-neutral-300 text-neutral-600 hover:border-rose-400 hover:text-rose-500 dark:border-neutral-700 dark:text-neutral-300",
        discord:
          "bg-[#5865F2] text-white hover:bg-[#4752c4] shadow-[0_8px_24px_-12px_rgba(88,101,242,0.6)]",
        twitch:
          "bg-[#9146ff] text-white hover:bg-[#7c2bff] shadow-[0_8px_24px_-12px_rgba(145,70,255,0.6)]",
      },
      size: {
        default: "px-5 py-2.5",
        sm: "px-3 py-1.5 text-xs",
        lg: "px-6 py-3.5 text-base font-bold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, variant, size, asChild, ...props }, ref) {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);

export { buttonVariants };
