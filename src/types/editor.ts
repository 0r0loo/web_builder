import type { Breakpoint, ComponentNode } from "./component";
import type { Page } from "./page";

/**
 * Breakpoint and Page re-export
 */
export type { Breakpoint } from "./component";
export type { Page } from "./page";

/**
 * 에디터 모드
 */
export type EditorMode = "edit" | "preview";

/**
 * 에디터 상태 (UI 상태만, 서버 상태는 React Query)
 */
export interface EditorState {
  // 페이지 (로컬 상태)
  pages: Page[];
  currentPageId: string | null;

  // 선택
  selectedNodeId: string | null;
  hoveredNodeId: string | null;

  // 뷰포트
  currentBreakpoint: Breakpoint;
  editorMode: EditorMode;

  // 히스토리
  history: Page[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;

  // UI 상태
  showComponentLibrary: boolean;
  showLayersPanel: boolean;
  showPropertiesPanel: boolean;

  // 저장/불러오기
  lastSaved: number | null;
}

/**
 * 에디터 액션 (UI 액션만, 서버 액션은 React Query hooks 사용)
 */
export interface EditorActions {
  // 페이지 관리 (로컬 상태)
  createPage: (input: { name: string; slug?: string }) => void;
  deletePage: (pageId: string) => void;
  setCurrentPage: (pageId: string) => void;
  getCurrentPage: () => Page | null;

  // 노드 관리
  addNode: (parentId: string | null, node: ComponentNode) => void;
  updateNode: (
    nodeId: string,
    updates: Partial<Omit<ComponentNode, "id">>,
  ) => void;
  deleteNode: (nodeId: string) => void;
  moveNode: (nodeId: string, targetParentId: string, index?: number) => void;
  duplicateNode: (nodeId: string) => void;
  reorderChildren: (
    parentId: string,
    oldIndex: number,
    newIndex: number,
  ) => void;
  findNodeParent: (nodeId: string) => ComponentNode | null;

  // 선택
  selectNode: (nodeId: string | null) => void;
  clearSelection: () => void;
  hoverNode: (nodeId: string | null) => void;

  // 뷰포트
  setBreakpoint: (breakpoint: Breakpoint) => void;
  setEditorMode: (mode: EditorMode) => void;

  // 히스토리
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;

  // UI
  toggleComponentLibrary: () => void;
  toggleLayersPanel: () => void;
  togglePropertiesPanel: () => void;

  // 저장/불러오기
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => boolean;
  exportToJSON: () => string;
  importFromJSON: (json: string) => boolean;
  clearStorage: () => void;
}

/**
 * 완전한 에디터 스토어
 */
export type EditorStore = EditorState & EditorActions;
