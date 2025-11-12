import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as projectsApi from "@/lib/api/projects";
import * as pagesApi from "@/lib/api/pages";
import { generateId } from "@/lib/utils/id";

/**
 * Projects Query Hooks
 */

// 모든 프로젝트 조회
export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: projectsApi.getAllProjects,
  });
}

// 특정 프로젝트 조회 (페이지 포함)
export function useProject(projectId: string | null) {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectsApi.getProject(projectId!),
    enabled: !!projectId, // projectId가 있을 때만 실행
  });
}

// 프로젝트 생성
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      // 1. 프로젝트 생성
      const project = await projectsApi.createProject(data);

      // 2. 기본 홈 페이지 생성
      await pagesApi.createPage(project.id, {
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

      return project;
    },
    onSuccess: () => {
      // 프로젝트 목록 갱신
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

// 프로젝트 수정
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<{
        name: string;
        description: string;
        thumbnail: string;
        settings: any;
      }>;
    }) => projectsApi.updateProject(id, updates),
    onSuccess: (data, variables) => {
      // 해당 프로젝트 캐시 갱신
      queryClient.invalidateQueries({ queryKey: ["project", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

// 프로젝트 삭제
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectsApi.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
