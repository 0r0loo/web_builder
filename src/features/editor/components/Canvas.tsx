"use client";

import { useDroppable } from "@dnd-kit/core";
import { useEditorStore } from "../store/editorStore";
import { cn } from "@/lib/utils/cn";
import { PageRenderer } from "@/features/renderer/PageRenderer";

/**
 * 에디터 캔버스
 * 페이지를 렌더링하고 드래그 앤 드롭으로 편집
 */
export function Canvas() {
  const currentPage = useEditorStore((state) => state.getCurrentPage());
  const currentBreakpoint = useEditorStore((state) => state.currentBreakpoint);

  // 루트 droppable 영역 설정
  const { setNodeRef, isOver } = useDroppable({
    id: currentPage?.root.id || "root",
    data: {
      type: "canvas-root",
      accepts: ["component-library", "canvas-node"],
    },
  });

  if (!currentPage) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
            페이지를 불러오는 중...
          </p>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            잠시만 기다려주세요
          </p>
        </div>
      </div>
    );
  }

  // 브레이크포인트별 캔버스 너비
  const canvasWidth = {
    mobile: "375px",
    tablet: "768px",
    desktop: "100%",
  }[currentBreakpoint];

  // 페이지에 자식 컴포넌트가 있는지 확인
  const hasChildren =
    currentPage.root.children && currentPage.root.children.length > 0;

  return (
    <div className="flex h-full items-start justify-center overflow-auto bg-zinc-50 p-8 dark:bg-zinc-900">
      <div
        className={cn(
          "relative min-h-[600px] bg-white shadow-lg transition-all duration-300 dark:bg-zinc-800",
          currentBreakpoint === "desktop" ? "w-full" : "mx-auto",
        )}
        style={{
          width: canvasWidth,
          maxWidth: "100%",
        }}
      >
        {/* 항상 PageRenderer를 렌더하여 root가 droppable이 되도록 함 */}
        <PageRenderer page={currentPage} breakpoint={currentBreakpoint} />

        {/* 빈 캔버스 상태 메시지 (overlay) */}
        {!hasChildren && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-700">
            <div className="text-center">
              <p className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                여기에 컴포넌트를 드래그하세요
              </p>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                좌측 사이드바에서 컴포넌트를 선택하여 시작하세요
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
