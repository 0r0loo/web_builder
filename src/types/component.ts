import type React from "react";

/**
 * 빌더에서 지원하는 컴포넌트 타입
 */
export type ComponentType =
  | "container"
  | "text"
  | "heading"
  | "paragraph"
  | "button"
  | "image"
  | "link"
  | "section"
  | "grid"
  | "flex"
  | "spacer";

/**
 * 컴포넌트 라이브러리에서의 분류 카테고리
 */
export type ComponentCategory = "layout" | "content" | "media" | "form";

/**
 * 반응형 디자인 브레이크포인트
 */
export type Breakpoint = "mobile" | "tablet" | "desktop";

/**
 * 브레이크포인트별 반응형 스타일
 */
export interface ResponsiveStyles {
  mobile?: React.CSSProperties;
  tablet?: React.CSSProperties;
  desktop?: React.CSSProperties;
}

/**
 * 페이지 트리의 단일 컴포넌트를 나타내는 노드
 */
export interface ComponentNode {
  id: string;
  type: ComponentType;
  props: Record<string, any>;
  styles: ResponsiveStyles;
  children?: ComponentNode[];
}

/**
 * 컴포넌트 편집 UI를 위한 속성 정의
 */
export interface PropDefinition {
  name: string;
  label: string;
  type: "text" | "number" | "color" | "select" | "boolean" | "textarea";
  defaultValue: any;
  options?: Array<{ label: string; value: any }>;
}

/**
 * 컴포넌트 라이브러리에 등록하기 위한 컴포넌트 정의
 */
export interface ComponentDefinition {
  type: ComponentType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  category: ComponentCategory;
  defaultProps: Record<string, any>;
  defaultStyles: ResponsiveStyles;
  editableProps: PropDefinition[];
  render: (
    props: any,
    styles: React.CSSProperties,
    children?: React.ReactNode,
  ) => React.ReactNode;
}
