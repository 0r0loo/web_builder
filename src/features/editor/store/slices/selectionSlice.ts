import type { StateCreator } from "zustand";
import type { EditorStore } from "@/types/editor";

/**
 * 선택 및 호버 상태 관리 슬라이스
 */
export interface SelectionSlice {
	selectedNodeId: string | null;
	hoveredNodeId: string | null;
	selectNode: (nodeId: string | null) => void;
	clearSelection: () => void;
	hoverNode: (nodeId: string | null) => void;
}

export const createSelectionSlice: StateCreator<
	EditorStore,
	[],
	[],
	SelectionSlice
> = (set) => ({
	selectedNodeId: null,
	hoveredNodeId: null,

	/**
	 * 노드 선택
	 */
	selectNode: (nodeId) => {
		set({ selectedNodeId: nodeId });
	},

	/**
	 * 선택 해제
	 */
	clearSelection: () => {
		set({ selectedNodeId: null });
	},

	/**
	 * 노드 호버
	 */
	hoverNode: (nodeId) => {
		set({ hoveredNodeId: nodeId });
	},
});