import type { ComponentNode } from "@/types/component";
import type { Page } from "@/types/page";
import { generateId } from "./id";

/**
 * 트리에서 노드 ID로 노드 찾기
 */
export function findNodeById(
  node: ComponentNode,
  nodeId: string,
): ComponentNode | null {
  if (node.id === nodeId) return node;

  if (node.children) {
    for (const child of node.children) {
      const found = findNodeById(child, nodeId);
      if (found) return found;
    }
  }

  return null;
}

/**
 * 트리에서 부모 노드 찾기
 */
export function findParentNode(
  node: ComponentNode,
  childId: string,
): ComponentNode | null {
  if (node.children) {
    for (const child of node.children) {
      if (child.id === childId) return node;
      const found = findParentNode(child, childId);
      if (found) return found;
    }
  }
  return null;
}

/**
 * 트리에 노드 추가
 */
export function addNodeToTree(
  page: Page,
  parentId: string | null,
  node: ComponentNode,
  index?: number,
): Page {
  const newRoot = { ...page.root };

  if (parentId === null) {
    // 루트에 추가
    if (!newRoot.children) newRoot.children = [];
    if (index !== undefined) {
      newRoot.children.splice(index, 0, node);
    } else {
      newRoot.children.push(node);
    }
  } else {
    // 특정 부모에 추가
    addNodeRecursive(newRoot, parentId, node, index);
  }

  return {
    ...page,
    root: newRoot,
    updatedAt: Date.now(),
  };
}

function addNodeRecursive(
  node: ComponentNode,
  parentId: string,
  newNode: ComponentNode,
  index?: number,
): boolean {
  if (node.id === parentId) {
    if (!node.children) node.children = [];
    if (index !== undefined) {
      node.children.splice(index, 0, newNode);
    } else {
      node.children.push(newNode);
    }
    return true;
  }

  if (node.children) {
    for (const child of node.children) {
      if (addNodeRecursive(child, parentId, newNode, index)) return true;
    }
  }

  return false;
}

/**
 * 트리에서 노드 업데이트
 */
export function updateNodeInTree(
  page: Page,
  nodeId: string,
  updates: Partial<Omit<ComponentNode, "id">>,
): Page {
  const newRoot = { ...page.root };
  updateNodeRecursive(newRoot, nodeId, updates);

  return {
    ...page,
    root: newRoot,
    updatedAt: Date.now(),
  };
}

function updateNodeRecursive(
  node: ComponentNode,
  nodeId: string,
  updates: Partial<Omit<ComponentNode, "id">>,
): boolean {
  if (node.id === nodeId) {
    Object.assign(node, updates);
    return true;
  }

  if (node.children) {
    for (const child of node.children) {
      if (updateNodeRecursive(child, nodeId, updates)) return true;
    }
  }

  return false;
}

/**
 * 트리에서 노드 삭제
 */
export function deleteNodeFromTree(page: Page, nodeId: string): Page {
  const newRoot = { ...page.root };
  deleteNodeRecursive(newRoot, nodeId);

  return {
    ...page,
    root: newRoot,
    updatedAt: Date.now(),
  };
}

function deleteNodeRecursive(node: ComponentNode, nodeId: string): boolean {
  if (node.children) {
    const index = node.children.findIndex((child) => child.id === nodeId);
    if (index !== -1) {
      node.children.splice(index, 1);
      return true;
    }

    for (const child of node.children) {
      if (deleteNodeRecursive(child, nodeId)) return true;
    }
  }

  return false;
}

/**
 * 노드를 복제하고 새로운 ID 부여
 */
export function duplicateNodeWithNewIds(node: ComponentNode): ComponentNode {
  const newNode: ComponentNode = {
    ...node,
    id: generateId(),
    children: node.children?.map((child) => duplicateNodeWithNewIds(child)),
  };

  return newNode;
}
