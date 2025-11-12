import { MousePointerClick } from "lucide-react";
import type { Action } from "@/types/action";
import type { ComponentNode } from "@/types/component";
import type { ComponentMetadata } from "../types";

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
    action: { type: "none" }, // 기본 액션: 없음
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
  isEditorMode?: boolean;
  onPageChange?: (pageId: string) => void;
}

export function Button({
  node,
  mergedStyles,
  isEditorMode = false,
  onPageChange,
}: ButtonProps) {
  const { text = "버튼", variant = "primary", action } = node.props;

  // Action 처리 함수
  const handleClick = (e: React.MouseEvent) => {
    const buttonAction = action as Action | undefined;

    console.log("🔘 Button clicked!", {
      isEditorMode,
      action: buttonAction,
      text,
    });

    if (!buttonAction || buttonAction.type === "none") {
      console.log("⚠️ No action configured");
      // 에디터 모드에서는 버튼 선택을 위해 이벤트를 막지 않음
      return;
    }

    if (buttonAction.type === "link") {
      if (buttonAction.linkType === "internal" && buttonAction.pageId) {
        // 에디터 모드에서는 페이지 전환 콜백 호출
        if (isEditorMode && onPageChange) {
          e.preventDefault();
          e.stopPropagation(); // 컴포넌트 선택 방지
          onPageChange(buttonAction.pageId);
          console.log("✅ Editor mode: Page changed to", buttonAction.pageId);
          return;
        }

        // 프리뷰 모드에서는 실제 페이지 이동
        window.location.href = `/preview/${buttonAction.pageId}`;
      } else if (buttonAction.linkType === "external" && buttonAction.href) {
        // 에디터 모드에서는 외부 URL 이동 방지
        if (isEditorMode) {
          e.preventDefault();
          e.stopPropagation();
          console.log(
            "⚠️ Editor mode: External link prevented",
            buttonAction.href,
          );
          return;
        }

        // 프리뷰 모드에서는 외부 URL 이동
        if (buttonAction.target === "_blank") {
          window.open(buttonAction.href, "_blank", "noopener,noreferrer");
        } else {
          window.location.href = buttonAction.href;
        }
      }
    }

    // Phase 2+: modal, api, custom 처리 추가 예정
  };

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
    position: _position,
    top: _top,
    left: _left,
    right: _right,
    bottom: _bottom,
    margin: _margin,
    marginTop: _marginTop,
    marginBottom: _marginBottom,
    marginLeft: _marginLeft,
    marginRight: _marginRight,
    zIndex: _zIndex,
    // variant가 제어하는 속성들은 제외 (variant를 덮어쓰지 않도록)
    backgroundColor: _backgroundColor,
    color: _color,
    border: _border,
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
    <button
      type="button"
      style={buttonStyle}
      data-variant={variant}
      onClick={handleClick}
    >
      {text as string}
    </button>
  );
}
