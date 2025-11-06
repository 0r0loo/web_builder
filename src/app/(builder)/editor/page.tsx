"use client";

import { useEffect } from "react";
import { useEditorStore } from "@/features/editor/store/editorStore";
import { EditorHeader } from "@/features/editor/components/EditorHeader";
import { ComponentLibrary } from "@/features/editor/components/ComponentLibrary";
import { Canvas } from "@/features/editor/components/Canvas";
import { PropertiesPanel } from "@/features/editor/components/PropertiesPanel";

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

	// 초기 페이지 생성
	useEffect(() => {
		if (!currentPageId) {
			createPage({ name: "홈페이지" });
		}
	}, [currentPageId, createPage]);

	return (
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
	);
}