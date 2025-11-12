"use client";

import { useState } from "react";
import { getComponent } from "@/features/builder-components/registry";
import { cn } from "@/lib/utils/cn";
import type { ComponentNode } from "@/types/component";
import { useEditorStore } from "../store/editorStore";

/**
 * 레이어 패널
 * 컴포넌트 트리 구조를 시각화하고 선택/관리
 */
export function LayersPanel() {
  const currentPage = useEditorStore((state) => {
    const page = state.pages.find((p) => p.id === state.currentPageId);
    return page;
  });

  if (!currentPage || !currentPage.root.children?.length) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            레이어
          </h2>
        </div>

        <div className="flex flex-1 items-center justify-center p-4">
          <div className="text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              컴포넌트를 추가하면
              <br />
              레이어가 표시됩니다
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          레이어
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-0.5">
          {currentPage.root.children.map((node) => (
            <LayerItem key={node.id} node={node} depth={0} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * 개별 레이어 아이템
 * 재귀적으로 자식 노드를 렌더링
 */
interface LayerItemProps {
  node: ComponentNode;
  depth: number;
}

function LayerItem({ node, depth }: LayerItemProps) {
  const selectedNodeId = useEditorStore((state) => state.selectedNodeId);
  const selectNode = useEditorStore((state) => state.selectNode);
  const metadata = getComponent(node.type);

  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedNodeId === node.id;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectNode(node.id);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const Icon = metadata?.icon;

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800",
          isSelected &&
            "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100",
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {/* 접기/펼치기 버튼 */}
        {hasChildren ? (
          <div
            onClick={handleToggle}
            className="flex h-4 w-4 items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded cursor-pointer"
          >
            <svg
              className={cn(
                "h-3 w-3 transition-transform",
                isExpanded && "rotate-90",
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        ) : (
          <div className="w-4" />
        )}

        {/* 컴포넌트 아이콘 */}
        {Icon && (
          <div className="flex h-4 w-4 items-center justify-center text-zinc-600 dark:text-zinc-400">
            <Icon className="h-3.5 w-3.5" />
          </div>
        )}

        {/* 컴포넌트 이름 */}
        <span className="flex-1 truncate font-medium">
          {metadata?.label || node.type}
        </span>

        {/* 자식 개수 */}
        {hasChildren && (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {node.children?.length}
          </span>
        )}
      </button>

      {/* 자식 노드 재귀 렌더링 */}
      {hasChildren && isExpanded && (
        <div className="space-y-0.5">
          {node.children?.map((child) => (
            <LayerItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
