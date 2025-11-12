import type { StateCreator } from "zustand";
import type { EditorStore } from "@/types/editor";
import type { Page } from "@/types/page";

/**
 * Undo/Redo 히스토리 관리 슬라이스
 */
export interface HistorySlice {
  history: Page[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  saveToHistory: () => void;
  undo: () => void;
  redo: () => void;
}

export const createHistorySlice: StateCreator<
  EditorStore,
  [],
  [],
  HistorySlice
> = (set, _get) => ({
  history: [],
  historyIndex: -1,
  canUndo: false,
  canRedo: false,

  /**
   * 현재 상태를 히스토리에 저장
   */
  saveToHistory: () => {
    set((state) => {
      const currentPage = state.pages.find(
        (page) => page.id === state.currentPageId,
      );
      if (!currentPage) return state;

      // 현재 인덱스 이후의 히스토리 제거 (새 분기 생성)
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(currentPage);

      // 최대 50개 히스토리 유지
      const trimmedHistory =
        newHistory.length > 50 ? newHistory.slice(-50) : newHistory;

      return {
        history: trimmedHistory,
        historyIndex: trimmedHistory.length - 1,
        canUndo: trimmedHistory.length > 1,
        canRedo: false,
      };
    });
  },

  /**
   * Undo
   */
  undo: () => {
    set((state) => {
      if (!state.canUndo) return state;

      const newIndex = state.historyIndex - 1;
      const pageToRestore = state.history[newIndex];

      return {
        pages: state.pages.map((page) =>
          page.id === state.currentPageId ? pageToRestore : page,
        ),
        historyIndex: newIndex,
        canUndo: newIndex > 0,
        canRedo: true,
      };
    });
  },

  /**
   * Redo
   */
  redo: () => {
    set((state) => {
      if (!state.canRedo) return state;

      const newIndex = state.historyIndex + 1;
      const pageToRestore = state.history[newIndex];

      return {
        pages: state.pages.map((page) =>
          page.id === state.currentPageId ? pageToRestore : page,
        ),
        historyIndex: newIndex,
        canUndo: true,
        canRedo: newIndex < state.history.length - 1,
      };
    });
  },
});
