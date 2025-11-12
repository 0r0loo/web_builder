import type { StateCreator } from "zustand";
import type { EditorStore } from "@/types/editor";

/**
 * UI 패널 토글 관리 슬라이스
 */
export interface UISlice {
  showComponentLibrary: boolean;
  showLayersPanel: boolean;
  showPropertiesPanel: boolean;
  toggleComponentLibrary: () => void;
  toggleLayersPanel: () => void;
  togglePropertiesPanel: () => void;
}

export const createUISlice: StateCreator<EditorStore, [], [], UISlice> = (
  set,
) => ({
  showComponentLibrary: true,
  showLayersPanel: true,
  showPropertiesPanel: true,

  /**
   * 컴포넌트 라이브러리 토글
   */
  toggleComponentLibrary: () => {
    set((state) => ({ showComponentLibrary: !state.showComponentLibrary }));
  },

  /**
   * 레이어 패널 토글
   */
  toggleLayersPanel: () => {
    set((state) => ({ showLayersPanel: !state.showLayersPanel }));
  },

  /**
   * 속성 패널 토글
   */
  togglePropertiesPanel: () => {
    set((state) => ({ showPropertiesPanel: !state.showPropertiesPanel }));
  },
});
