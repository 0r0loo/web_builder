import { Box } from "lucide-react";
import type { ComponentNode } from "@/types/component";
import type { ComponentMetadata } from "../types";

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
      flexWrap: "wrap",
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
  mergedStyles: React.CSSProperties;
  children?: React.ReactNode;
}

export function Container({ children }: ContainerProps) {
  // Container는 순수 레이아웃 컴포넌트
  // 모든 스타일은 ComponentRenderer의 wrapper에 적용되므로
  // 여기서는 children만 반환
  return <>{children}</>;
}
