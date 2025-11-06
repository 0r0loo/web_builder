"use client";

import { useEditorStore } from "../store/editorStore";
import { findNodeById } from "@/lib/utils/tree";
import { getComponent } from "@/features/builder-components/registry";
import { Monitor, Tablet, Smartphone } from "lucide-react";

/**
 * 속성 패널
 * 선택된 컴포넌트의 속성과 스타일을 편집
 */
export function PropertiesPanel() {
	const selectedNodeId = useEditorStore((state) => state.selectedNodeId);
	const updateNode = useEditorStore((state) => state.updateNode);
	const deleteNode = useEditorStore((state) => state.deleteNode);

	// selectedNode를 직접 selector로 가져와서 리액티브하게 만듦
	const selectedNode = useEditorStore((state) => {
		if (!selectedNodeId) return null;
		const currentPage = state.pages.find(
			(page) => page.id === state.currentPageId,
		);
		if (!currentPage) return null;
		return findNodeById(currentPage.root, selectedNodeId);
	});

	// 삭제 핸들러
	const handleDelete = () => {
		if (!selectedNode) return;

		// 자식 노드가 있으면 확인
		const childrenCount = selectedNode.children?.length || 0;
		if (childrenCount > 0) {
			const confirmed = window.confirm(
				`이 컴포넌트는 ${childrenCount}개의 자식 컴포넌트를 포함하고 있습니다.\n모두 삭제하시겠습니까?`,
			);
			if (!confirmed) return;
		}

		deleteNode(selectedNode.id);
	};

	if (!selectedNodeId || !selectedNode) {
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

	const metadata = getComponent(selectedNode.type);

	return (
		<div className="flex h-full flex-col">
			<div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
							속성
						</h2>
						<p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
							{metadata?.label || selectedNode.type}
						</p>
					</div>
					<button
						type="button"
						onClick={handleDelete}
						className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-700 dark:hover:bg-red-800"
						title="Delete (Del)"
					>
						삭제
					</button>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto p-4">
				<div className="space-y-6">
					{/* 컴포넌트 ID */}
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

					{/* Props 편집 섹션 */}
					<PropsEditor node={selectedNode} updateNode={updateNode} />

					{/* Styles 편집 섹션 */}
					<StylesEditor node={selectedNode} updateNode={updateNode} />
				</div>
			</div>
		</div>
	);
}

/**
 * Props 편집기
 */
interface PropsEditorProps {
	node: import("@/types/component").ComponentNode;
	updateNode: (
		nodeId: string,
		updates: Partial<Omit<import("@/types/component").ComponentNode, "id">>,
	) => void;
}

function PropsEditor({ node, updateNode }: PropsEditorProps) {
	const handlePropChange = (key: string, value: string) => {
		updateNode(node.id, {
			props: {
				...node.props,
				[key]: value,
			},
		});
	};

	return (
		<div>
			<h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-300">
				Props
			</h3>

			<div className="space-y-3">
				{/* Text 컴포넌트 */}
				{node.type === "text" && (
					<div>
						<label
							htmlFor="prop-content"
							className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300"
						>
							텍스트 내용
						</label>
						<textarea
							id="prop-content"
							value={(node.props.content as string) || ""}
							onChange={(e) => handlePropChange("content", e.target.value)}
							rows={3}
							className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
						/>
					</div>
				)}

				{/* Button 컴포넌트 */}
				{node.type === "button" && (
					<>
						<div>
							<label
								htmlFor="prop-text"
								className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300"
							>
								버튼 텍스트
							</label>
							<input
								id="prop-text"
								type="text"
								value={(node.props.text as string) || ""}
								onChange={(e) => handlePropChange("text", e.target.value)}
								className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
							/>
						</div>
						<div>
							<label
								htmlFor="prop-variant"
								className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300"
							>
								스타일 변형
							</label>
							<select
								id="prop-variant"
								value={(node.props.variant as string) || "primary"}
								onChange={(e) => handlePropChange("variant", e.target.value)}
								className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
							>
								<option value="primary">Primary</option>
								<option value="secondary">Secondary</option>
								<option value="outline">Outline</option>
							</select>
						</div>
					</>
				)}

				{/* Container 컴포넌트 */}
				{node.type === "container" && (
					<p className="text-xs text-zinc-500 dark:text-zinc-400">
						Container는 별도의 props가 없습니다
					</p>
				)}
			</div>
		</div>
	);
}

/**
 * Styles 편집기
 */
interface StylesEditorProps {
	node: import("@/types/component").ComponentNode;
	updateNode: (
		nodeId: string,
		updates: Partial<Omit<import("@/types/component").ComponentNode, "id">>,
	) => void;
}

function StylesEditor({ node, updateNode }: StylesEditorProps) {
	const currentBreakpoint = useEditorStore((state) => state.currentBreakpoint);
	const currentStyles = node.styles[currentBreakpoint] || {};

	const handleStyleChange = (key: string, value: string) => {
		updateNode(node.id, {
			styles: {
				[currentBreakpoint]: {
					...currentStyles,
					[key]: value,
				},
			},
		});
	};

	// 브레이크포인트별 아이콘 및 라벨
	const breakpointInfo = {
		mobile: { icon: Smartphone, label: "모바일", size: "< 768px" },
		tablet: { icon: Tablet, label: "태블릿", size: "768px - 1023px" },
		desktop: { icon: Monitor, label: "데스크톱", size: ">= 1024px" },
	}[currentBreakpoint];

	const BreakpointIcon = breakpointInfo.icon;

	return (
		<div>
			<div className="mb-3 flex items-center gap-2">
				<h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-300">
					Styles
				</h3>
				<div className="flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-1 dark:bg-blue-900/30">
					<BreakpointIcon className="h-3 w-3 text-blue-600 dark:text-blue-400" />
					<span className="text-xs font-medium text-blue-700 dark:text-blue-300">
						{breakpointInfo.label}
					</span>
					<span className="text-xs text-blue-600/70 dark:text-blue-400/70">
						{breakpointInfo.size}
					</span>
				</div>
			</div>

			<div className="space-y-3">
				{/* 폰트 크기 */}
				<div>
					<label
						htmlFor="style-fontSize"
						className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300"
					>
						Font Size
					</label>
					<input
						id="style-fontSize"
						type="text"
						value={currentStyles.fontSize || ""}
						onChange={(e) => handleStyleChange("fontSize", e.target.value)}
						placeholder="16px"
						className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
					/>
				</div>

				{/* 색상 */}
				<div>
					<label
						htmlFor="style-color"
						className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300"
					>
						Color
					</label>
					<input
						id="style-color"
						type="text"
						value={currentStyles.color || ""}
						onChange={(e) => handleStyleChange("color", e.target.value)}
						placeholder="#000000"
						className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
					/>
				</div>

				{/* 배경색 */}
				<div>
					<label
						htmlFor="style-backgroundColor"
						className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300"
					>
						Background Color
					</label>
					<input
						id="style-backgroundColor"
						type="text"
						value={currentStyles.backgroundColor || ""}
						onChange={(e) =>
							handleStyleChange("backgroundColor", e.target.value)
						}
						placeholder="transparent"
						className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
					/>
				</div>

				{/* 패딩 */}
				<div>
					<label
						htmlFor="style-padding"
						className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300"
					>
						Padding
					</label>
					<input
						id="style-padding"
						type="text"
						value={currentStyles.padding || ""}
						onChange={(e) => handleStyleChange("padding", e.target.value)}
						placeholder="16px"
						className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
					/>
				</div>
			</div>
		</div>
	);
}