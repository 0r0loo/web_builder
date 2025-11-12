"use client";

import { useEditorStore } from "../store/editorStore";
import {
  Monitor,
  Tablet,
  Smartphone,
  Undo2,
  Redo2,
  Download,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button, IconButton } from "@/components/ui/buttons";

/**
 * 에디터 상단 헤더
 * - 페이지 이름
 * - 반응형 브레이크포인트 전환
 * - Undo/Redo
 * - 저장/발행 버튼
 */
export function EditorHeader() {
  const currentPage = useEditorStore((state) => state.getCurrentPage());
  const currentBreakpoint = useEditorStore((state) => state.currentBreakpoint);
  const setBreakpoint = useEditorStore((state) => state.setBreakpoint);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const canUndo = useEditorStore((state) => state.canUndo);
  const canRedo = useEditorStore((state) => state.canRedo);
  const exportToJSON = useEditorStore((state) => state.exportToJSON);
  const importFromJSON = useEditorStore((state) => state.importFromJSON);

  // JSON 내보내기
  const handleExport = () => {
    const json = exportToJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `web-builder-project-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // JSON 가져오기
  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const json = event.target?.result as string;
        const success = importFromJSON(json);
        if (success) {
          alert("프로젝트를 성공적으로 불러왔습니다!");
        } else {
          alert("프로젝트 파일을 불러오는데 실패했습니다.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // 프리뷰 열기
  const handlePreview = () => {
    if (!currentPage) return;
    window.open(`/preview/${currentPage.id}`, "_blank");
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-900">
      {/* 좌측: 페이지 이름 */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {currentPage?.name || "Web Builder"}
        </h1>
      </div>

      {/* 중앙: 브레이크포인트 전환 */}
      <div className="flex items-center gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
        <IconButton
          icon={<Smartphone className="h-4 w-4" />}
          onClick={() => setBreakpoint("mobile")}
          active={currentBreakpoint === "mobile"}
          title="모바일 (< 768px)"
          className={cn(
            currentBreakpoint === "mobile" &&
              "bg-white shadow-sm dark:bg-zinc-700",
          )}
        />
        <IconButton
          icon={<Tablet className="h-4 w-4" />}
          onClick={() => setBreakpoint("tablet")}
          active={currentBreakpoint === "tablet"}
          title="태블릿 (768px - 1023px)"
          className={cn(
            currentBreakpoint === "tablet" &&
              "bg-white shadow-sm dark:bg-zinc-700",
          )}
        />
        <IconButton
          icon={<Monitor className="h-4 w-4" />}
          onClick={() => setBreakpoint("desktop")}
          active={currentBreakpoint === "desktop"}
          title="데스크톱 (>= 1024px)"
          className={cn(
            currentBreakpoint === "desktop" &&
              "bg-white shadow-sm dark:bg-zinc-700",
          )}
        />
      </div>

      {/* 우측: Undo/Redo 및 액션 버튼 */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <IconButton
            icon={<Undo2 className="h-4 w-4" />}
            onClick={undo}
            disabled={!canUndo}
            title="실행 취소 (Ctrl+Z)"
          />
          <IconButton
            icon={<Redo2 className="h-4 w-4" />}
            onClick={redo}
            disabled={!canRedo}
            title="다시 실행 (Ctrl+Shift+Z)"
          />
        </div>

        <div className="ml-2 h-6 w-px bg-zinc-200 dark:bg-zinc-700" />

        <div className="flex items-center gap-1">
          <IconButton
            icon={<Download className="h-4 w-4" />}
            onClick={handleExport}
            title="프로젝트 내보내기 (JSON)"
          />
          <IconButton
            icon={<Upload className="h-4 w-4" />}
            onClick={handleImport}
            title="프로젝트 가져오기 (JSON)"
          />
        </div>

        <div className="ml-2 h-6 w-px bg-zinc-200 dark:bg-zinc-700" />

        <Button variant="secondary" size="md" onClick={handlePreview}>
          미리보기
        </Button>
        <Button variant="primary" size="md">
          발행
        </Button>
      </div>
    </header>
  );
}
