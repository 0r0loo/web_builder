import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as pagesApi from "@/lib/api/pages";
import { generateId } from "@/lib/utils/id";

/**
 * Pages Query Hooks
 */

// 프로젝트의 모든 페이지 조회
export function useProjectPages(projectId: string | null) {
	return useQuery({
		queryKey: ["pages", projectId],
		queryFn: () => pagesApi.getProjectPages(projectId!),
		enabled: !!projectId,
	});
}

// 특정 페이지 조회
export function usePage(pageId: string | null) {
	return useQuery({
		queryKey: ["page", pageId],
		queryFn: () => pagesApi.getPage(pageId!),
		enabled: !!pageId,
	});
}

// 페이지 생성
export function useCreatePage() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			projectId,
			data,
		}: {
			projectId: string;
			data: { name: string; slug?: string };
		}) => {
			return pagesApi.createPage(projectId, {
				name: data.name,
				slug: data.slug || data.name.toLowerCase().replace(/\s+/g, "-"),
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
		},
		onSuccess: (data, variables) => {
			// 해당 프로젝트의 페이지 목록 갱신
			queryClient.invalidateQueries({
				queryKey: ["pages", variables.projectId],
			});
			queryClient.invalidateQueries({
				queryKey: ["project", variables.projectId],
			});
		},
	});
}

// 페이지 수정
export function useUpdatePage() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			updates,
		}: {
			id: string;
			updates: Partial<{
				name: string;
				slug: string;
				root: any;
				metadata: any;
			}>;
		}) => pagesApi.updatePage(id, updates),
		onSuccess: (data, variables) => {
			// 해당 페이지 캐시 갱신
			queryClient.invalidateQueries({ queryKey: ["page", variables.id] });
			// 프로젝트 캐시도 갱신 (페이지 목록 포함)
			queryClient.invalidateQueries({ queryKey: ["project"] });
		},
	});
}

// 페이지 삭제
export function useDeletePage() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: pagesApi.deletePage,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["pages"] });
			queryClient.invalidateQueries({ queryKey: ["project"] });
		},
	});
}