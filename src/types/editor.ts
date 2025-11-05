import type { Breakpoint, ComponentNode } from "./component";
import type { Page } from "./page";

/**
 * Editor mode
 */
export type EditorMode = "edit" | "preview";

/**
 * Editor state
 */
export interface EditorState {
	// Pages
	pages: Page[];
	currentPageId: string | null;

	// Selection
	selectedNodeId: string | null;
	hoveredNodeId: string | null;

	// Viewport
	currentBreakpoint: Breakpoint;
	editorMode: EditorMode;

	// History
	history: Page[];
	historyIndex: number;
	canUndo: boolean;
	canRedo: boolean;

	// UI State
	showComponentLibrary: boolean;
	showLayersPanel: boolean;
	showPropertiesPanel: boolean;
}

/**
 * Editor actions
 */
export interface EditorActions {
	// Page management
	createPage: (input: { name: string; slug?: string }) => void;
	deletePage: (pageId: string) => void;
	setCurrentPage: (pageId: string) => void;
	getCurrentPage: () => Page | null;

	// Node management
	addNode: (parentId: string | null, node: ComponentNode) => void;
	updateNode: (
		nodeId: string,
		updates: Partial<Omit<ComponentNode, "id">>,
	) => void;
	deleteNode: (nodeId: string) => void;
	moveNode: (nodeId: string, targetParentId: string, index?: number) => void;
	duplicateNode: (nodeId: string) => void;

	// Selection
	selectNode: (nodeId: string | null) => void;
	hoverNode: (nodeId: string | null) => void;

	// Viewport
	setBreakpoint: (breakpoint: Breakpoint) => void;
	setEditorMode: (mode: EditorMode) => void;

	// History
	undo: () => void;
	redo: () => void;
	saveToHistory: () => void;

	// UI
	toggleComponentLibrary: () => void;
	toggleLayersPanel: () => void;
	togglePropertiesPanel: () => void;
}

/**
 * Complete editor store
 */
export type EditorStore = EditorState & EditorActions;