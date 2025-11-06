import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { pages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 * GET /api/projects/[id]/pages
 * 프로젝트의 모든 페이지 조회
 */
export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;

		const projectPages = await db
			.select()
			.from(pages)
			.where(eq(pages.projectId, id));

		return NextResponse.json(projectPages);
	} catch (error) {
		console.error("Failed to fetch pages:", error);
		return NextResponse.json(
			{ error: "Failed to fetch pages" },
			{ status: 500 },
		);
	}
}

/**
 * POST /api/projects/[id]/pages
 * 프로젝트에 새 페이지 생성
 */
export async function POST(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id: projectId } = await params;
		const body = await request.json();
		const { name, slug, root, metadata } = body;

		if (!name || !slug || !root) {
			return NextResponse.json(
				{ error: "name, slug, and root are required" },
				{ status: 400 },
			);
		}

		const newPage = await db
			.insert(pages)
			.values({
				id: nanoid(),
				projectId,
				name,
				slug,
				root,
				metadata: metadata || null,
			})
			.returning();

		return NextResponse.json(newPage[0], { status: 201 });
	} catch (error) {
		console.error("Failed to create page:", error);
		return NextResponse.json(
			{ error: "Failed to create page" },
			{ status: 500 },
		);
	}
}