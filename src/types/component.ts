import type React from "react";

/**
 * Supported component types in the builder
 */
export type ComponentType =
	| "container"
	| "text"
	| "heading"
	| "paragraph"
	| "button"
	| "image"
	| "link"
	| "section"
	| "grid"
	| "flex"
	| "spacer";

/**
 * Component category for organization in the component library
 */
export type ComponentCategory = "layout" | "content" | "media" | "form";

/**
 * Breakpoints for responsive design
 */
export type Breakpoint = "mobile" | "tablet" | "desktop";

/**
 * Responsive styles for each breakpoint
 */
export interface ResponsiveStyles {
	mobile?: React.CSSProperties;
	tablet?: React.CSSProperties;
	desktop?: React.CSSProperties;
}

/**
 * Component node representing a single component in the page tree
 */
export interface ComponentNode {
	id: string;
	type: ComponentType;
	props: Record<string, any>;
	styles: ResponsiveStyles;
	children?: ComponentNode[];
}

/**
 * Property definition for component editing UI
 */
export interface PropDefinition {
	name: string;
	label: string;
	type: "text" | "number" | "color" | "select" | "boolean" | "textarea";
	defaultValue: any;
	options?: Array<{ label: string; value: any }>;
}

/**
 * Component definition for registration in the component library
 */
export interface ComponentDefinition {
	type: ComponentType;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
	category: ComponentCategory;
	defaultProps: Record<string, any>;
	defaultStyles: ResponsiveStyles;
	editableProps: PropDefinition[];
	render: (
		props: any,
		styles: React.CSSProperties,
		children?: React.ReactNode,
	) => React.ReactNode;
}