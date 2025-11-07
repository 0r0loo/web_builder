import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const inputVariants = cva(
	"w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-1",
	{
		variants: {
			variant: {
				default:
					"border-zinc-200 text-zinc-900 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100",
				readonly:
					"border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export interface InputProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
		VariantProps<typeof inputVariants> {
	error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
	({ className, variant, error, ...props }, ref) => {
		return (
			<input
				ref={ref}
				className={cn(
					inputVariants({ variant }),
					error &&
						"border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-600",
					className,
				)}
				{...props}
			/>
		);
	},
);

Input.displayName = "Input";