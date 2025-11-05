import type { ComponentNode } from "./component";

/**
 * Page metadata for SEO and sharing
 */
export interface PageMetadata {
	title: string;
	description: string;
	ogImage?: string;
	favicon?: string;
}

/**
 * Complete page structure
 */
export interface Page {
	id: string;
	name: string;
	slug: string;
	root: ComponentNode;
	metadata: PageMetadata;
	createdAt: number;
	updatedAt: number;
}

/**
 * Page creation input
 */
export interface CreatePageInput {
	name: string;
	slug?: string;
	metadata?: Partial<PageMetadata>;
}