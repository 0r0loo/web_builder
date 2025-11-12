import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { EditorStore } from "@/types/editor";
import { createHistorySlice, type HistorySlice } from "./slices/historySlice";
import { createNodeSlice, type NodeSlice } from "./slices/nodeSlice";
import { createPageSlice, type PageSlice } from "./slices/pageSlice";
import {
  createPersistenceSlice,
  type PersistenceSlice,
} from "./slices/persistenceSlice";
import {
  createSelectionSlice,
  type SelectionSlice,
} from "./slices/selectionSlice";
import { createUISlice, type UISlice } from "./slices/uiSlice";
import {
  createViewportSlice,
  type ViewportSlice,
} from "./slices/viewportSlice";

/**
 * 웹 빌더 에디터의 전역 상태 관리 스토어 (UI 상태만)
 *
 * Zustand Slices 패턴으로 구성:
 * - pageSlice: 페이지 관리 (로컬 상태)
 * - nodeSlice: 노드 관리 (추가, 업데이트, 삭제, 이동, 복제)
 * - selectionSlice: 선택 및 호버 상태
 * - viewportSlice: 브레이크포인트 및 에디터 모드
 * - historySlice: Undo/Redo 히스토리
 * - uiSlice: UI 패널 토글
 * - persistenceSlice: 저장/불러오기
 *
 * 서버 상태는 React Query로 관리합니다.
 * Immer 미들웨어를 사용하여 불변성을 자동으로 처리합니다.
 */
export const useEditorStore = create<EditorStore>()(
  immer((...a) => ({
    ...createPageSlice(...a),
    ...createNodeSlice(...a),
    ...createSelectionSlice(...a),
    ...createViewportSlice(...a),
    ...createHistorySlice(...a),
    ...createUISlice(...a),
    ...createPersistenceSlice(...a),
  })),
);

/**
 * 타입 export (다른 파일에서 import 용)
 */
export type {
  PageSlice,
  NodeSlice,
  SelectionSlice,
  ViewportSlice,
  HistorySlice,
  UISlice,
  PersistenceSlice,
};

/**
 * 자동 저장 설정
 * 상태 변경 시 debounce된 자동 저장 실행
 */
let saveTimeout: NodeJS.Timeout | null = null;

useEditorStore.subscribe((state) => {
  // UI 상태 변경은 저장하지 않음
  if (saveTimeout) clearTimeout(saveTimeout);

  saveTimeout = setTimeout(() => {
    state.saveToLocalStorage();
  }, 500); // 500ms debounce
});
