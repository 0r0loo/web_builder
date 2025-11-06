import type { StateCreator } from "zustand";
import type { EditorStore } from "@/types/editor";
import type { Project } from "@/lib/db/schema";
import * as projectsApi from "@/lib/api/projects";
import * as pagesApi from "@/lib/api/pages";
import { generateId } from "@/lib/utils/id";

/**
 * 프로젝트 관리 슬라이스 (DB 연동)
 */
export interface ProjectSlice {
	// 상태
	currentProject: (Project & { pages: any[] }) | null;
	isLoading: boolean;
	error: string | null;

	// 프로젝트 액션
	loadProject: (projectId: string) => Promise<void>;
	createProject: (name: string, description?: string) => Promise<void>;
	updateProject: (
		id: string,
		updates: Partial<{
			name: string;
			description: string;
			thumbnail: string;
			settings: any;
		}>,
	) => Promise<void>;
	deleteProject: (id: string) => Promise<void>;

	// 페이지 액션 (프로젝트 내)
	createPageInProject: (input: { name: string; slug?: string }) => Promise<void>;
	updatePageInProject: (
		pageId: string,
		updates: Partial<{ name: string; slug: string; root: any; metadata: any }>,
	) => Promise<void>;
	deletePageInProject: (pageId: string) => Promise<void>;
}

export const createProjectSlice: StateCreator<
	EditorStore,
	[],
	[],
	ProjectSlice
> = (set, get) => ({
	currentProject: null,
	isLoading: false,
	error: null,

	/**
	 * 프로젝트 로드 (페이지 포함)
	 */
	loadProject: async (projectId: string) => {
		set({ isLoading: true, error: null });
		try {
			const project = await projectsApi.getProject(projectId);

			// Zustand store에 페이지 데이터 동기화
			set({
				currentProject: project,
				pages: project.pages.map((page) => ({
					id: page.id,
					name: page.name,
					slug: page.slug,
					root: page.root,
					metadata: page.metadata || {
						title: page.name,
						description: "",
					},
					createdAt: new Date(page.createdAt).getTime(),
					updatedAt: new Date(page.updatedAt).getTime(),
				})),
				currentPageId: project.pages[0]?.id || null,
				isLoading: false,
			});
		} catch (error) {
			console.error("Failed to load project:", error);
			set({
				error: error instanceof Error ? error.message : "Failed to load project",
				isLoading: false,
			});
		}
	},

	/**
	 * 프로젝트 생성
	 */
	createProject: async (name: string, description?: string) => {
		set({ isLoading: true, error: null });
		try {
			const project = await projectsApi.createProject({ name, description });

			// 기본 홈 페이지 생성
			const homePage = await pagesApi.createPage(project.id, {
				name: "Home",
				slug: "/",
				root: {
					id: generateId(),
					type: "container",
					props: {},
					styles: {
						desktop: {
							minHeight: "100vh",
							display: "flex",
							flexDirection: "column",
						},
					},
					children: [],
				},
			});

			// 프로젝트 로드
			await get().loadProject(project.id);
		} catch (error) {
			console.error("Failed to create project:", error);
			set({
				error:
					error instanceof Error ? error.message : "Failed to create project",
				isLoading: false,
			});
		}
	},

	/**
	 * 프로젝트 수정
	 */
	updateProject: async (id, updates) => {
		set({ isLoading: true, error: null });
		try {
			const updated = await projectsApi.updateProject(id, updates);
			set((state) => ({
				currentProject: state.currentProject
					? { ...state.currentProject, ...updated }
					: null,
				isLoading: false,
			}));
		} catch (error) {
			console.error("Failed to update project:", error);
			set({
				error:
					error instanceof Error ? error.message : "Failed to update project",
				isLoading: false,
			});
		}
	},

	/**
	 * 프로젝트 삭제
	 */
	deleteProject: async (id) => {
		set({ isLoading: true, error: null });
		try {
			await projectsApi.deleteProject(id);
			set({ currentProject: null, pages: [], currentPageId: null });
		} catch (error) {
			console.error("Failed to delete project:", error);
			set({
				error:
					error instanceof Error ? error.message : "Failed to delete project",
				isLoading: false,
			});
		}
	},

	/**
	 * 프로젝트에 페이지 생성
	 */
	createPageInProject: async (input) => {
		const { currentProject } = get();
		if (!currentProject) {
			set({ error: "No project loaded" });
			return;
		}

		set({ isLoading: true, error: null });
		try {
			const newPage = await pagesApi.createPage(currentProject.id, {
				name: input.name,
				slug: input.slug || input.name.toLowerCase().replace(/\s+/g, "-"),
				root: {
					id: generateId(),
					type: "container",
					props: {},
					styles: {
						desktop: {
							minHeight: "100vh",
							display: "flex",
							flexDirection: "column",
						},
					},
					children: [],
				},
			});

			// 로컬 상태 업데이트
			set((state) => ({
				pages: [
					...state.pages,
					{
						id: newPage.id,
						name: newPage.name,
						slug: newPage.slug,
						root: newPage.root,
						metadata: newPage.metadata || {
							title: newPage.name,
							description: "",
						},
						createdAt: new Date(newPage.createdAt).getTime(),
						updatedAt: new Date(newPage.updatedAt).getTime(),
					},
				],
				currentPageId: newPage.id,
				isLoading: false,
			}));

			get().saveToHistory();
		} catch (error) {
			console.error("Failed to create page:", error);
			set({
				error: error instanceof Error ? error.message : "Failed to create page",
				isLoading: false,
			});
		}
	},

	/**
	 * 페이지 수정
	 */
	updatePageInProject: async (pageId, updates) => {
		set({ isLoading: true, error: null });
		try {
			const updated = await pagesApi.updatePage(pageId, updates);

			// 로컬 상태 업데이트
			set((state) => ({
				pages: state.pages.map((page) =>
					page.id === pageId
						? {
								...page,
								...updates,
								updatedAt: new Date(updated.updatedAt).getTime(),
							}
						: page,
				),
				isLoading: false,
			}));
		} catch (error) {
			console.error("Failed to update page:", error);
			set({
				error: error instanceof Error ? error.message : "Failed to update page",
				isLoading: false,
			});
		}
	},

	/**
	 * 페이지 삭제
	 */
	deletePageInProject: async (pageId) => {
		set({ isLoading: true, error: null });
		try {
			await pagesApi.deletePage(pageId);

			// 로컬 상태 업데이트
			set((state) => {
				const newPages = state.pages.filter((page) => page.id !== pageId);
				const newCurrentPageId =
					state.currentPageId === pageId
						? newPages[0]?.id || null
						: state.currentPageId;

				return {
					pages: newPages,
					currentPageId: newCurrentPageId,
					isLoading: false,
				};
			});
		} catch (error) {
			console.error("Failed to delete page:", error);
			set({
				error: error instanceof Error ? error.message : "Failed to delete page",
				isLoading: false,
			});
		}
	},
});