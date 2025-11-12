import type { StateCreator } from "zustand";
import type { EditorStore } from "@/types/editor";

const STORAGE_KEY = "web-builder-project";

/**
 * 프로젝트 저장/불러오기 슬라이스
 */
export interface PersistenceSlice {
  lastSaved: number | null;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => boolean;
  exportToJSON: () => string;
  importFromJSON: (json: string) => boolean;
  clearStorage: () => void;
}

export const createPersistenceSlice: StateCreator<
  EditorStore,
  [["zustand/immer", never]],
  [],
  PersistenceSlice
> = (set, get) => ({
  lastSaved: null,

  /**
   * LocalStorage에 프로젝트 저장
   */
  saveToLocalStorage: () => {
    try {
      const state = get();
      const dataToSave = {
        pages: state.pages,
        currentPageId: state.currentPageId,
        currentBreakpoint: state.currentBreakpoint,
        version: "1.0.0",
        savedAt: Date.now(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));

      set((draft) => {
        draft.lastSaved = Date.now();
      });

      return true;
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
      return false;
    }
  },

  /**
   * LocalStorage에서 프로젝트 불러오기
   */
  loadFromLocalStorage: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return false;

      const data = JSON.parse(stored);

      set((draft) => {
        draft.pages = data.pages;
        draft.currentPageId = data.currentPageId;
        draft.currentBreakpoint = data.currentBreakpoint || "desktop";
        draft.lastSaved = data.savedAt || null;
      });

      return true;
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
      return false;
    }
  },

  /**
   * JSON으로 내보내기
   */
  exportToJSON: () => {
    const state = get();
    const dataToExport = {
      pages: state.pages,
      currentPageId: state.currentPageId,
      currentBreakpoint: state.currentBreakpoint,
      version: "1.0.0",
      exportedAt: Date.now(),
    };

    return JSON.stringify(dataToExport, null, 2);
  },

  /**
   * JSON에서 가져오기
   */
  importFromJSON: (json: string) => {
    try {
      const data = JSON.parse(json);

      // 기본적인 유효성 검사
      if (!data.pages || !Array.isArray(data.pages)) {
        throw new Error("Invalid project data: missing pages array");
      }

      set((draft) => {
        draft.pages = data.pages;
        draft.currentPageId = data.currentPageId || data.pages[0]?.id || null;
        draft.currentBreakpoint = data.currentBreakpoint || "desktop";
        draft.lastSaved = null; // 가져온 직후는 저장되지 않은 상태
      });

      return true;
    } catch (error) {
      console.error("Failed to import from JSON:", error);
      return false;
    }
  },

  /**
   * LocalStorage 초기화
   */
  clearStorage: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      set((draft) => {
        draft.lastSaved = null;
      });
    } catch (error) {
      console.error("Failed to clear localStorage:", error);
    }
  },
});
