import type { StateCreator } from "zustand";
import type { EditorStore } from "@/types/editor";
import type { ComponentNode } from "@/types/component";
import {
	findNodeById,
	duplicateNodeWithNewIds,
} from "@/lib/utils/tree";

/**
 * 노드 관리 슬라이스
 */
export interface NodeSlice {
	addNode: (parentId: string | null, node: ComponentNode) => void;
	updateNode: (
		nodeId: string,
		updates: Partial<Omit<ComponentNode, "id">>,
	) => void;
	deleteNode: (nodeId: string) => void;
	moveNode: (nodeId: string, targetParentId: string, index?: number) => void;
	duplicateNode: (nodeId: string) => void;
	reorderChildren: (parentId: string, oldIndex: number, newIndex: number) => void;
	findNodeParent: (nodeId: string) => ComponentNode | null;
}

export const createNodeSlice: StateCreator<
	EditorStore,
	[["zustand/immer", never]],
	[],
	NodeSlice
> = (set, get) => ({
	/**
	 * 노드 추가 (Immer 스타일)
	 */
	addNode: (parentId, node) => {
		set((state) => {
			const currentPage = state.pages.find(
				(page) => page.id === state.currentPageId,
			);
			if (!currentPage) return;

			// parentId가 null이면 루트에 추가
			if (parentId === null || parentId === currentPage.root.id) {
				if (!currentPage.root.children) currentPage.root.children = [];
				currentPage.root.children.push(node);
			} else {
				// 특정 부모 노드 찾아서 추가
				const addToParent = (current: ComponentNode): boolean => {
					if (current.id === parentId) {
						if (!current.children) current.children = [];
						current.children.push(node);
						return true;
					}

					if (current.children) {
						for (const child of current.children) {
							if (addToParent(child)) return true;
						}
					}

					return false;
				};

				addToParent(currentPage.root);
			}

			currentPage.updatedAt = Date.now();
		});

		get().saveToHistory();
	},

	/**
	 * 노드 업데이트 (Immer 스타일)
	 */
	updateNode: (nodeId, updates) => {
		set((state) => {
			const currentPage = state.pages.find(
				(page) => page.id === state.currentPageId,
			);
			if (!currentPage) return;

			// 노드 찾아서 업데이트
			const updateInTree = (current: ComponentNode): boolean => {
				if (current.id === nodeId) {
					// props와 styles는 deep merge 필요
					if (updates.props) {
						current.props = {
							...current.props,
							...updates.props,
						};
					}

					if (updates.styles) {
						current.styles = {
							desktop: {
								...current.styles.desktop,
								...updates.styles.desktop,
							},
							tablet: {
								...current.styles.tablet,
								...updates.styles.tablet,
							},
							mobile: {
								...current.styles.mobile,
								...updates.styles.mobile,
							},
						};
					}

					// 나머지 속성은 직접 할당
					const { props, styles, ...rest } = updates;
					Object.assign(current, rest);

					return true;
				}

				if (current.children) {
					for (const child of current.children) {
						if (updateInTree(child)) return true;
					}
				}

				return false;
			};

			updateInTree(currentPage.root);
			currentPage.updatedAt = Date.now();
		});

		get().saveToHistory();
	},

	/**
	 * 노드 삭제 (Immer 스타일)
	 */
	deleteNode: (nodeId) => {
		set((state) => {
			const currentPage = state.pages.find((page) => page.id === state.currentPageId);
			if (!currentPage) return;

			// 재귀적으로 노드 삭제 (draft 직접 수정)
			const deleteFromParent = (current: ComponentNode): boolean => {
				if (current.children) {
					const idx = current.children.findIndex((child) => child.id === nodeId);
					if (idx !== -1) {
						current.children.splice(idx, 1);
						return true;
					}
					for (const child of current.children) {
						if (deleteFromParent(child)) return true;
					}
				}
				return false;
			};

			deleteFromParent(currentPage.root);
			currentPage.updatedAt = Date.now();

			// 선택된 노드가 삭제되면 선택 해제
			if (state.selectedNodeId === nodeId) {
				state.selectedNodeId = null;
			}
		});

		get().saveToHistory();
	},

	/**
	 * 노드 이동
	 */
	moveNode: (nodeId, targetParentId, index) => {
		set((state) => {
			const currentPage = state.pages.find((page) => page.id === state.currentPageId);
			if (!currentPage) return;

			// 1. 노드 찾기 및 복사
			const nodeToMove = findNodeById(currentPage.root, nodeId);
			if (!nodeToMove) return;

			// Deep copy to preserve node data
			const nodeCopy = JSON.parse(JSON.stringify(nodeToMove));

			// 2. 원래 위치에서 제거 (draft 직접 수정)
			const removeFromParent = (current: ComponentNode): boolean => {
				if (current.children) {
					const idx = current.children.findIndex((child) => child.id === nodeId);
					if (idx !== -1) {
						current.children.splice(idx, 1);
						return true;
					}
					for (const child of current.children) {
						if (removeFromParent(child)) return true;
					}
				}
				return false;
			};

			removeFromParent(currentPage.root);

			// 3. 새 위치에 추가 (draft 직접 수정)
			if (targetParentId === currentPage.root.id) {
				if (!currentPage.root.children) currentPage.root.children = [];
				if (index !== undefined) {
					currentPage.root.children.splice(index, 0, nodeCopy);
				} else {
					currentPage.root.children.push(nodeCopy);
				}
			} else {
				const addToParent = (current: ComponentNode): boolean => {
					if (current.id === targetParentId) {
						if (!current.children) current.children = [];
						if (index !== undefined) {
							current.children.splice(index, 0, nodeCopy);
						} else {
							current.children.push(nodeCopy);
						}
						return true;
					}
					if (current.children) {
						for (const child of current.children) {
							if (addToParent(child)) return true;
						}
					}
					return false;
				};

				addToParent(currentPage.root);
			}

			currentPage.updatedAt = Date.now();
		});

		get().saveToHistory();
	},

	/**
	 * 노드 복제 (Immer 스타일)
	 */
	duplicateNode: (nodeId) => {
		set((state) => {
			const currentPage = state.pages.find((page) => page.id === state.currentPageId);
			if (!currentPage) return;

			const nodeToDuplicate = findNodeById(currentPage.root, nodeId);
			if (!nodeToDuplicate) return;

			const duplicatedNode = duplicateNodeWithNewIds(nodeToDuplicate);

			// 부모 찾아서 복제본 추가 (draft 직접 수정)
			const addDuplicateToParent = (current: ComponentNode): boolean => {
				if (current.children) {
					const idx = current.children.findIndex((child) => child.id === nodeId);
					if (idx !== -1) {
						// 원본 바로 다음에 복제본 삽입
						current.children.splice(idx + 1, 0, duplicatedNode);
						return true;
					}
					for (const child of current.children) {
						if (addDuplicateToParent(child)) return true;
					}
				}
				return false;
			};

			// 루트의 직접 자식인 경우
			if (currentPage.root.children?.some((child) => child.id === nodeId)) {
				const idx = currentPage.root.children.findIndex((child) => child.id === nodeId);
				currentPage.root.children.splice(idx + 1, 0, duplicatedNode);
			} else {
				addDuplicateToParent(currentPage.root);
			}

			currentPage.updatedAt = Date.now();
		});

		get().saveToHistory();
	},

	/**
	 * 자식 노드들의 순서 변경 (Sortable용)
	 */
	reorderChildren: (parentId, oldIndex, newIndex) => {
		set((state) => {
			const currentPage = state.pages.find((page) => page.id === state.currentPageId);
			if (!currentPage) return;

			// 부모 노드 찾기
			const reorderInParent = (current: ComponentNode): boolean => {
				if (current.id === parentId) {
					if (!current.children || current.children.length === 0) return false;

					// 배열 순서 변경
					const [removed] = current.children.splice(oldIndex, 1);
					current.children.splice(newIndex, 0, removed);
					return true;
				}

				if (current.children) {
					for (const child of current.children) {
						if (reorderInParent(child)) return true;
					}
				}

				return false;
			};

			// 루트인 경우
			if (parentId === currentPage.root.id) {
				if (currentPage.root.children && currentPage.root.children.length > 0) {
					const [removed] = currentPage.root.children.splice(oldIndex, 1);
					currentPage.root.children.splice(newIndex, 0, removed);
				}
			} else {
				reorderInParent(currentPage.root);
			}

			currentPage.updatedAt = Date.now();
		});

		get().saveToHistory();
	},

	/**
	 * 노드의 부모 찾기
	 */
	findNodeParent: (nodeId) => {
		const currentPage = get().getCurrentPage();
		if (!currentPage) return null;

		const findParent = (current: ComponentNode, targetId: string): ComponentNode | null => {
			if (current.children) {
				for (const child of current.children) {
					if (child.id === targetId) {
						return current;
					}
					const found = findParent(child, targetId);
					if (found) return found;
				}
			}
			return null;
		};

		return findParent(currentPage.root, nodeId);
	},
});