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
  mergedStyles: React.CSSProperties;
  children?: React.ReactNode;
}

export function Text({ node, mergedStyles }: TextProps) {
  const { content = "텍스트를 입력하세요" } = node.props;

  // 기본 스타일
  const baseStyle: React.CSSProperties = {
    fontSize: "16px",
    lineHeight: "1.5",
    color: "#000000",
    whiteSpace: "pre-wrap", // 줄바꿈 유지
  };

  // mergedStyles에서 wrapper가 담당할 레이아웃 속성 제외
  const {
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
    ...textStyles
  } = mergedStyles;

  // 최종 스타일 병합
  const textStyle: React.CSSProperties = {
    ...baseStyle,
    ...textStyles,
  };

  return <div style={textStyle}>{content}</div>;
}
