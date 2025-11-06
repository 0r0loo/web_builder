import { useState } from "react";
import {
	DndContext,
	type DragEndEvent,
	type DragStartEvent,
	type DragOverEvent,
	MouseSensor,
	TouchSensor,
	KeyboardSensor,
	useSensor,
	useSensors,
	type UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useEditorStore } from "../store/editorStore";
import { generateId } from "@/lib/utils/id";
import { getComponent } from "@/features/builder-components/registry";
import type { ComponentNode } from "@/types/component";

/**
 * 드래그 앤 드롭 훅
 * 컴포넌트 라이브러리에서 캔버스로 드래그, 캔버스 내 이동 지원
 */
export function useDragAndDrop() {
	const addNode = useEditorStore((state) => state.addNode);
	const moveNode = useEditorStore((state) => state.moveNode);
	const reorderChildren = useEditorStore((state) => state.reorderChildren);
	const findNodeParent = useEditorStore((state) => state.findNodeParent);
	const getCurrentPage = useEditorStore((state) => state.getCurrentPage);

	const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
	const [activeData, setActiveData] = useState<any>(null);
	const [overId, setOverId] = useState<UniqueIdentifier | null>(null);

	// 센서 설정 (마우스, 터치, 키보드)
	const sensors = useSensors(
		useSensor(MouseSensor, {
			activationConstraint: {
				distance: 8, // 8px 이동 후 드래그 시작
			},
		}),
		useSensor(TouchSensor, {
			activationConstraint: {
				delay: 200, // 200ms 후 드래그 시작
				tolerance: 5,
			},
		}),
		useSensor(KeyboardSensor),
	);

	/**
	 * 드래그 시작
	 */
	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id);
		setActiveData(event.active.data.current);
	};

	/**
	 * 드래그 중 (over 상태 추적)
	 */
	const handleDragOver = (event: DragOverEvent) => {
		setOverId(event.over?.id ?? null);
	};

	/**
	 * 드래그 종료
	 */
	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (!over) {
			setActiveId(null);
			setOverId(null);
			return;
		}

		const activeId = String(active.id);
		const overId = String(over.id);

		// active.data에 드래그된 항목의 정보가 있음
		const dragData = active.data.current;

		if (!dragData) {
			setActiveId(null);
			setOverId(null);
			return;
		}

		// 컴포넌트 라이브러리에서 드래그한 경우 (새 컴포넌트 생성)
		if (dragData.type === "component-library") {
			const componentType = dragData.componentType;
			const metadata = getComponent(componentType);

			if (!metadata) {
				console.error(`Component metadata not found: ${componentType}`);
				setActiveId(null);
				setOverId(null);
				return;
			}

			// 드롭 타겟이 자식을 허용하는지 확인
			const currentPage = getCurrentPage();
			if (currentPage) {
				const findNode = (current: ComponentNode, targetId: string): ComponentNode | null => {
					if (current.id === targetId) return current;
					if (current.children) {
						for (const child of current.children) {
							const found = findNode(child, targetId);
							if (found) return found;
						}
					}
					return null;
				};

				const targetNode = findNode(currentPage.root, overId);
				if (targetNode) {
					const targetMetadata = getComponent(targetNode.type);
					if (targetMetadata && !targetMetadata.allowChildren) {
						// 자식을 허용하지 않는 컴포넌트에는 드롭 불가
						console.warn(`Cannot drop into ${targetNode.type}: children not allowed`);
						setActiveId(null);
						setOverId(null);
						return;
					}
				}
			}

			// 새 컴포넌트 노드 생성
			const newNode: ComponentNode = {
				id: generateId(),
				type: componentType,
				props: { ...metadata.defaultProps },
				styles: { ...metadata.defaultStyles },
				children: metadata.allowChildren ? [] : undefined,
			};

			// over.id는 드롭 타겟 (parentId 또는 root)
			addNode(overId, newNode);
		}
		// Sortable: 같은 부모 내에서 순서 변경
		else if (activeId !== overId) {
			const currentPage = getCurrentPage();
			if (!currentPage) {
				setActiveId(null);
				setOverId(null);
				return;
			}

			// active와 over의 부모가 같은지 확인
			const activeParent = findNodeParent(activeId);
			const overParent = findNodeParent(overId);

			if (activeParent && overParent && activeParent.id === overParent.id) {
				// 같은 부모 내에서 순서 변경
				const children = activeParent.children || [];
				const oldIndex = children.findIndex((child) => child.id === activeId);
				const newIndex = children.findIndex((child) => child.id === overId);

				if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
					reorderChildren(activeParent.id, oldIndex, newIndex);
				}
			} else if (dragData.type === "canvas-node") {
				// 다른 부모로 이동
				const nodeId = dragData.nodeId;

				// 타겟이 자식을 허용하는지 확인
				const findNode = (current: ComponentNode, targetId: string): ComponentNode | null => {
					if (current.id === targetId) return current;
					if (current.children) {
						for (const child of current.children) {
							const found = findNode(child, targetId);
							if (found) return found;
						}
					}
					return null;
				};

				const targetNode = findNode(currentPage.root, overId);
				if (targetNode) {
					const targetMetadata = getComponent(targetNode.type);
					if (targetMetadata && !targetMetadata.allowChildren) {
						// 자식을 허용하지 않는 컴포넌트로는 이동 불가
						console.warn(`Cannot move into ${targetNode.type}: children not allowed`);
						setActiveId(null);
						setOverId(null);
						return;
					}
				}

				moveNode(nodeId, overId);
			}
		}

		setActiveId(null);
		setOverId(null);
	};

	/**
	 * 드래그 취소
	 */
	const handleDragCancel = () => {
		setActiveId(null);
		setOverId(null);
	};

	return {
		sensors,
		activeId,
		activeData,
		overId,
		handleDragStart,
		handleDragOver,
		handleDragEnd,
		handleDragCancel,
	};
}