import type { ComponentNode } from "./component";

/**
 * SEO 및 공유를 위한 페이지 메타데이터
 */
export interface PageMetadata {
	title: string;
	description: string;
	ogImage?: string;
	favicon?: string;
}

/**
 * 완전한 페이지 구조
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
 * 페이지 생성 입력 타입
 */
export interface CreatePageInput {
	name: string;
	slug?: string;
	metadata?: Partial<PageMetadata>;
}