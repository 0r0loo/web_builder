import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export interface LabelProps
	extends React.LabelHTMLAttributes<HTMLLabelElement> {
	required?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
	({ className, children, required, ...props }, ref) => {
		return (
			<label
				ref={ref}
				className={cn(
					"mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300",
					className,
				)}
				{...props}
			>
				{children}
				{required && <span className="ml-1 text-red-500">*</span>}
			</label>
		);
	},
);

Label.displayName = "Label";