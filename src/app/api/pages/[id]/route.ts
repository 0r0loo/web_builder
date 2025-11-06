import { db } from "@/lib/db";
import { pages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 * GET /api/pages/[id]
 * 특정 페이지 조회
 */
export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;

		const page = await db.select().from(pages).where(eq(pages.id, id));

		if (page.length === 0) {
			return NextResponse.json({ error: "Page not found" }, { status: 404 });
		}

		return NextResponse.json(page[0]);
	} catch (error) {
		console.error("Failed to fetch page:", error);
		return NextResponse.json(
			{ error: "Failed to fetch page" },
			{ status: 500 },
		);
	}
}

/**
 * PUT /api/pages/[id]
 * 페이지 수정
 */
export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const body = await request.json();
		const { name, slug, root, metadata } = body;

		const updatedPage = await db
			.update(pages)
			.set({
				name,
				slug,
				root,
				metadata,
				updatedAt: new Date(),
			})
			.where(eq(pages.id, id))
			.returning();

		if (updatedPage.length === 0) {
			return NextResponse.json({ error: "Page not found" }, { status: 404 });
		}

		return NextResponse.json(updatedPage[0]);
	} catch (error) {
		console.error("Failed to update page:", error);
		return NextResponse.json(
			{ error: "Failed to update page" },
			{ status: 500 },
		);
	}
}

/**
 * DELETE /api/pages/[id]
 * 페이지 삭제
 */
export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;

		const deletedPage = await db
			.delete(pages)
			.where(eq(pages.id, id))
			.returning();

		if (deletedPage.length === 0) {
			return NextResponse.json({ error: "Page not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Failed to delete page:", error);
		return NextResponse.json(
			{ error: "Failed to delete page" },
			{ status: 500 },
		);
	}
}