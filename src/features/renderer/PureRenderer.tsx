import type { CSSProperties } from "react";
import { Button } from "@/features/builder-components/primitives/Button";
import { Container } from "@/features/builder-components/primitives/Container";
import { Image } from "@/features/builder-components/primitives/Image";
import { Link } from "@/features/builder-components/primitives/Link";
import { Text } from "@/features/builder-components/primitives/Text";
import type { ComponentNode } from "@/types/component";
import type { Breakpoint } from "@/types/editor";

/**
 * 컴포넌트 타입별 렌더 컴포넌트 맵
 */
const componentMap: Partial<
  Record<
    ComponentNode["type"],
    React.ComponentType<{
      node: ComponentNode;
      mergedStyles: CSSProperties;
      children?: React.ReactNode;
      isEditorMode?: boolean;
    }>
  >
> = {
  text: Text,
  button: Button,
  container: Container,
  image: Image,
  link: Link,
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
 * 순수 프리뷰/배포용 노드 렌더러
 * DnD, 선택, Context Menu 등 에디터 기능 없이 순수하게 렌더링만 수행
 */
interface PureNodeRendererProps {
  node: ComponentNode;
  breakpoint: Breakpoint;
}

function PureNodeRenderer({ node, breakpoint }: PureNodeRendererProps) {
  // 컴포넌트 가져오기
  const Component = componentMap[node.type];

  if (!Component) {
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

  // 반응형 스타일 병합
  const styles = mergeResponsiveStyles(node, breakpoint);

  // inline 성격의 컴포넌트들 (button, image 등)
  const inlineComponents = ["button", "image"];
  const isInlineComponent = inlineComponents.includes(node.type);

  // Container는 순수 레이아웃 컴포넌트이므로 모든 스타일을 wrapper에 적용
  // 다른 컴포넌트는 외부 레이아웃 스타일만 wrapper에 적용
  const wrapperStyles: CSSProperties =
    node.type === "container"
      ? styles // Container는 모든 스타일을 wrapper에 적용
      : {
          // 다른 컴포넌트는 외부 레이아웃 관련 스타일만 추출
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
          // inline 컴포넌트는 width가 명시되지 않았으면 fit-content
          ...(!styles.width && isInlineComponent && { width: "fit-content" }),
        };

  // 자식 노드 재귀 렌더링
  const children =
    node.children && node.children.length > 0
      ? node.children.map((child) => (
          <PureNodeRenderer
            key={child.id}
            node={child}
            breakpoint={breakpoint}
          />
        ))
      : null;

  return (
    <div style={wrapperStyles} data-component-type={node.type}>
      <Component node={node} mergedStyles={styles} isEditorMode={false}>
        {children}
      </Component>
    </div>
  );
}

/**
 * 순수 렌더러 - 프리뷰 및 배포 사이트용
 * DnD, 선택, Context Menu 등 에디터 기능 없이 순수하게 렌더링만 수행
 *
 * 사용처:
 * - 프리뷰 페이지 (/preview/[id])
 * - 실제 배포 사이트
 */
interface PureRendererProps {
  root: ComponentNode;
  breakpoint: Breakpoint;
}

export function PureRenderer({ root, breakpoint }: PureRendererProps) {
  return <PureNodeRenderer node={root} breakpoint={breakpoint} />;
}
