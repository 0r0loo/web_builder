import type { LucideIcon } from "lucide-react";
import type { ComponentNode, ComponentType } from "@/types/component";

/**
 * 컴포넌트 카테고리
 */
export type ComponentCategory =
  | "layout" // 레이아웃 (Container, Section, Grid 등)
  | "typography" // 타이포그래피 (Text, Heading, Paragraph)
  | "form" // 폼 요소 (Input, Button, Select)
  | "media" // 미디어 (Image, Video)
  | "navigation"; // 네비게이션 (Link, Menu)

/**
 * 컴포넌트 메타데이터
 * 컴포넌트 라이브러리에 표시될 정보
 */
export interface ComponentMetadata {
  /** 컴포넌트 타입 (고유 식별자) */
  type: ComponentType;

  /** 표시 이름 */
  label: string;

  /** 설명 */
  description: string;

  /** 카테고리 */
  category: ComponentCategory;

  /** 아이콘 (Lucide React) */
  icon: LucideIcon;

  /** 기본 props */
  defaultProps: Record<string, any>;

  /** 기본 스타일 (반응형) */
  defaultStyles: ComponentNode["styles"];

  /** 자식 요소 허용 여부 */
  allowChildren: boolean;

  /** 기본 자식 요소 (생성 시 자동 추가) */
  defaultChildren?: ComponentNode[];
}

/**
 * 컴포넌트 레지스트리 맵
 */
export type ComponentRegistry = Map<ComponentType, ComponentMetadata>;
