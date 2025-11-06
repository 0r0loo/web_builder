import type { Page, NewPage } from "@/lib/db/schema";

/**
 * Pages API Client
 */

// 프로젝트의 모든 페이지 조회
export async function getProjectPages(projectId: string): Promise<Page[]> {
	const res = await fetch(`/api/projects/${projectId}/pages`);
	if (!res.ok) throw new Error("Failed to fetch pages");
	return res.json();
}

// 특정 페이지 조회
export async function getPage(id: string): Promise<Page> {
	const res = await fetch(`/api/pages/${id}`);
	if (!res.ok) throw new Error("Failed to fetch page");
	return res.json();
}

// 페이지 생성
export async function createPage(
	projectId: string,
	data: Omit<NewPage, "id" | "projectId" | "createdAt" | "updatedAt">,
): Promise<Page> {
	const res = await fetch(`/api/projects/${projectId}/pages`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
	if (!res.ok) throw new Error("Failed to create page");
	return res.json();
}

// 페이지 수정
export async function updatePage(
	id: string,
	data: Partial<Omit<NewPage, "id" | "projectId" | "createdAt" | "updatedAt">>,
): Promise<Page> {
	const res = await fetch(`/api/pages/${id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
	if (!res.ok) throw new Error("Failed to update page");
	return res.json();
}

// 페이지 삭제
export async function deletePage(id: string): Promise<void> {
	const res = await fetch(`/api/pages/${id}`, {
		method: "DELETE",
	});
	if (!res.ok) throw new Error("Failed to delete page");
}