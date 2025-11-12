"use client";

import {
  type CollisionDetection,
  closestCenter,
  DndContext,
  DragOverlay,
  pointerWithin,
} from "@dnd-kit/core";
import { useEffect } from "react";
import { Canvas } from "@/features/editor/components/Canvas";
import { ComponentLibrary } from "@/features/editor/components/ComponentLibrary";
import { DragPreview } from "@/features/editor/components/DragPreview";
import { EditorHeader } from "@/features/editor/components/EditorHeader";
import { LayersPanel } from "@/features/editor/components/LayersPanel";
import { PropertiesPanel } from "@/features/editor/components/PropertiesPanel";
import { useDragAndDrop } from "@/features/editor/hooks/useDragAndDrop";
import { useEditorStore } from "@/features/editor/store/editorStore";

/**
 * 웹 빌더 에디터 메인 페이지
 */
export default function EditorPage() {
  const createPage = useEditorStore((state) => state.createPage);
  const _currentPageId = useEditorStore((state) => state.currentPageId);
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

  // 초기 로드 및 샘플 페이지 생성 (마운트 시 한 번만 실행)
  useEffect(() => {
    // 1. LocalStorage에서 복원 시도
    const loaded = loadFromLocalStorage();
    if (loaded) {
      console.log("✅ 프로젝트를 LocalStorage에서 불러왔습니다.");
      return; // 복원 성공하면 새 페이지 생성 안 함
    }

    // 2. 복원 실패 시, 이미 페이지가 있는지 확인
    if (pages.length > 0) {
      console.log("✅ 이미 페이지가 존재합니다.");
      return;
    }

    // 3. 완전히 비어있을 때만 샘플 페이지 생성
    console.log("🎨 새 프로젝트 생성 중...");
    createPage({ name: "홈페이지" });

    // 페이지 생성 후 샘플 랜딩 페이지 추가
    setTimeout(() => {
      const page = getCurrentPage();
      if (page && page.root.children?.length === 0) {
        // Hero 섹션
        addNode(page.root.id, {
          id: "hero-section",
          type: "container",
          props: {},
          styles: {
            desktop: {
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "32px",
              padding: "80px 48px",
              backgroundColor: "#f9fafb",
            },
            tablet: {
              padding: "64px 32px",
              gap: "24px",
            },
            mobile: {
              padding: "48px 24px",
              gap: "20px",
            },
          },
          children: [],
        });

        addNode("hero-section", {
          id: "hero-title",
          type: "text",
          props: {
            content: "아름다운 웹사이트를 만드는 가장 쉬운 방법",
          },
          styles: {
            desktop: {
              fontSize: "56px",
              fontWeight: "800",
              color: "#111827",
              textAlign: "center",
              lineHeight: "1.1",
              maxWidth: "800px",
            },
            tablet: {
              fontSize: "42px",
            },
            mobile: {
              fontSize: "32px",
            },
          },
        });

        addNode("hero-section", {
          id: "hero-description",
          type: "text",
          props: {
            content:
              "코딩 없이 드래그 앤 드롭만으로 전문가 수준의 웹사이트를 만들어보세요. 디자인부터 배포까지, 모든 것이 한 곳에서.",
          },
          styles: {
            desktop: {
              fontSize: "20px",
              color: "#6b7280",
              textAlign: "center",
              lineHeight: "1.6",
              maxWidth: "600px",
            },
            tablet: {
              fontSize: "18px",
            },
            mobile: {
              fontSize: "16px",
            },
          },
        });

        // Hero 버튼 컨테이너
        addNode("hero-section", {
          id: "hero-buttons",
          type: "container",
          props: {},
          styles: {
            desktop: {
              display: "flex",
              flexDirection: "row",
              gap: "16px",
              alignItems: "center",
            },
            mobile: {
              flexDirection: "column",
              width: "100%",
            },
          },
          children: [],
        });

        addNode("hero-buttons", {
          id: "hero-cta-primary",
          type: "button",
          props: {
            text: "무료로 시작하기",
            variant: "primary",
          },
          styles: {
            desktop: {
              padding: "16px 32px",
              fontSize: "16px",
              fontWeight: "600",
              borderRadius: "8px",
              backgroundColor: "#3b82f6",
              color: "#ffffff",
              border: "none",
              cursor: "pointer",
            },
            mobile: {
              width: "100%",
            },
          },
        });

        addNode("hero-buttons", {
          id: "hero-cta-secondary",
          type: "button",
          props: {
            text: "데모 보기",
            variant: "outline",
          },
          styles: {
            desktop: {
              padding: "16px 32px",
              fontSize: "16px",
              fontWeight: "600",
              borderRadius: "8px",
              backgroundColor: "transparent",
              color: "#3b82f6",
              border: "2px solid #3b82f6",
              cursor: "pointer",
            },
            mobile: {
              width: "100%",
            },
          },
        });

        // Features 섹션
        addNode(page.root.id, {
          id: "features-section",
          type: "container",
          props: {},
          styles: {
            desktop: {
              display: "flex",
              flexDirection: "column",
              gap: "48px",
              padding: "80px 48px",
              backgroundColor: "#ffffff",
            },
            tablet: {
              padding: "64px 32px",
            },
            mobile: {
              padding: "48px 24px",
              gap: "32px",
            },
          },
          children: [],
        });

        addNode("features-section", {
          id: "features-title",
          type: "text",
          props: {
            content: "강력한 기능들",
          },
          styles: {
            desktop: {
              fontSize: "42px",
              fontWeight: "700",
              color: "#111827",
              textAlign: "center",
            },
            tablet: {
              fontSize: "36px",
            },
            mobile: {
              fontSize: "28px",
            },
          },
        });

        // Features 그리드
        addNode("features-section", {
          id: "features-grid",
          type: "container",
          props: {},
          styles: {
            desktop: {
              display: "flex",
              flexDirection: "row",
              gap: "24px",
              justifyContent: "center",
            },
            tablet: {
              flexDirection: "column",
            },
            mobile: {
              flexDirection: "column",
            },
          },
          children: [],
        });

        // Feature 1
        addNode("features-grid", {
          id: "feature-1",
          type: "container",
          props: {},
          styles: {
            desktop: {
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              padding: "32px",
              backgroundColor: "#f9fafb",
              borderRadius: "12px",
              width: "300px",
            },
            tablet: {
              width: "100%",
            },
            mobile: {
              width: "100%",
              padding: "24px",
            },
          },
          children: [],
        });

        addNode("feature-1", {
          id: "feature-1-title",
          type: "text",
          props: {
            content: "🎨 직관적인 디자인",
          },
          styles: {
            desktop: {
              fontSize: "24px",
              fontWeight: "700",
              color: "#111827",
            },
          },
        });

        addNode("feature-1", {
          id: "feature-1-desc",
          type: "text",
          props: {
            content:
              "드래그 앤 드롭으로 누구나 쉽게 아름다운 웹사이트를 만들 수 있습니다.",
          },
          styles: {
            desktop: {
              fontSize: "16px",
              color: "#6b7280",
              lineHeight: "1.6",
            },
          },
        });

        // Feature 2
        addNode("features-grid", {
          id: "feature-2",
          type: "container",
          props: {},
          styles: {
            desktop: {
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              padding: "32px",
              backgroundColor: "#f9fafb",
              borderRadius: "12px",
              width: "300px",
            },
            tablet: {
              width: "100%",
            },
            mobile: {
              width: "100%",
              padding: "24px",
            },
          },
          children: [],
        });

        addNode("feature-2", {
          id: "feature-2-title",
          type: "text",
          props: {
            content: "⚡ 빠른 속도",
          },
          styles: {
            desktop: {
              fontSize: "24px",
              fontWeight: "700",
              color: "#111827",
            },
          },
        });

        addNode("feature-2", {
          id: "feature-2-desc",
          type: "text",
          props: {
            content:
              "최적화된 코드로 빠른 로딩 속도와 뛰어난 성능을 제공합니다.",
          },
          styles: {
            desktop: {
              fontSize: "16px",
              color: "#6b7280",
              lineHeight: "1.6",
            },
          },
        });

        // Feature 3
        addNode("features-grid", {
          id: "feature-3",
          type: "container",
          props: {},
          styles: {
            desktop: {
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              padding: "32px",
              backgroundColor: "#f9fafb",
              borderRadius: "12px",
              width: "300px",
            },
            tablet: {
              width: "100%",
            },
            mobile: {
              width: "100%",
              padding: "24px",
            },
          },
          children: [],
        });

        addNode("feature-3", {
          id: "feature-3-title",
          type: "text",
          props: {
            content: "📱 반응형 디자인",
          },
          styles: {
            desktop: {
              fontSize: "24px",
              fontWeight: "700",
              color: "#111827",
            },
          },
        });

        addNode("feature-3", {
          id: "feature-3-desc",
          type: "text",
          props: {
            content:
              "모든 기기에서 완벽하게 보이는 반응형 웹사이트를 자동으로 생성합니다.",
          },
          styles: {
            desktop: {
              fontSize: "16px",
              color: "#6b7280",
              lineHeight: "1.6",
            },
          },
        });

        // CTA 섹션
        addNode(page.root.id, {
          id: "cta-section",
          type: "container",
          props: {},
          styles: {
            desktop: {
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "24px",
              padding: "80px 48px",
              backgroundColor: "#3b82f6",
            },
            tablet: {
              padding: "64px 32px",
            },
            mobile: {
              padding: "48px 24px",
            },
          },
          children: [],
        });

        addNode("cta-section", {
          id: "cta-title",
          type: "text",
          props: {
            content: "지금 바로 시작해보세요",
          },
          styles: {
            desktop: {
              fontSize: "42px",
              fontWeight: "700",
              color: "#ffffff",
              textAlign: "center",
            },
            tablet: {
              fontSize: "36px",
            },
            mobile: {
              fontSize: "28px",
            },
          },
        });

        addNode("cta-section", {
          id: "cta-description",
          type: "text",
          props: {
            content: "신용카드 없이 무료로 시작할 수 있습니다",
          },
          styles: {
            desktop: {
              fontSize: "18px",
              color: "#e0e7ff",
              textAlign: "center",
            },
          },
        });

        addNode("cta-section", {
          id: "cta-button",
          type: "button",
          props: {
            text: "무료로 시작하기 →",
            variant: "primary",
          },
          styles: {
            desktop: {
              padding: "16px 32px",
              fontSize: "16px",
              fontWeight: "600",
              borderRadius: "8px",
              backgroundColor: "#ffffff",
              color: "#3b82f6",
              border: "none",
              cursor: "pointer",
            },
          },
        });
      }
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addNode, createPage, getCurrentPage, loadFromLocalStorage, pages.length]); // 마운트 시 한 번만 실행

  // 자동 저장: pages 변경 시 3초 후 저장 (debounce)
  useEffect(() => {
    // 초기 로드 직후에는 저장하지 않음
    if (pages.length === 0) return;

    const timer = setTimeout(() => {
      saveToLocalStorage();
      console.log("💾 자동 저장됨");
    }, 3000); // 1초 → 3초로 증가

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
