"use client";

import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import * as ContextMenu from "@radix-ui/react-context-menu";
import type { ComponentNode } from "@/types/component";
import type { Breakpoint } from "@/types/editor";
import { getComponent } from "@/features/builder-components/registry";
import { Text } from "@/features/builder-components/primitives/Text";
import { Button } from "@/features/builder-components/primitives/Button";
import { Container } from "@/features/builder-components/primitives/Container";
import { Image } from "@/features/builder-components/primitives/Image";
import { cn } from "@/lib/utils/cn";
import { useEditorStore } from "@/features/editor/store/editorStore";
import type { CSSProperties } from "react";
import { Copy, Trash2, MoveUp, MoveDown } from "lucide-react";

/**
 * 컴포넌트 타입별 렌더 컴포넌트 맵
 */
const componentMap: Partial<
	Record<
		ComponentNode["type"],
		React.ComponentType<{
			node: ComponentNode;
			children?: React.ReactNode;
		}>
	>
> = {
	text: Text,
	button: Button,
	container: Container,
	image: Image,
};

/**
 * 반응형 스타일 병합
 * 브레이크포인트에 따라 desktop → tablet → mobile 순으로 스타일 병합
 */
function mergeResponsiveStyles(
	node: ComponentNode,
	breakpoint: Breakpoint,
): CSSProperties {
	const { desktop = {}, tablet = {}, mobile = {} } = node.styles;

	// 브레이크포인트별 스타일 병합 전략
	if (breakpoint === "mobile") {
		return { ...desktop, ...tablet, ...mobile };
	}

	if (breakpoint === "tablet") {
		return { ...desktop, ...tablet };
	}

	// desktop
	return desktop;
}

/**
 * 개별 컴포넌트 렌더러
 */
interface ComponentRendererProps {
	node: ComponentNode;
	breakpoint: Breakpoint;
	children?: React.ReactNode;
}

export function ComponentRenderer({
	node,
	breakpoint,
	children,
}: ComponentRendererProps) {
	// 레지스트리에서 컴포넌트 메타데이터 조회
	const metadata = getComponent(node.type);

	// 선택 상태 관리
	const selectedNodeId = useEditorStore((state) => state.selectedNodeId);
	const selectNode = useEditorStore((state) => state.selectNode);
	const deleteNode = useEditorStore((state) => state.deleteNode);
	const duplicateNode = useEditorStore((state) => state.duplicateNode);
	const isSelected = selectedNodeId === node.id;

	// Container인 경우 droppable 설정
	const isContainer = metadata?.allowChildren;
	const { setNodeRef: setDroppableRef, isOver } = useDroppable({
		id: node.id,
		data: {
			type: "canvas-container",
			nodeId: node.id,
			accepts: ["component-library", "canvas-node"],
		},
		disabled: !isContainer,
	});

	// Sortable 사용 (형제 간 순서 변경)
	const {
		attributes,
		listeners,
		setNodeRef: setSortableRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: node.id,
		disabled: !isSelected, // 선택된 컴포넌트만 드래그 가능
	});

	// droppable과 sortable ref 병합
	const setNodeRef = (element: HTMLElement | null) => {
		if (isContainer) {
			setDroppableRef(element);
		}
		setSortableRef(element);
	};

	// 클릭 이벤트 핸들러
	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation(); // 이벤트 버블링 방지
		selectNode(node.id);
	};

	// 컨텍스트 메뉴 핸들러
	const handleDelete = () => {
		deleteNode(node.id);
	};

	const handleDuplicate = () => {
		duplicateNode(node.id);
	};

	// 등록되지 않은 컴포넌트는 에러 표시
	if (!metadata) {
		return (
			<div
				style={{
					padding: "16px",
					backgroundColor: "#fee2e2",
					border: "2px solid #ef4444",
					borderRadius: "8px",
					color: "#991b1b",
				}}
			>
				<strong>알 수 없는 컴포넌트:</strong> {node.type}
			</div>
		);
	}

	// 컴포넌트 타입별 렌더 컴포넌트 가져오기
	const Component = componentMap[node.type];

	if (!Component) {
		return (
			<div
				style={{
					padding: "16px",
					backgroundColor: "#fef3c7",
					border: "2px solid #f59e0b",
					borderRadius: "8px",
					color: "#92400e",
				}}
			>
				<strong>렌더러 미구현:</strong> {node.type}
			</div>
		);
	}

	// 반응형 스타일 병합
	const styles = mergeResponsiveStyles(node, breakpoint);

	// 드래그 스타일 적용 (Sortable용)
	const dragStyle = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	// 래퍼 div는 레이아웃 스타일만 적용 (position, display, margin 등)
	const wrapperStyles: CSSProperties = {
		// 레이아웃 관련 스타일만 추출
		...(styles.display && { display: styles.display }),
		...(styles.position && { position: styles.position }),
		...(styles.top && { top: styles.top }),
		...(styles.left && { left: styles.left }),
		...(styles.right && { right: styles.right }),
		...(styles.bottom && { bottom: styles.bottom }),
		...(styles.margin && { margin: styles.margin }),
		...(styles.marginTop && { marginTop: styles.marginTop }),
		...(styles.marginBottom && { marginBottom: styles.marginBottom }),
		...(styles.marginLeft && { marginLeft: styles.marginLeft }),
		...(styles.marginRight && { marginRight: styles.marginRight }),
		...(styles.width && { width: styles.width }),
		...(styles.height && { height: styles.height }),
		...(styles.maxWidth && { maxWidth: styles.maxWidth }),
		...(styles.minWidth && { minWidth: styles.minWidth }),
		...(styles.maxHeight && { maxHeight: styles.maxHeight }),
		...(styles.minHeight && { minHeight: styles.minHeight }),
		...(styles.zIndex && { zIndex: styles.zIndex }),
		...dragStyle,
	};

	// 컴포넌트 렌더링
	return (
		<ContextMenu.Root>
			<ContextMenu.Trigger asChild>
				<div
					ref={setNodeRef}
					onClick={handleClick}
					className={cn(
						"relative transition-all",
						isSelected ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
						isContainer && isOver && "ring-2 ring-green-500 ring-inset",
						isSelected && "ring-2 ring-blue-500 ring-offset-2",
						isDragging && "z-50",
					)}
					style={{
						...wrapperStyles,
						...(isSelected && {
							userSelect: "none",
							WebkitUserSelect: "none",
							touchAction: "none",
						}),
					}}
					data-component-id={node.id}
					data-component-type={node.type}
					{...(isSelected ? { ...attributes, ...listeners } : {})}
				>
					<Component node={node}>{children}</Component>
				</div>
			</ContextMenu.Trigger>

			<ContextMenu.Portal>
				<ContextMenu.Content
					className="min-w-[200px] rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
				>
					<ContextMenu.Item
						className="flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm outline-none hover:bg-zinc-100 dark:hover:bg-zinc-800"
						onSelect={handleDuplicate}
					>
						<Copy className="h-4 w-4" />
						<span>복제</span>
					</ContextMenu.Item>

					<ContextMenu.Separator className="my-1 h-px bg-zinc-200 dark:bg-zinc-800" />

					<ContextMenu.Item
						className="flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm text-red-600 outline-none hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
						onSelect={handleDelete}
					>
						<Trash2 className="h-4 w-4" />
						<span>삭제</span>
					</ContextMenu.Item>
				</ContextMenu.Content>
			</ContextMenu.Portal>
		</ContextMenu.Root>
	);
}