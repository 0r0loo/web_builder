import type { ComponentNode } from "@/types/component";
import type { ComponentMetadata } from "../types";
import { Link as LinkIcon } from "lucide-react";
import NextLink from "next/link";

/**
 * Link 컴포넌트 메타데이터
 */
export const linkMetadata: ComponentMetadata = {
  type: "link",
  label: "링크",
  description: "다른 페이지나 외부 URL로 이동하는 링크",
  category: "navigation",
  icon: LinkIcon,
  allowChildren: false,
  defaultProps: {
    text: "링크",
    pageId: "", // 내부 페이지 ID
    href: "", // 외부 URL
    target: "_self", // _self, _blank
  },
  defaultStyles: {
    desktop: {
      color: "#3b82f6",
      textDecoration: "underline",
      cursor: "pointer",
      fontSize: "16px",
    },
    tablet: {},
    mobile: {},
  },
};

/**
 * Link 렌더 컴포넌트
 */
interface LinkProps {
  node: ComponentNode;
  mergedStyles: React.CSSProperties;
  children?: React.ReactNode;
}

export function Link({ node, mergedStyles }: LinkProps) {
  const {
    text = "링크",
    pageId = "",
    href = "",
    target = "_self",
  } = node.props;

  // 기본 스타일
  const baseStyle: React.CSSProperties = {
    color: "#3b82f6",
    textDecoration: "underline",
    cursor: "pointer",
    fontSize: "16px",
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
    width,
    height,
    maxWidth,
    minWidth,
    maxHeight,
    minHeight,
    ...linkStyles
  } = mergedStyles;

  // 최종 스타일 병합
  const finalStyle: React.CSSProperties = {
    ...baseStyle,
    ...linkStyles,
  };

  // 내부 페이지 링크 (pageId가 있으면)
  if (pageId) {
    return (
      <NextLink href={`/preview/${pageId}`} target={target as string}>
        <span style={finalStyle}>{text}</span>
      </NextLink>
    );
  }

  // 외부 URL 링크 (href가 있으면)
  if (href) {
    return (
      <a
        href={href as string}
        target={target as string}
        rel={target === "_blank" ? "noopener noreferrer" : undefined}
        style={finalStyle}
      >
        {text}
      </a>
    );
  }

  // 아무것도 없으면 일반 텍스트
  return <span style={finalStyle}>{text}</span>;
}