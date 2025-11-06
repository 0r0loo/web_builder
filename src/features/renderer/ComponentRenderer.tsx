"use client";

import { useDroppable } from "@dnd-kit/core";
import type { ComponentNode } from "@/types/component";
import type { Breakpoint } from "@/types/editor";
import { getComponent } from "@/features/builder-components/registry";
import { Text } from "@/features/builder-components/primitives/Text";
import { Button } from "@/features/builder-components/primitives/Button";
import { Container } from "@/features/builder-components/primitives/Container";
import { cn } from "@/lib/utils/cn";
import type { CSSProperties } from "react";

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

	// Container인 경우 droppable 설정
	const isContainer = metadata?.allowChildren;
	const { setNodeRef, isOver } = useDroppable({
		id: node.id,
		data: {
			type: "canvas-container",
			nodeId: node.id,
			accepts: ["component-library", "canvas-node"],
		},
		disabled: !isContainer,
	});

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

	// 컴포넌트 렌더링
	return (
		<div
			ref={isContainer ? setNodeRef : undefined}
			className={cn(isContainer && isOver && "ring-2 ring-green-500 ring-inset")}
			style={styles}
			data-component-id={node.id}
			data-component-type={node.type}
		>
			<Component node={node}>{children}</Component>
		</div>
	);
}