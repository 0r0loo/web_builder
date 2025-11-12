import type { StateCreator } from "zustand";
import type { EditorStore, EditorMode } from "@/types/editor";
import type { Breakpoint } from "@/types/component";

/**
 * 뷰포트 및 에디터 모드 관리 슬라이스
 */
export interface ViewportSlice {
  currentBreakpoint: Breakpoint;
  editorMode: EditorMode;
  setBreakpoint: (breakpoint: Breakpoint) => void;
  setEditorMode: (mode: EditorMode) => void;
}

export const createViewportSlice: StateCreator<
  EditorStore,
  [],
  [],
  ViewportSlice
> = (set) => ({
  currentBreakpoint: "desktop",
  editorMode: "edit",

  /**
   * 브레이크포인트 변경
   */
  setBreakpoint: (breakpoint) => {
    set({ currentBreakpoint: breakpoint });
  },

  /**
   * 에디터 모드 변경
   */
  setEditorMode: (mode) => {
    set({ editorMode: mode });
  },
});
