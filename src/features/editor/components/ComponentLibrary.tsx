"use client";

import { Box, Type, Image as ImageIcon, MousePointerClick } from "lucide-react";

/**
 * 컴포넌트 라이브러리 사이드바
 * 드래그 가능한 컴포넌트 목록 표시
 */
export function ComponentLibrary() {
	const components = [
		{
			id: "container",
			label: "컨테이너",
			icon: Box,
			category: "레이아웃",
		},
		{
			id: "text",
			label: "텍스트",
			icon: Type,
			category: "콘텐츠",
		},
		{
			id: "button",
			label: "버튼",
			icon: MousePointerClick,
			category: "콘텐츠",
		},
		{
			id: "image",
			label: "이미지",
			icon: ImageIcon,
			category: "미디어",
		},
	];

	return (
		<div className="flex h-full flex-col">
			<div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
				<h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
					컴포넌트
				</h2>
			</div>

			<div className="flex-1 overflow-y-auto p-3">
				<div className="space-y-1">
					{components.map((component) => {
						const Icon = component.icon;
						return (
							<button
								key={component.id}
								type="button"
								className="flex w-full items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3 text-left transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-750"
							>
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-700">
									<Icon className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
								</div>
								<div className="flex-1">
									<div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
										{component.label}
									</div>
									<div className="text-xs text-zinc-500 dark:text-zinc-400">
										{component.category}
									</div>
								</div>
							</button>
						);
					})}
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