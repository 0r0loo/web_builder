"use client";

import { useEditorStore } from "../store/editorStore";
import { findNodeById } from "@/lib/utils/tree";
import { getComponent } from "@/features/builder-components/registry";
import { useState } from "react";

/**
 * 속성 패널
 * 선택된 컴포넌트의 속성과 스타일을 편집
 */
export function PropertiesPanel() {
	const selectedNodeId = useEditorStore((state) => state.selectedNodeId);
	const getCurrentPage = useEditorStore((state) => state.getCurrentPage);
	const updateNode = useEditorStore((state) => state.updateNode);

	const currentPage = getCurrentPage();
	const selectedNode =
		selectedNodeId && currentPage
			? findNodeById(currentPage.root, selectedNodeId)
			: null;

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
				<h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
					속성
				</h2>
				<p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
					{metadata?.label || selectedNode.type}
				</p>
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
	const handlePropChange = (key: string, value: any) => {
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

	return (
		<div>
			<h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-300">
				Styles ({currentBreakpoint})
			</h3>

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