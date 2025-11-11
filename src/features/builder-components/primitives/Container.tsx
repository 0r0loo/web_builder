import type { ComponentNode } from "@/types/component";
import type { ComponentMetadata } from "../types";
import { Box } from "lucide-react";

/**
 * Container 컴포넌트 메타데이터
 */
export const containerMetadata: ComponentMetadata = {
  type: "container",
  label: "컨테이너",
  description: "다른 컴포넌트를 담는 레이아웃 컨테이너",
  category: "layout",
  icon: Box,
  allowChildren: true,
  defaultProps: {},
  defaultStyles: {
    desktop: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
    },
    tablet: {},
    mobile: {},
  },
};

/**
 * Container 렌더 컴포넌트
 */
interface ContainerProps {
  node: ComponentNode;
  children?: React.ReactNode;
}

export function Container({ node, children }: ContainerProps) {
  // 기본 스타일 (최소한의 레이아웃만)
  const baseStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
  };

  // node.styles에서 시각적 스타일만 추출 (레이아웃 제외)
  const visualStyles: React.CSSProperties = {};
  if (node.styles?.desktop) {
    const {
      // 레이아웃 제외 (position, margin 등)
      position,
      top,
      left,
      right,
      bottom,
      margin,
      marginTop,
      marginBottom,
      marginLeft,
      marginRight,
      zIndex,
      ...visual
    } = node.styles.desktop;
    Object.assign(visualStyles, visual);
  }

  // 최종 스타일 병합
  const containerStyle: React.CSSProperties = {
    ...baseStyle,
    ...visualStyles,
  };

  return <div style={containerStyle}>{children}</div>;
}
