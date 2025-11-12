import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100",
          error &&
            "border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-600",
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";
