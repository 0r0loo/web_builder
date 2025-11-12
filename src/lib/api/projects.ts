import type { Project, NewProject, Page, NewPage } from "@/lib/db/schema";

/**
 * Projects API Client
 */

// 모든 프로젝트 조회
export async function getAllProjects(): Promise<Project[]> {
  const res = await fetch("/api/projects");
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

// 특정 프로젝트 조회 (페이지 포함)
export async function getProject(
  id: string,
): Promise<Project & { pages: Page[] }> {
  const res = await fetch(`/api/projects/${id}`);
  if (!res.ok) throw new Error("Failed to fetch project");
  return res.json();
}

// 프로젝트 생성
export async function createProject(
  data: Omit<NewProject, "id" | "createdAt" | "updatedAt">,
): Promise<Project> {
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create project");
  return res.json();
}

// 프로젝트 수정
export async function updateProject(
  id: string,
  data: Partial<Omit<NewProject, "id" | "createdAt" | "updatedAt">>,
): Promise<Project> {
  const res = await fetch(`/api/projects/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update project");
  return res.json();
}

// 프로젝트 삭제
export async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`/api/projects/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete project");
}
