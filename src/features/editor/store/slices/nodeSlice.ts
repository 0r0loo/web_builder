import type { StateCreator } from "zustand";
import type { EditorStore } from "@/types/editor";
import type { ComponentNode } from "@/types/component";
import {
	addNodeToTree,
	updateNodeInTree,
	deleteNodeFromTree,
	findNodeById,
	findParentNode,
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
	 * 노드 삭제
	 */
	deleteNode: (nodeId) => {
		set((state) => {
			const currentPage = state.pages.find((page) => page.id === state.currentPageId);
			if (!currentPage) return state;

			const updatedPage = deleteNodeFromTree(currentPage, nodeId);

			return {
				pages: state.pages.map((page) =>
					page.id === state.currentPageId ? updatedPage : page,
				),
				selectedNodeId:
					state.selectedNodeId === nodeId ? null : state.selectedNodeId,
			};
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
	 * 노드 복제
	 */
	duplicateNode: (nodeId) => {
		set((state) => {
			const currentPage = state.pages.find((page) => page.id === state.currentPageId);
			if (!currentPage) return state;

			const nodeToDuplicate = findNodeById(currentPage.root, nodeId);
			if (!nodeToDuplicate) return state;

			const duplicatedNode = duplicateNodeWithNewIds(nodeToDuplicate);

			// 부모 찾기
			const parent = findParentNode(currentPage.root, nodeId);
			const parentId = parent?.id || null;

			const updatedPage = addNodeToTree(currentPage, parentId, duplicatedNode);

			return {
				pages: state.pages.map((page) =>
					page.id === state.currentPageId ? updatedPage : page,
				),
			};
		});

		get().saveToHistory();
	},
});