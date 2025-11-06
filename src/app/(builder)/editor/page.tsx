"use client";

import { useEffect } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { useEditorStore } from "@/features/editor/store/editorStore";
import { EditorHeader } from "@/features/editor/components/EditorHeader";
import { ComponentLibrary } from "@/features/editor/components/ComponentLibrary";
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

	// 드래그 앤 드롭 설정
	const {
		sensors,
		activeData,
		handleDragStart,
		handleDragOver,
		handleDragEnd,
		handleDragCancel,
	} = useDragAndDrop();

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
							content: "좌측 사이드바에서 컴포넌트를 드래그하여 페이지를 만들어보세요.",
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

	return (
		<DndContext
			sensors={sensors}
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
					{/* 좌측 사이드바 - 컴포넌트 라이브러리 */}
					{showComponentLibrary && (
						<aside className="w-64 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
							<ComponentLibrary />
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