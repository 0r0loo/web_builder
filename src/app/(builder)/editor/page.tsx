"use client";

import { useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  closestCenter,
  type CollisionDetection,
} from "@dnd-kit/core";
import { useEditorStore } from "@/features/editor/store/editorStore";
import { EditorHeader } from "@/features/editor/components/EditorHeader";
import { ComponentLibrary } from "@/features/editor/components/ComponentLibrary";
import { LayersPanel } from "@/features/editor/components/LayersPanel";
import { Canvas } from "@/features/editor/components/Canvas";
import { PropertiesPanel } from "@/features/editor/components/PropertiesPanel";
import { DragPreview } from "@/features/editor/components/DragPreview";
import { useDragAndDrop } from "@/features/editor/hooks/useDragAndDrop";

/**
 * 웹 빌더 에디터 메인 페이지
 */
export default function EditorPage() {
  const createPage = useEditorStore((state) => state.createPage);
  const currentPageId = useEditorStore((state) => state.currentPageId);
  const showComponentLibrary = useEditorStore(
    (state) => state.showComponentLibrary,
  );
  const showPropertiesPanel = useEditorStore(
    (state) => state.showPropertiesPanel,
  );

  const addNode = useEditorStore((state) => state.addNode);
  const getCurrentPage = useEditorStore((state) => state.getCurrentPage);
  const selectedNodeId = useEditorStore((state) => state.selectedNodeId);
  const clearSelection = useEditorStore((state) => state.clearSelection);
  const deleteNode = useEditorStore((state) => state.deleteNode);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const canUndo = useEditorStore((state) => state.canUndo);
  const canRedo = useEditorStore((state) => state.canRedo);
  const saveToLocalStorage = useEditorStore(
    (state) => state.saveToLocalStorage,
  );
  const loadFromLocalStorage = useEditorStore(
    (state) => state.loadFromLocalStorage,
  );
  const pages = useEditorStore((state) => state.pages);

  // 드래그 앤 드롭 설정
  const {
    sensors,
    activeData,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  } = useDragAndDrop();

  // 초기 로드: LocalStorage에서 복원
  useEffect(() => {
    const loaded = loadFromLocalStorage();
    if (loaded) {
      console.log("프로젝트를 LocalStorage에서 불러왔습니다.");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 초기 페이지 생성 및 샘플 컴포넌트 추가
  useEffect(() => {
    if (!currentPageId) {
      createPage({ name: "홈페이지" });

      // 페이지 생성 후 샘플 컴포넌트 추가
      setTimeout(() => {
        const page = getCurrentPage();
        if (page && page.root.children?.length === 0) {
          // 샘플 Container 추가
          addNode(page.root.id, {
            id: "sample-container-1",
            type: "container",
            props: {},
            styles: {
              desktop: {
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                padding: "48px",
                backgroundColor: "#f9fafb",
                borderRadius: "12px",
              },
              tablet: {
                padding: "32px",
              },
              mobile: {
                padding: "24px",
                gap: "16px",
              },
            },
            children: [],
          });

          // Container 내부에 Text 추가
          addNode("sample-container-1", {
            id: "sample-text-1",
            type: "text",
            props: {
              content: "안녕하세요! 웹 빌더입니다 👋",
            },
            styles: {
              desktop: {
                fontSize: "32px",
                fontWeight: "700",
                color: "#111827",
                marginBottom: "8px",
              },
              tablet: {
                fontSize: "28px",
              },
              mobile: {
                fontSize: "24px",
              },
            },
          });

          // Container 내부에 또 다른 Text 추가
          addNode("sample-container-1", {
            id: "sample-text-2",
            type: "text",
            props: {
              content:
                "좌측 사이드바에서 컴포넌트를 드래그하여 페이지를 만들어보세요.",
            },
            styles: {
              desktop: {
                fontSize: "18px",
                color: "#6b7280",
                lineHeight: "1.6",
                marginBottom: "24px",
              },
              tablet: {
                fontSize: "16px",
              },
              mobile: {
                fontSize: "14px",
              },
            },
          });

          // Container 내부에 Button 추가
          addNode("sample-container-1", {
            id: "sample-button-1",
            type: "button",
            props: {
              text: "시작하기",
              variant: "primary",
            },
            styles: {
              desktop: {
                padding: "16px 32px",
                fontSize: "16px",
                fontWeight: "600",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                backgroundColor: "#3b82f6",
                color: "#ffffff",
                transition: "all 0.2s",
              },
              tablet: {
                padding: "14px 28px",
              },
              mobile: {
                padding: "12px 24px",
                fontSize: "14px",
              },
            },
          });
        }
      }, 100);
    }
  }, [currentPageId, createPage, addNode, getCurrentPage]);

  // 자동 저장: pages 변경 시 1초 후 저장 (debounce)
  useEffect(() => {
    // 초기 로드 직후에는 저장하지 않음
    if (pages.length === 0) return;

    const timer = setTimeout(() => {
      saveToLocalStorage();
      console.log("자동 저장됨");
    }, 1000);

    return () => clearTimeout(timer);
  }, [pages, saveToLocalStorage]);

  /**
   * 중첩 컨테이너를 위한 커스텀 충돌 감지 전략
   * 1. pointerWithin으로 포인터가 실제로 있는 모든 영역 찾기
   * 2. 중첩된 경우 가장 작은(가장 안쪽) 컨테이너 우선 선택
   * 3. 없으면 closestCenter 사용 (sortable 순서 변경)
   */
  const customCollisionDetection: CollisionDetection = (args) => {
    // 먼저 포인터가 실제로 위치한 모든 영역들을 찾음
    const pointerCollisions = pointerWithin(args);

    // 포인터가 droppable 영역 안에 있는 경우
    if (pointerCollisions.length > 0) {
      // 여러 개의 충돌이 있으면 (중첩 컨테이너), 면적이 가장 작은 것을 선택
      // 면적이 작다 = 가장 안쪽 컨테이너
      if (pointerCollisions.length > 1) {
        const sortedByArea = [...pointerCollisions].sort((a, b) => {
          const aRect = args.droppableRects.get(a.id);
          const bRect = args.droppableRects.get(b.id);

          if (!aRect || !bRect) return 0;

          const aArea = aRect.width * aRect.height;
          const bArea = bRect.width * bRect.height;

          return aArea - bArea; // 작은 면적 우선
        });

        return [sortedByArea[0]];
      }

      return pointerCollisions;
    }

    // 포인터가 어떤 영역에도 없으면 closestCenter 사용 (sortable 작동)
    return closestCenter(args);
  };

  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // input, textarea 등에서는 무시
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Ctrl/Cmd 키 확인 (Mac: metaKey, Windows/Linux: ctrlKey)
      const isMod = e.metaKey || e.ctrlKey;

      // ESC: 선택 해제
      if (e.key === "Escape") {
        if (selectedNodeId) {
          e.preventDefault();
          clearSelection();
        }
        return;
      }

      // Undo: Ctrl+Z 또는 Cmd+Z
      if (isMod && e.key === "z" && !e.shiftKey && canUndo) {
        e.preventDefault();
        undo();
        return;
      }

      // Redo: Ctrl+Shift+Z, Cmd+Shift+Z, 또는 Ctrl+Y
      if (
        ((isMod && e.key === "z" && e.shiftKey) ||
          (e.ctrlKey && e.key === "y")) &&
        canRedo
      ) {
        e.preventDefault();
        redo();
        return;
      }

      // Delete 또는 Backspace 키
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedNodeId) {
          e.preventDefault();
          deleteNode(selectedNodeId);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedNodeId,
    clearSelection,
    deleteNode,
    undo,
    redo,
    canUndo,
    canRedo,
  ]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
        {/* 헤더 */}
        <EditorHeader />

        {/* 메인 콘텐츠 */}
        <div className="flex flex-1 overflow-hidden">
          {/* 좌측 사이드바 - 컴포넌트 라이브러리 & 레이어 */}
          {showComponentLibrary && (
            <aside className="flex w-64 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex-1 overflow-hidden border-b border-zinc-200 dark:border-zinc-800">
                <ComponentLibrary />
              </div>
              <div className="flex-1 overflow-hidden">
                <LayersPanel />
              </div>
            </aside>
          )}

          {/* 중앙 캔버스 */}
          <main className="flex-1 overflow-auto">
            <Canvas />
          </main>

          {/* 우측 사이드바 - 속성 패널 */}
          {showPropertiesPanel && (
            <aside className="w-80 border-l border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <PropertiesPanel />
            </aside>
          )}
        </div>
      </div>

      {/* 드래그 오버레이 - 드래그 중인 항목의 프리뷰 */}
      <DragOverlay>
        {activeData?.type === "component-library" && (
          <DragPreview componentType={activeData.componentType} />
        )}
        {activeData?.type === "canvas-node" && (
          <div className="rounded-lg border-2 border-blue-500 bg-blue-50 p-4 shadow-lg dark:border-blue-400 dark:bg-blue-900">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              컴포넌트 이동 중...
            </p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
