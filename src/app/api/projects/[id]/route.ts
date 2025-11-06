import { db } from "@/lib/db";
import { projects, pages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 * GET /api/projects/[id]
 * 특정 프로젝트 조회 (페이지 포함)
 */
export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;

		const project = await db.select().from(projects).where(eq(projects.id, id));

		if (project.length === 0) {
			return NextResponse.json({ error: "Project not found" }, { status: 404 });
		}

		// 프로젝트의 모든 페이지 조회
		const projectPages = await db
			.select()
			.from(pages)
			.where(eq(pages.projectId, id));

		return NextResponse.json({
			...project[0],
			pages: projectPages,
		});
	} catch (error) {
		console.error("Failed to fetch project:", error);
		return NextResponse.json(
			{ error: "Failed to fetch project" },
			{ status: 500 },
		);
	}
}

/**
 * PUT /api/projects/[id]
 * 프로젝트 수정
 */
export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const body = await request.json();
		const { name, description, thumbnail, settings } = body;

		const updatedProject = await db
			.update(projects)
			.set({
				name,
				description,
				thumbnail,
				settings,
				updatedAt: new Date(),
			})
			.where(eq(projects.id, id))
			.returning();

		if (updatedProject.length === 0) {
			return NextResponse.json({ error: "Project not found" }, { status: 404 });
		}

		return NextResponse.json(updatedProject[0]);
	} catch (error) {
		console.error("Failed to update project:", error);
		return NextResponse.json(
			{ error: "Failed to update project" },
			{ status: 500 },
		);
	}
}

/**
 * DELETE /api/projects/[id]
 * 프로젝트 삭제 (cascade로 페이지도 자동 삭제)
 */
export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;

		const deletedProject = await db
			.delete(projects)
			.where(eq(projects.id, id))
			.returning();

		if (deletedProject.length === 0) {
			return NextResponse.json({ error: "Project not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Failed to delete project:", error);
		return NextResponse.json(
			{ error: "Failed to delete project" },
			{ status: 500 },
		);
	}
}
