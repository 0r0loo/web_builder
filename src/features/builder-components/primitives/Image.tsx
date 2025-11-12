import type { ComponentNode } from "@/types/component";
import type { ComponentMetadata } from "../types";
import { ImageIcon } from "lucide-react";

/**
 * Image 컴포넌트 메타데이터
 */
export const imageMetadata: ComponentMetadata = {
  type: "image",
  label: "이미지",
  description: "이미지를 표시하는 요소",
  category: "media",
  icon: ImageIcon,
  allowChildren: false,
  defaultProps: {
    src: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800",
    alt: "이미지 설명",
    objectFit: "cover",
  },
  defaultStyles: {
    desktop: {
      width: "100%",
      height: "auto",
      borderRadius: "8px",
    },
    tablet: {},
    mobile: {},
  },
};

/**
 * Image 렌더 컴포넌트
 */
interface ImageProps {
  node: ComponentNode;
  mergedStyles: React.CSSProperties;
  children?: React.ReactNode;
}

export function Image({ node, mergedStyles }: ImageProps) {
  const {
    src = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800",
    alt = "이미지 설명",
    objectFit = "cover",
  } = node.props;

  // 기본 스타일
  const baseStyle: React.CSSProperties = {
    width: "100%",
    height: "auto",
    borderRadius: "8px",
    objectFit: objectFit as any,
    display: "block",
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
    zIndex,
    ...imageStyles
  } = mergedStyles;

  // 최종 스타일 병합
  const imageStyle: React.CSSProperties = {
    ...baseStyle,
    ...imageStyles,
  };

  return (
    <img
      src={src as string}
      alt={alt as string}
      style={imageStyle}
      draggable={false}
    />
  );
}
