"use client";

import { useEffect, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
	getComponentsGroupedByCategory,
	getRegistrySize,
} from "@/features/builder-components/registry";
import { registerPrimitiveComponents } from "@/features/builder-components/primitives";
import type {
	ComponentMetadata,
	ComponentCategory,
} from "@/features/builder-components/types";

/**
 * 카테고리 한글 라벨
 */
const categoryLabels: Record<ComponentCategory, string> = {
	layout: "레이아웃",
	typography: "타이포그래피",
	form: "폼 요소",
	media: "미디어",
	navigation: "네비게이션",
};

/**
 * 드래그 가능한 컴포넌트 아이템
 */
interface DraggableComponentItemProps {
	component: ComponentMetadata;
}

function DraggableComponentItem({ component }: DraggableComponentItemProps) {
	const { attributes, listeners, setNodeRef, transform, isDragging } =
		useDraggable({
			id: `component-${component.type}`,
			data: {
				type: "component-library",
				componentType: component.type,
			},
		});

	const style = {
		transform: CSS.Translate.toString(transform),
		opacity: isDragging ? 0.5 : 1,
		cursor: isDragging ? "grabbing" : "grab",
	};

	const Icon = component.icon;

	return (
		<button
			ref={setNodeRef}
			type="button"
			className="flex w-full items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3 text-left transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-750"
			style={style}
			{...attributes}
			{...listeners}
		>
			<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-700">
				<Icon className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
			</div>
			<div className="flex-1">
				<div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
					{component.label}
				</div>
				<div className="text-xs text-zinc-500 dark:text-zinc-400">
					{component.description}
				</div>
			</div>
		</button>
	);
}

/**
 * 컴포넌트 라이브러리 사이드바
 * 드래그 가능한 컴포넌트 목록 표시
 */
export function ComponentLibrary() {
	const [componentsGrouped, setComponentsGrouped] = useState<
		Record<ComponentCategory, ComponentMetadata[]>
	>({
		layout: [],
		typography: [],
		form: [],
		media: [],
		navigation: [],
	});

	// 컴포넌트 레지스트리 초기화 및 로드
	useEffect(() => {
		// 프리미티브 컴포넌트 등록
		if (getRegistrySize() === 0) {
			registerPrimitiveComponents();
		}

		// 카테고리별로 그룹핑된 컴포넌트 가져오기
		const grouped = getComponentsGroupedByCategory();
		setComponentsGrouped(grouped);
	}, []);

	return (
		<div className="flex h-full flex-col">
			<div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
				<h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
					컴포넌트
				</h2>
			</div>

			<div className="flex-1 overflow-y-auto p-3">
				<div className="space-y-4">
					{(Object.entries(componentsGrouped) as [ComponentCategory, ComponentMetadata[]][])
						.filter(([_, components]) => components.length > 0)
						.map(([category, components]) => (
							<div key={category}>
								<h3 className="mb-2 px-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
									{categoryLabels[category]}
								</h3>
								<div className="space-y-1">
									{components.map((component) => (
										<DraggableComponentItem
											key={component.type}
											component={component}
										/>
									))}
								</div>
							</div>
						))}
				</div>
			</div>

			<div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
				<p className="text-xs text-zinc-500 dark:text-zinc-400">
					컴포넌트를 드래그하여 캔버스에 추가하세요
				</p>
			</div>
		</div>
	);
}