"use client";

import { Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { Page } from "@/types/editor";

interface PageTabsProps {
  pages: Page[];
  currentPageId: string;
  onPageClick: (pageId: string) => void;
  onAddPage: () => void;
  onDeletePage: (pageId: string) => void;
  onUpdatePageName: (pageId: string, name: string) => void;
}

/**
 * 페이지 탭 컴포넌트
 * 브라우저 탭 스타일의 페이지 네비게이션
 */
export function PageTabs({
  pages,
  currentPageId,
  onPageClick,
  onAddPage,
  onDeletePage,
  onUpdatePageName,
}: PageTabsProps) {
  const [hoveredPageId, setHoveredPageId] = useState<string | null>(null);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDeleteClick = (e: React.MouseEvent, pageId: string) => {
    e.stopPropagation();

    // 마지막 페이지는 삭제 불가
    if (pages.length === 1) {
      alert("마지막 페이지는 삭제할 수 없습니다.");
      return;
    }

    // 현재 페이지 삭제 시 다른 페이지로 전환
    if (pageId === currentPageId) {
      const currentIndex = pages.findIndex((p) => p.id === pageId);
      const nextPage = pages[currentIndex + 1] || pages[currentIndex - 1];
      if (nextPage) {
        onPageClick(nextPage.id);
      }
    }

    onDeletePage(pageId);
  };

  // 더블클릭으로 편집 모드 진입
  const handleDoubleClick = (e: React.MouseEvent, page: Page) => {
    e.stopPropagation();
    setEditingPageId(page.id);
    setEditingName(page.name);
    // input에 자동 포커스를 위해 다음 프레임에서 실행
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  };

  // 이름 변경 저장
  const handleSaveName = () => {
    if (editingPageId && editingName.trim()) {
      onUpdatePageName(editingPageId, editingName.trim());
    }
    setEditingPageId(null);
    setEditingName("");
  };

  // 편집 취소
  const handleCancelEdit = () => {
    setEditingPageId(null);
    setEditingName("");
  };

  // 키보드 이벤트 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveName();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  return (
    <div className="flex items-center gap-1 border-b border-zinc-200 bg-zinc-50 px-2 dark:border-zinc-700 dark:bg-zinc-800">
      {/* 페이지 탭들 */}
      <div className="flex items-center gap-0.5 overflow-x-auto py-1">
        {pages.map((page) => {
          const isActive = page.id === currentPageId;
          const isHovered = hoveredPageId === page.id;
          const isEditing = editingPageId === page.id;

          return (
            <div
              key={page.id}
              onClick={() => !isEditing && onPageClick(page.id)}
              onDoubleClick={(e) => handleDoubleClick(e, page)}
              onMouseEnter={() => setHoveredPageId(page.id)}
              onMouseLeave={() => setHoveredPageId(null)}
              className={cn(
                "group relative flex min-w-[120px] max-w-[200px] cursor-pointer items-center gap-2 rounded-t-lg border-b-2 px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-blue-500 bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100"
                  : "border-transparent bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100",
              )}
            >
              {/* 페이지 아이콘 */}
              <span className="text-base">📄</span>

              {/* 페이지 이름 또는 편집 input */}
              {isEditing ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleSaveName}
                  className="flex-1 rounded border border-blue-500 bg-white px-1 py-0.5 text-sm text-zinc-900 outline-none dark:bg-zinc-800 dark:text-zinc-100"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span
                  className="flex-1 truncate text-left"
                  title="더블클릭하여 이름 변경"
                >
                  {page.name}
                </span>
              )}

              {/* 삭제 버튼 */}
              {!isEditing && (isHovered || isActive) && pages.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => handleDeleteClick(e, page.id)}
                  className="rounded p-0.5 text-zinc-400 opacity-0 transition-opacity hover:bg-zinc-200 hover:text-zinc-600 group-hover:opacity-100 dark:hover:bg-zinc-600 dark:hover:text-zinc-300"
                  title="페이지 삭제"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* 새 페이지 추가 버튼 */}
      <button
        type="button"
        onClick={onAddPage}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
        title="새 페이지 추가"
      >
        <Plus className="h-4 w-4" />
        <span>새 페이지</span>
      </button>
    </div>
  );
}
