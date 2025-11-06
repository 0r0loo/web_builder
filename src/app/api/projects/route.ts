import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 * GET /api/projects
 * 모든 프로젝트 조회
 */
export async function GET() {
	try {
		const allProjects = await db.select().from(projects);
		return NextResponse.json(allProjects);
	} catch (error) {
		console.error("Failed to fetch projects:", error);
		return NextResponse.json(
			{ error: "Failed to fetch projects" },
			{ status: 500 },
		);
	}
}

/**
 * POST /api/projects
 * 새 프로젝트 생성
 */
export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { name, description, thumbnail, settings } = body;

		if (!name) {
			return NextResponse.json(
				{ error: "Project name is required" },
				{ status: 400 },
			);
		}

		const newProject = await db
			.insert(projects)
			.values({
				id: nanoid(),
				name,
				description: description || null,
				thumbnail: thumbnail || null,
				settings: settings || null,
			})
			.returning();

		return NextResponse.json(newProject[0], { status: 201 });
	} catch (error) {
		console.error("Failed to create project:", error);
		return NextResponse.json(
			{ error: "Failed to create project" },
			{ status: 500 },
		);
	}
}