"use client";

import { useEditorStore } from "../store/editorStore";
import { cn } from "@/lib/utils/cn";

/**
 * 에디터 캔버스
 * 페이지를 렌더링하고 드래그 앤 드롭으로 편집
 */
export function Canvas() {
	const currentPage = useEditorStore((state) => state.getCurrentPage());
	const currentBreakpoint = useEditorStore((state) => state.currentBreakpoint);

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

	return (
		<div className="flex h-full items-start justify-center overflow-auto bg-zinc-50 p-8 dark:bg-zinc-900">
			<div
				className={cn(
					"min-h-[600px] bg-white shadow-lg transition-all duration-300 dark:bg-zinc-800",
					currentBreakpoint === "desktop" ? "w-full" : "mx-auto",
				)}
				style={{
					width: canvasWidth,
					maxWidth: "100%",
				}}
			>
				{/* 빈 캔버스 상태 */}
				<div className="flex h-full min-h-[600px] items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-700">
					<div className="text-center">
						<p className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
							여기에 컴포넌트를 드래그하세요
						</p>
						<p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
							좌측 사이드바에서 컴포넌트를 선택하여 시작하세요
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}