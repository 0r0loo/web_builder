import type { ComponentNode } from "@/types/component";
import type { ComponentMetadata } from "../types";
import { MousePointerClick } from "lucide-react";

/**
 * Button 컴포넌트 메타데이터
 */
export const buttonMetadata: ComponentMetadata = {
  type: "button",
  label: "버튼",
  description: "클릭 가능한 버튼 요소",
  category: "form",
  icon: MousePointerClick,
  allowChildren: false,
  defaultProps: {
    text: "버튼",
    variant: "primary", // primary | secondary | outline
  },
  defaultStyles: {
    desktop: {
      padding: "12px 24px",
      fontSize: "16px",
      fontWeight: "500",
      borderRadius: "8px",
      cursor: "pointer",
      transition: "all 0.2s",
      // backgroundColor, color, border는 variant가 제어하므로 제외
    },
    tablet: {},
    mobile: {
      padding: "10px 20px",
      fontSize: "14px",
    },
  },
};

/**
 * Button 렌더 컴포넌트
 */
interface ButtonProps {
  node: ComponentNode;
  mergedStyles: React.CSSProperties;
  children?: React.ReactNode;
}

export function Button({ node, mergedStyles }: ButtonProps) {
  const { text = "버튼", variant = "primary" } = node.props;

  // Variant별 스타일 매핑
  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: "#3b82f6",
      color: "#ffffff",
      border: "none",
    },
    secondary: {
      backgroundColor: "#f4f4f5",
      color: "#18181b",
      border: "none",
    },
    danger: {
      backgroundColor: "#dc2626",
      color: "#ffffff",
      border: "none",
    },
    outline: {
      backgroundColor: "transparent",
      color: "#18181b",
      border: "1px solid #e4e4e7",
    },
    ghost: {
      backgroundColor: "transparent",
      color: "#18181b",
      border: "none",
    },
  };

  // 기본 스타일
  const baseStyle: React.CSSProperties = {
    padding: "12px 24px",
    fontSize: "16px",
    fontWeight: "500",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  };

  // mergedStyles에서 wrapper가 담당할 레이아웃 속성 제외
  const {
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
    // variant가 제어하는 속성들은 제외 (variant를 덮어쓰지 않도록)
    backgroundColor,
    color,
    border,
    ...buttonStyles
  } = mergedStyles;

  // 최종 스타일: 기본 → mergedStyles → variant 순으로 병합
  // variant를 마지막에 병합하여 항상 적용되도록
  const buttonStyle: React.CSSProperties = {
    ...baseStyle,
    ...buttonStyles,
    ...variantStyles[variant as string],
  };

  return (
    <button type="button" style={buttonStyle} data-variant={variant}>
      {text}
    </button>
  );
}
