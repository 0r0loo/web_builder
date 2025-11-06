"use client";

import { useEditorStore } from "../store/editorStore";

/**
 * 속성 패널
 * 선택된 컴포넌트의 속성과 스타일을 편집
 */
export function PropertiesPanel() {
	const selectedNodeId = useEditorStore((state) => state.selectedNodeId);

	if (!selectedNodeId) {
		return (
			<div className="flex h-full flex-col">
				<div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
					<h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
						속성
					</h2>
				</div>

				<div className="flex flex-1 items-center justify-center p-4">
					<div className="text-center">
						<p className="text-sm text-zinc-500 dark:text-zinc-400">
							컴포넌트를 선택하면
							<br />
							속성을 편집할 수 있습니다
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
					속성
				</h2>
			</div>

			<div className="flex-1 overflow-y-auto p-4">
				<div className="space-y-4">
					<div>
						<label
							htmlFor="component-id"
							className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300"
						>
							컴포넌트 ID
						</label>
						<input
							id="component-id"
							type="text"
							value={selectedNodeId}
							readOnly
							className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
						/>
					</div>

					<div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
						<p className="text-xs text-zinc-500 dark:text-zinc-400">
							속성 편집 기능은 Phase 6에서 구현됩니다
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}