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
			gap: "16px",
			padding: "24px",
			backgroundColor: "#ffffff",
			borderRadius: "8px",
			border: "1px solid #e5e7eb",
		},
		tablet: {
			padding: "20px",
		},
		mobile: {
			padding: "16px",
			gap: "12px",
		},
	},
};

/**
 * Container 렌더 컴포넌트
 * 스타일은 ComponentRenderer의 wrapper div에 이미 적용되므로
 * 여기서는 children만 렌더링
 */
interface ContainerProps {
	node: ComponentNode;
	children?: React.ReactNode;
}

export function Container({ children }: ContainerProps) {
	return <>{children}</>;
}
