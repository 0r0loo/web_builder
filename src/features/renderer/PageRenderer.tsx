import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { ComponentNode } from "@/types/component";
import type { Breakpoint } from "@/types/editor";
import type { Page } from "@/types/page";
import { ComponentRenderer } from "./ComponentRenderer";

/**
 * 재귀적 노드 렌더러
 */
interface NodeRendererProps {
  node: ComponentNode;
  breakpoint: Breakpoint;
}

function NodeRenderer({ node, breakpoint }: NodeRendererProps) {
  // 자식 노드가 있으면 재귀적으로 렌더링
  const children =
    node.children && node.children.length > 0 ? (
      <SortableContext
        items={node.children.map((child) => child.id)}
        strategy={verticalListSortingStrategy}
      >
        {node.children.map((child) => (
          <NodeRenderer key={child.id} node={child} breakpoint={breakpoint} />
        ))}
      </SortableContext>
    ) : null;

  return (
    <ComponentRenderer node={node} breakpoint={breakpoint}>
      {children}
    </ComponentRenderer>
  );
}

/**
 * 페이지 렌더러
 * Page 객체를 받아서 컴포넌트 트리를 렌더링
 */
interface PageRendererProps {
  page: Page;
  breakpoint: Breakpoint;
}

export function PageRenderer({ page, breakpoint }: PageRendererProps) {
  return <NodeRenderer node={page.root} breakpoint={breakpoint} />;
}
