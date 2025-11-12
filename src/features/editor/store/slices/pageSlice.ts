import type { StateCreator } from "zustand";
import { generateId } from "@/lib/utils/id";
import type { EditorStore } from "@/types/editor";
import type { Page } from "@/types/page";

/**
 * 페이지 관리 슬라이스
 */
export interface PageSlice {
  pages: Page[];
  currentPageId: string | null;
  createPage: (input: { name: string; slug?: string }) => void;
  deletePage: (pageId: string) => void;
  updatePageName: (pageId: string, name: string) => void;
  setCurrentPage: (pageId: string) => void;
  getCurrentPage: () => Page | null;
}

export const createPageSlice: StateCreator<EditorStore, [], [], PageSlice> = (
  set,
  get,
) => ({
  pages: [],
  currentPageId: null,

  /**
   * 새 페이지 생성
   */
  createPage: (input) => {
    const newPage: Page = {
      id: generateId(),
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
            padding: "0",
            backgroundColor: "transparent",
            border: "none",
            borderRadius: "0",
          },
          tablet: {},
          mobile: {},
        },
        children: [],
      },
      metadata: {
        title: input.name,
        description: "",
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    set((state) => ({
      pages: [...state.pages, newPage],
      currentPageId: newPage.id,
    }));

    get().saveToHistory();
  },

  /**
   * 페이지 삭제
   */
  deletePage: (pageId) => {
    set((state) => {
      const newPages = state.pages.filter((page) => page.id !== pageId);
      const newCurrentPageId =
        state.currentPageId === pageId
          ? newPages[0]?.id || null
          : state.currentPageId;

      return {
        pages: newPages,
        currentPageId: newCurrentPageId,
      };
    });
  },

  /**
   * 페이지 이름 변경
   */
  updatePageName: (pageId, name) => {
    set((state) => ({
      pages: state.pages.map((page) =>
        page.id === pageId
          ? {
              ...page,
              name,
              slug: name.toLowerCase().replace(/\s+/g, "-"),
              metadata: {
                ...page.metadata,
                title: name,
              },
              updatedAt: Date.now(),
            }
          : page,
      ),
    }));

    get().saveToHistory();
  },

  /**
   * 현재 페이지 설정
   */
  setCurrentPage: (pageId) => {
    set({ currentPageId: pageId, selectedNodeId: null });
  },

  /**
   * 현재 페이지 가져오기
   */
  getCurrentPage: () => {
    const { pages, currentPageId } = get();
    return pages.find((page) => page.id === currentPageId) || null;
  },
});
