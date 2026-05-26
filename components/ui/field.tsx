import * as React from "react";
import { cn } from "@/lib/cn";
import { Label } from "@/components/ui/label";

/**
 * Vertical form field cluster: label + (optional) hint + control + (optional)
 * error. Designed to wrap a single shadcn primitive.
 */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  className,
  children,
}: {
  label: React.ReactNode;
  htmlFor?: string;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("block", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {hint && (
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          {hint}
        </p>
      )}
      <div className="mt-2">{children}</div>
      {error && (
        <p className="mt-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}
