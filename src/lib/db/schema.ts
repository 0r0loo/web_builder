import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import type { ComponentNode } from "@/types/component";
import type { PageMetadata } from "@/types/page";

/**
 * Projects (프로젝트/사이트)
 * 사용자가 생성한 웹사이트 프로젝트
 */
export const projects = pgTable("projects", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	description: text("description"),
	thumbnail: text("thumbnail"), // 썸네일 이미지 URL
	settings: jsonb("settings").$type<{
		defaultPage?: string; // 홈페이지로 사용할 페이지 ID
		domain?: string; // 커스텀 도메인
		favicon?: string; // 파비콘
		theme?: {
			primaryColor: string;
			fontFamily: string;
		};
	}>(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Pages (페이지)
 * 프로젝트 내의 개별 페이지
 */
export const pages = pgTable("pages", {
	id: text("id").primaryKey(),
	projectId: text("project_id")
		.notNull()
		.references(() => projects.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	slug: text("slug").notNull(), // URL 경로 (예: "/", "/about", "/contact")
	root: jsonb("root").$type<ComponentNode>().notNull(), // 컴포넌트 트리
	metadata: jsonb("metadata").$type<PageMetadata>(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 타입 추론용 export
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;