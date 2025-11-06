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
				<button
					type="button"
					onClick={() => setBreakpoint("mobile")}
					className={cn(
						"rounded p-2 transition-colors",
						currentBreakpoint === "mobile"
							? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
							: "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50",
					)}
					title="모바일 (< 768px)"
				>
					<Smartphone className="h-4 w-4" />
				</button>
				<button
					type="button"
					onClick={() => setBreakpoint("tablet")}
					className={cn(
						"rounded p-2 transition-colors",
						currentBreakpoint === "tablet"
							? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
							: "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50",
					)}
					title="태블릿 (768px - 1023px)"
				>
					<Tablet className="h-4 w-4" />
				</button>
				<button
					type="button"
					onClick={() => setBreakpoint("desktop")}
					className={cn(
						"rounded p-2 transition-colors",
						currentBreakpoint === "desktop"
							? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
							: "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50",
					)}
					title="데스크톱 (>= 1024px)"
				>
					<Monitor className="h-4 w-4" />
				</button>
			</div>

			{/* 우측: Undo/Redo 및 액션 버튼 */}
			<div className="flex items-center gap-2">
				<div className="flex items-center gap-1">
					<button
						type="button"
						onClick={undo}
						disabled={!canUndo}
						className={cn(
							"rounded p-2 transition-colors",
							canUndo
								? "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
								: "cursor-not-allowed text-zinc-300 dark:text-zinc-700",
						)}
						title="실행 취소 (Ctrl+Z)"
					>
						<Undo2 className="h-4 w-4" />
					</button>
					<button
						type="button"
						onClick={redo}
						disabled={!canRedo}
						className={cn(
							"rounded p-2 transition-colors",
							canRedo
								? "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
								: "cursor-not-allowed text-zinc-300 dark:text-zinc-700",
						)}
						title="다시 실행 (Ctrl+Shift+Z)"
					>
						<Redo2 className="h-4 w-4" />
					</button>
				</div>

				<div className="ml-2 h-6 w-px bg-zinc-200 dark:bg-zinc-700" />

				<div className="flex items-center gap-1">
					<button
						type="button"
						onClick={handleExport}
						className="rounded p-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
						title="프로젝트 내보내기 (JSON)"
					>
						<Download className="h-4 w-4" />
					</button>
					<button
						type="button"
						onClick={handleImport}
						className="rounded p-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
						title="프로젝트 가져오기 (JSON)"
					>
						<Upload className="h-4 w-4" />
					</button>
				</div>

				<div className="ml-2 h-6 w-px bg-zinc-200 dark:bg-zinc-700" />

				<button
					type="button"
					className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
				>
					미리보기
				</button>
				<button
					type="button"
					className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
				>
					발행
				</button>
			</div>
		</header>
	);
}