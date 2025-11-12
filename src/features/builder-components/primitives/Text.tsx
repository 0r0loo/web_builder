import type { ComponentNode } from "@/types/component";
import type { ComponentMetadata } from "../types";
import { Type } from "lucide-react";

/**
 * Text 컴포넌트 메타데이터
 */
export const textMetadata: ComponentMetadata = {
  type: "text",
  label: "텍스트",
  description: "편집 가능한 텍스트 요소",
  category: "typography",
  icon: Type,
  allowChildren: false,
  defaultProps: {
    content: "텍스트를 입력하세요",
  },
  defaultStyles: {
    desktop: {
      fontSize: "16px",
      lineHeight: "1.5",
      color: "#000000",
    },
    tablet: {},
    mobile: {},
  },
};

/**
 * Text 렌더 컴포넌트
 */
interface TextProps {
  node: ComponentNode;
  children?: React.ReactNode;
}

export function Text({ node }: TextProps) {
  const { content = "텍스트를 입력하세요" } = node.props;

  // 기본 스타일
  const baseStyle: React.CSSProperties = {
    fontSize: "16px",
    lineHeight: "1.5",
    color: "#000000",
  };

  // node.styles에서 시각적 스타일만 추출 (레이아웃 제외)
  const visualStyles: React.CSSProperties = {};
  if (node.styles?.desktop) {
    const {
      // 레이아웃 속성 제외
      display,
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
      width,
      height,
      maxWidth,
      minWidth,
      maxHeight,
      minHeight,
      zIndex,
      ...visual
    } = node.styles.desktop;
    Object.assign(visualStyles, visual);
  }

  // 최종 스타일 병합
  const textStyle: React.CSSProperties = {
    ...baseStyle,
    ...visualStyles,
  };

  return <span style={textStyle}>{content}</span>;
}
